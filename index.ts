import { resolve } from "path"

export * from "./generatable"
export * from "./hybrid-generatable"
export * from "./generator"
export * from "./hybrid-generator"

/**
 * the result of generating dynamic code
 */
export type GeneratedResult = {
    externalFiles: Array<File>
    imports: Array<string>
    constants: Array<Constant>
    code: string
}

/**
 * describes a contant value
 */
export type Constant = {
    name: string,
    value: string
}

/**
 * a plan file that was generated
 */
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

/**
 * generates a result from a json value
 * @param json the value that should be generated to code
 */
export function generateJson(json: any): GeneratedResult {
    return {
        code: JSON.stringify(json),
        externalFiles: [],
        constants: [],
        imports: []
    }

}

/**
 * generates a result from an import
 * @param imp the import specification (import all, import element, import default)
 */
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

/**
 * generates a result from a executing a function and some parameters
 * @param func the function that should be executed
 * @param parameters the parameters of the function
 */
export function generateFunctionExecution(func: GeneratedResult, ...parameters: Array<GeneratedResult>): GeneratedResult {
    return {
        code: `${func.code}(${parameters.map(parameter => parameter.code).join(",")});`,
        externalFiles: parameters.reduce((prev, cur) => prev.concat(cur.externalFiles), <Array<File>>[]).concat(func.externalFiles),
        imports: parameters.reduce((prev, cur) => prev.concat(cur.imports), <Array<string>>[]).concat(func.imports),
        constants: parameters.reduce((prev, cur) => prev.concat(cur.constants), <Array<Constant>>[]).concat(func.constants)
    }
}

/**
 * generates a result that lazy loades a value
 * @param result the value that should be lazy loaded
 * @param filename an optional name for the file where the lazy loadable part is written to and later loaded from
 */
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

/**
 * generates a result that shares a value
 * (consider the result of a function, without a share, each time the result is referenced it would be reexecuted)
 * @param result the value that should be shared
 */
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

/**
 * transforms a generated result into files
 * @param result the result that should be transformed to files
 * @param mailFilename an optional name for the entry file
 */
export function getFiles(result: GeneratedResult, mailFilename: string = "index.ts"): Array<File> {
    //TODO merge imports
    let mainFile: File = {
        name: mailFilename,
        data: `${
            result.imports.map(imp => imp + "\n").join("")
        }${
            result.constants.map(constant => `const ${constant.name} = ${constant.value}\n`).join("")
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

/**
 * the base class for all imports
 */
export abstract class Import {


    /**
     * the path to import from
     */
    protected path: string

    /**
     * import constructor
     * @param basePath the base path (insert __dirname here for the path to the current file)
     * @param path the path (realtive to the basepath) to import from
     */
    constructor(basePath: string, path: string) {
        this.path = resolve(basePath, path).replace(/\\/g, "\\\\")
    }

    /**
     * generate a statement
     * @param variableName the name of a variable where the imported value should be saved into
     */
    abstract getStatement(variableName: string): string

}

/**
 * the default import
 * ('import xyz from "./abc";')
 */
export class DefaultImport extends Import {

    getStatement(variableName: string): string {
        return `import ${variableName} from "${this.path}";`
    }

}

/**
 * the element import
 * ('import { xyz } from "./abc";')
 */
export class ElementImport extends Import {

    /**
     * element import constructor
     * @param basePath the base path (insert __dirname here for the path to the current file)
     * @param element the element that should be imported (the thing the the brackets)
     * @param path the path (realtive to the basepath) to import from
     */
    constructor(basePath: string, private element: string, path: string) {
        super(basePath, path)
    }

    getStatement(variableName: string): string {
        return `import { ${this.element} as ${variableName} } from "${this.path}";`
    }

}

/**
 * the star/all import
 * ('import * as xyz from "./abc";')
 */
export class AllImport extends Import {
    
    getStatement(variableName: string): string {
        return `import * as ${variableName} from "${this.path}";`
    }

}