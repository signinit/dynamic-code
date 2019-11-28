import { GeneratedResult, generateFunctionExecution, generateImport, Import, generateJson, File, getFiles, generateLazyLoadable as generateLazyLoading, generateShareable as generateShare } from ".."

export interface Generatable {

    generate(mainFileName?: string): Array<File>

    generateResult(): GeneratedResult

}

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

export class GeneratableJSON<V = any> extends BaseGeneratable {

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

export class GeneratableImport extends BaseGeneratable {

    constructor(
        protected imp: Import
    ) {
        super()
    }

    update(imp: Import): void {
        this.imp = imp
    }

    generateResult(): GeneratedResult {
        return generateImport(this.imp)
    }

}

export class GenertableFunctionExecution<Func extends Generatable = Generatable, Parameters extends Array<Generatable> = Array<Generatable>> extends BaseGeneratable {

    protected parameters: Parameters

    constructor(
        protected func: Func,
        ...paramters: Parameters
    ) {
        super()
        this.parameters = paramters
    }

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

export class GeneratableLazyLoading<G extends Generatable = Generatable> extends BaseGeneratable {

    constructor(
        protected generatable: G,
        private filename: string | undefined = undefined
    ) {
        super()
    }
    
    update(generatable: G): void {
        this.generatable = generatable
    }
    
    generateResult(): GeneratedResult {
        let result = this.generatable.generateResult()
        return generateLazyLoading(result, this.filename)
    }

}

export class GeneratableShare<G extends Generatable = Generatable> extends BaseGeneratable {

    constructor(
        protected generatable: G
    ) {
        super()
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