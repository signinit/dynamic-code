import { SplittedData } from "./splitted-data"
import { resolve } from "path"

//TODO rename to generator

export type CompilationResult = {
    externalFiles: Array<File>
    imports: Array<string>
    code: string
}

export type File = {
    name: string,
    data: string
}

export abstract class Compileable<T = any> {

    abstract compileValue(): T

    public compile(mainFileName: string = "index.ts"): Array<File> {
        let { externalFiles, imports, code } = this.compileResult()
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

    abstract compileResult(): CompilationResult

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

    getStatement(variableName: string): string {
        return `import { ${this.element} as ${variableName} } from "${this.path}";`
    }

    constructor(private element: string, path: string) {
        super(path)
    }

}

export class AllImport extends Import {

    getStatement(variableName: string): string {
        return `import * as ${variableName} from "${this.path}";`
    }

    constructor(path: string) {
        super(path)
    }

}
export type GetCompileableArray<Parameters extends Array<any>> = {
    [Index in keyof Parameters]: Compileable<Parameters[Index]>
}

export class CompileableArray<T extends Array<any>> extends Compileable<T> {

    private array: GetCompileableArray<T>

    constructor(
        ...array: GetCompileableArray<T>
    ) {
        super()
        this.array = array
    }

    compileResult(): CompilationResult {
        let compiledArray = this.array.reduce((prev, cur) => prev.concat([ cur.compileResult() ]), <Array<CompilationResult>>[])
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

    compileValue(): T {
        return this.array.reduce((prev, cur) => prev.concat([ cur.compileValue() ]), <Array<any>>[]) as T
    }

}

export type Object = {
    [Name: string]: any
}

export type GetCompileableObject<O extends Object> = {
    [Name in keyof O]: Compileable<O[Name]>
}

export class CompileableObject<T extends Object> extends Compileable<T> {

    constructor(
        private object: GetCompileableObject<T>
    ) {
        super()
    }

    compileValue(): T {
        return Object.entries(this.object).reduce((prev, [name, compileable]) => {
            prev[name] = compileable.compileValue()
            return prev
        }, {} as any)
    }

    compileResult(): CompilationResult {
        let entries = Object.entries(this.object).map(([name, compileable]) => [name, compileable.compileResult()] as [string, CompilationResult])
        return {
            code: `{${
                entries.map(([name, compileable]) => `"${name}":${compileable.code}`).join(",")
            }}`,
            imports: entries.reduce((prev, [_name, compilationResult]) => prev.concat(compilationResult.imports), <Array<string>>[]),
            externalFiles: entries.reduce((prev, [_name, compilationResult]) =>prev.concat(compilationResult.externalFiles), <Array<File>>[])
        }
    }

}

export class CompileableJSON<T> extends Compileable<T> {

    constructor(
        private value: T
    ) {
        super()
    }

    compileValue(): T {
        return this.value
    }

    compileResult(): CompilationResult {
        return {
            code: JSON.stringify(this.value),
            externalFiles: [],
            imports: []
        }
    }

}

export class CompileableImport<T> extends Compileable<T> {

    constructor(
        private value: T,
        private imp: Import
    ) {
        super()
    }

    compileResult(): CompilationResult {
        let variableName = randomVarName()
        return {
            code: variableName,
            externalFiles: [],
            imports: [
                this.imp.getStatement(variableName)
            ]
        }
    }

    compileValue(): T {
        return this.value
    }

}

export class CompileableFunctionExecution<Result, Parameters extends Array<any>> extends Compileable<Result> {

    compileValue(): Result {
        let parameters = this.parameters.map(parameter => parameter.compileValue()) as Parameters
        return this.func.compileValue()(...parameters)
    }
    private parameters:  GetCompileableArray<Parameters>

    constructor(
        private func: Compileable<(...params: Parameters) => Result>,
        ...paramters: GetCompileableArray<Parameters>
    ) {
        super()
        this.parameters = paramters
    }

    compileResult(): CompilationResult {
        let { code, externalFiles, imports } = this.func.compileResult()
        let parameters = this.parameters.map(parameter => parameter.compileResult()) as Array<CompilationResult>
        return {
            code: `${code}(${parameters.map(parameter => parameter.code).join(",")});`,
            externalFiles: parameters.reduce((prev, cur) => prev.concat(cur.externalFiles), <Array<File>>[]).concat(externalFiles),
            imports: parameters.reduce((prev, cur) => prev.concat(cur.imports), <Array<string>>[]).concat(imports)
        }
    }

}

export class CompileableSplit<T> extends Compileable<SplittedData<T>> {

    constructor(
        private compileable: Compileable<T>,
        private filename: string | undefined = undefined
    ) {
        super()
    }

    compileValue(): SplittedData<T> {
        return {
            type: "static",
            value: this.compileable.compileValue()
        }
    }
    
    compileResult(): CompilationResult {
        let { code, imports, externalFiles } = this.compileable.compileResult()
        let filename: string
        if(this.filename == null) {
            filename = `${guid()}.ts`
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
function guid() {
    return "ss-s-s-s-sss".replace(/s/g, () => Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1));
}

export function randomVarName() {
    return "ssssssss".replace(/s/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
}