import { SplittedData } from "./splitted-data"
import { resolve } from "path"

//TODO rename to generator

export type GeneratedResult = {
    externalFiles: Array<File>
    imports: Array<string>
    code: string
}

export type File = {
    name: string,
    data: string
}

export abstract class Generatable<T = any> {

    abstract generateValue(): T

    public generate(mainFileName: string = "index.ts"): Array<File> {
        let { externalFiles, imports, code } = this.generateResult()
        //TODO merge imports
        let mainFile: File = {
            name: mainFileName,
            data: `${
                imports.map(imp => imp + "\n").join("")
            }${
                code
            }`
        }
        return externalFiles.concat(mainFile)
    }

    abstract generateResult(): GeneratedResult

}

export abstract class Import {

    abstract getStatement(variableName: string): string

    protected path: string

    constructor(path: string) {
        this.path = resolve(__dirname, path).replace(/\\/g, "\\\\")
    }

}

export class DefaultImport extends Import {


    getStatement(variableName: string): string {
        return `import ${variableName} from "${this.path}";`
    }

}

export class ElementImport extends Import {

    constructor(private element: string, path: string) {
        super(path)
    }

    getStatement(variableName: string): string {
        return `import { ${this.element} as ${variableName} } from "${this.path}";`
    }

}

export class AllImport extends Import {

    constructor(path: string) {
        super(path)
    }
    
    getStatement(variableName: string): string {
        return `import * as ${variableName} from "${this.path}";`
    }

}
export type GetGeneratableArray<Parameters extends Array<any>> = {
    [Index in keyof Parameters]: Generatable<Parameters[Index]>
}

export class GeneratableArray<T extends Array<any>> extends Generatable<T> {

    private array: GetGeneratableArray<T>

    constructor(
        ...array: GetGeneratableArray<T>
    ) {
        super()
        this.array = array
    }

    generateResult(): GeneratedResult {
        let compiledArray = this.array.reduce((prev, cur) => prev.concat([ cur.generateResult() ]), <Array<GeneratedResult>>[])
        return {
            code: `[${
                compiledArray
                    .map(element => element.code)
                    .join(",")
            }]`,
            imports: compiledArray.reduce((prev, cur) => prev.concat(cur.imports), <Array<string>>[]),
            externalFiles: compiledArray.reduce((prev, cur) => prev.concat(cur.externalFiles), <Array<File>>[])
        }
    }

    generateValue(): T {
        return this.array.reduce((prev, cur) => prev.concat([ cur.generateValue() ]), <Array<any>>[]) as T
    }

}

export type Object = {
    [Name: string]: any
}

export type GetGeneratableObject<O extends Object> = {
    [Name in keyof O]: Generatable<O[Name]>
}

export class GeneratableObject<T extends Object> extends Generatable<T> {

    constructor(
        private object: GetGeneratableObject<T>
    ) {
        super()
    }

    generateValue(): T {
        return Object.entries(this.object).reduce((prev, [name, compileable]) => {
            prev[name] = compileable.generateValue()
            return prev
        }, {} as any)
    }

    generateResult(): GeneratedResult {
        let entries = Object.entries(this.object).map(([name, compileable]) => [name, compileable.generateResult()] as [string, GeneratedResult])
        return {
            code: `{${
                entries.map(([name, compileable]) => `"${name}":${compileable.code}`).join(",")
            }}`,
            imports: entries.reduce((prev, [_name, compilationResult]) => prev.concat(compilationResult.imports), <Array<string>>[]),
            externalFiles: entries.reduce((prev, [_name, compilationResult]) =>prev.concat(compilationResult.externalFiles), <Array<File>>[])
        }
    }

}

export class GeneratableJSON<T> extends Generatable<T> {

    constructor(
        private value: T
    ) {
        super()
    }

    setValue(value: T): void {
        this.value = value
    }

    generateValue(): T {
        return this.value
    }

    generateResult(): GeneratedResult {
        return {
            code: JSON.stringify(this.value),
            externalFiles: [],
            imports: []
        }
    }

}

export class GeneratableImport<T> extends Generatable<T> {

    constructor(
        private value: T,
        private imp: Import
    ) {
        super()
    }

    generateResult(): GeneratedResult {
        let variableName = randomVarName()
        return {
            code: variableName,
            externalFiles: [],
            imports: [
                this.imp.getStatement(variableName)
            ]
        }
    }

    generateValue(): T {
        return this.value
    }

}

export class GenertableFunctionExecution<Result, Parameters extends Array<any>> extends Generatable<Result> {

    generateValue(): Result {
        let parameters = this.parameters.map(parameter => parameter.generateValue()) as Parameters
        return this.func.generateValue()(...parameters)
    }
    private parameters:  GetGeneratableArray<Parameters>

    constructor(
        private func: Generatable<(...params: Parameters) => Result>,
        ...paramters: GetGeneratableArray<Parameters>
    ) {
        super()
        this.parameters = paramters
    }

    generateResult(): GeneratedResult {
        let { code, externalFiles, imports } = this.func.generateResult()
        let parameters = this.parameters.map(parameter => parameter.generateResult()) as Array<GeneratedResult>
        return {
            code: `${code}(${parameters.map(parameter => parameter.code).join(",")});`,
            externalFiles: parameters.reduce((prev, cur) => prev.concat(cur.externalFiles), <Array<File>>[]).concat(externalFiles),
            imports: parameters.reduce((prev, cur) => prev.concat(cur.imports), <Array<string>>[]).concat(imports)
        }
    }

}

export class GeneratableSplit<T> extends Generatable<SplittedData<T>> {

    constructor(
        private compileable: Generatable<T>,
        private filename: string | undefined = undefined
    ) {
        super()
    }

    generateValue(): SplittedData<T> {
        return {
            type: "static",
            value: this.compileable.generateValue()
        }
    }
    
    generateResult(): GeneratedResult {
        let { code, imports, externalFiles } = this.compileable.generateResult()
        let filename: string
        if(this.filename == null) {
            filename = `${randomFileName()}.ts`
        } else {
            filename = this.filename
        }
        
        return {
            code: `{
                type: "dynamic",
                load: () => import("/${filename}").then(module => module.default)
            }`,
            externalFiles: externalFiles.concat({
                name: filename,
                data: `${imports.join("\n")};export default ${code}`
            }),
            imports
        }
    }


}

/**
 * creates a random globally unique id
 */
function randomFileName() {
    return "ss-s-s-s-sss".replace(/s/g, () => Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1));
}

/**
 * creates a random globally unique variable name
 */
export function randomVarName() {
    return "ssssssss".replace(/s/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
}