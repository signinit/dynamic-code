import { resolve } from "path"

export * from "./generatable"
export * from "./hybrid-generatable"
export * from "./generator"
export * from "./hybrid-generator"

export type GeneratedResult = {
    externalFiles: Array<File>
    imports: Array<string>
    constants: Array<Constant>
    code: string
}

export type Constant = {
    name: string,
    value: string
}

export type File = {
    name: string,
    data: string
}

//core generate functions

/*export function generateArray(array: Array<GeneratedResult>): GeneratedResult {
    return {
        code: `[${
            array
                .map(element => element.code)
                .join(",")
        }]`,
        imports: array.reduce((prev, cur) => prev.concat(cur.imports), <Array<string>>[]),
        externalFiles: array.reduce((prev, cur) => prev.concat(cur.externalFiles), <Array<File>>[])
    }
}

export function generateObject(object: Array<[ string, GeneratedResult ]>): GeneratedResult {
    return {
        code: `{${
            object.map(([name, compileable]) => `"${name}":${compileable.code}`).join(",")
        }}`,
        imports: object.reduce((prev, [_name, compilationResult]) => prev.concat(compilationResult.imports), <Array<string>>[]),
        externalFiles: object.reduce((prev, [_name, compilationResult]) =>prev.concat(compilationResult.externalFiles), <Array<File>>[])
    }
}*/

export function generateJson(json: any): GeneratedResult {
    return {
        code: JSON.stringify(json),
        externalFiles: [],
        constants: [],
        imports: []
    }

}

export function generateImport(imp: Import): GeneratedResult {
    let variableName = randomVarName()
    return {
        code: variableName,
        externalFiles: [],
        imports: [
            imp.getStatement(variableName)
        ],
        constants: []
    }

}

export function generateFunctionExecution(func: GeneratedResult, ...parameters: Array<GeneratedResult>): GeneratedResult {
    return {
        code: `${func.code}(${parameters.map(parameter => parameter.code).join(",")});`,
        externalFiles: parameters.reduce((prev, cur) => prev.concat(cur.externalFiles), <Array<File>>[]).concat(func.externalFiles),
        imports: parameters.reduce((prev, cur) => prev.concat(cur.imports), <Array<string>>[]).concat(func.imports),
        constants: parameters.reduce((prev, cur) => prev.concat(cur.constants), <Array<Constant>>[]).concat(func.constants)
    }
}

export function generateLazyLoading(result: GeneratedResult, filename?: string): GeneratedResult {
    if(filename == null) {
        filename = `${randomFileName()}.ts`
    }
    return {
        code: `import("/${filename}").then(module => module.default)`,
        externalFiles: result.externalFiles.concat({
            name: filename,
            data: `${result.imports.join("\n")};export default ${result.code}`
        }),
        imports: result.imports,
        constants: result.constants
    }
}

export function generateShare(result: GeneratedResult): GeneratedResult {
    let variableName = randomVarName()
    return {
        code: variableName,
        constants: result.constants.concat({
            name: variableName,
            value: result.code
        }),
        externalFiles: result.externalFiles,
        imports: result.imports
    }
}

export function getFiles(result: GeneratedResult, mailFilename: string = "index.ts"): Array<File> {
    //TODO merge imports
    let mainFile: File = {
        name: mailFilename,
        data: `${
            result.imports.map(imp => imp + "\n").join("")
        }${
            result.constants.map(constant => `const "${constant.name}" = ${constant.value}\n`).join("")
        }${
            result.code
        }`
    }
    return result.externalFiles.concat(mainFile)
}


/**
 * creates a random globally unique filename
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