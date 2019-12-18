import { GeneratedResult, generateFunctionExecution, generateImport, Import, generateJson, File, getFiles, generateLazyLoading, generateShare } from "../index"

/**
 * base interface for a generatable
 * (a generatable is capable of generating the result by calling generate() )
 */
export interface Generatable {

    /**
     * generate files
     * @param mainFileName optional name for the entry file
     */
    generate(mainFileName?: string): Array<File>

    /**
     * generate a result
     */
    generateResult(): GeneratedResult

}

/**
 * the baseclass for all Generatables
 */
export abstract class BaseGeneratable implements Generatable {

    public generate(mainFileName: string = "index.ts"): Array<File> {
        let result = this.generateResult()
        return getFiles(result, mainFileName)
    }

    abstract generateResult(): GeneratedResult

}

/*export class GeneratableArray<A extends Array<Generatable> = Array<Generatable>> extends BaseGeneratable {

    protected array: A

    constructor(
        ...array: A
    ) {
        super()
        this.array = array
    }

    update(...array: A): void {
        this.array = array
    }

    generateResult(): GeneratedResult {
        let arrayResult = this.array.reduce((prev, cur) => prev.concat([ cur.generateResult() ]), <Array<GeneratedResult>>[])
        return generateArray(arrayResult)
    }

}

export type GObject = {
    [Name in string]: Generatable
}

export class GeneratableObject<O extends GObject = GObject> extends BaseGeneratable {

    constructor(
        protected object: O
    ) {
        super()
    }

    update(object: O): void {
        this.object = object
    }

    generateResult(): GeneratedResult {
        let objectResult = Object.entries(this.object).map(([name, compileable]) => [name, compileable.generateResult()] as [string, GeneratedResult])
        return generateObject(objectResult)
    }

}*/

/**
 * generatable for a json value
 */
export class GeneratableJSON<V = any> extends BaseGeneratable {

    /**
     * json generatable constructor
     * @param value the json value to generate code from
     */
    constructor(
        protected value: V
    ) {
        super()
    }

    update(value: V): void {
        this.value = value
    }

    generateResult(): GeneratedResult {
        return generateJson(this.value)
    }

}

/**
 * generatable for an import
 */
export class GeneratableImport extends BaseGeneratable {

    /**
     * import generatable constructor
     * @param imp the import to generate code from
     */
    constructor(
        protected imp: Import
    ) {
        super()
    }

    /**
     * change the import
     * @param imp the new import
     */
    update(imp: Import): void {
        this.imp = imp
    }

    generateResult(): GeneratedResult {
        return generateImport(this.imp)
    }

}

/**
 * generatable for a function execution
 */
export class GenertableFunctionExecution<Func extends Generatable = Generatable, Parameters extends Array<Generatable> = Array<Generatable>> extends BaseGeneratable {

    protected parameters: Parameters

    /**
     * function execution generatable constructor
     * @param func the function to generate code from
     * @param paramters the parameters to execute the function with in the code
     */
    constructor(
        protected func: Func,
        ...paramters: Parameters
    ) {
        super()
        this.parameters = paramters
    }

    /**
     * change the function and parameters
     * @param func the new function
     * @param parameters the new parameters for that function
     */
    update(func: Func, ...parameters: Parameters): void {
        this.func = func
        this.parameters = parameters
    }

    generateResult(): GeneratedResult {
        let funcResult = this.func.generateResult()
        let parametersResult = this.parameters.map(parameter => parameter.generateResult())
        return generateFunctionExecution(funcResult, ...parametersResult)
    }

}

/**
 * generatable for a lazy loadable
 */
export class GeneratableLazyLoading<G extends Generatable = Generatable> extends BaseGeneratable {

    /**
     * lazy loadable generatable constructor
     * @param generatable the generatable that represents the value to generate a lazy loadable in code from
     * @param filename the optional name of the file that should be generated to load from
     */
    constructor(
        protected generatable: G,
        private filename: string | undefined = undefined
    ) {
        super()
    }

    /**
     * change the lazy loadable value
     * @param generatable the generatable that represents the new value
     */
    update(generatable: G): void {
        this.generatable = generatable
    }
    
    generateResult(): GeneratedResult {
        let result = this.generatable.generateResult()
        return generateLazyLoading(result, this.filename)
    }

}

/**
 * generatable for a share
 */
export class GeneratableShare<G extends Generatable = Generatable> extends BaseGeneratable {

    /**
     * share generatable constructor
     * @param generatable the generatable that represents the value to generata a constant value in code from
     */
    constructor(
        protected generatable: G
    ) {
        super()
    }

    /**
     * change the shared value
     * @param generatable the new generatable that represents the value that should be shared
     */
    update(generatable: G): void {
        this.generatable = generatable
    }

    generateResult(): GeneratedResult {
        let result = this.generatable.generateResult()
        if(this.generatable instanceof GeneratableImport) {
            return result
        } else {
            return generateShare(result)
        }
    }

}