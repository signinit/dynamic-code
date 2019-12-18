import { Generatable, GeneratableJSON, GenertableFunctionExecution, GeneratableLazyLoading, BaseGeneratable, GeneratableShare } from "../generatable";
import { Import, generateImport, GeneratedResult } from "../index";

/**
 * base interface for a hybrid generatable
 * (it extends all the functions of an Generatable but can also compute the result of the generated code)
 */
export interface HybridGeneratable<T = any> extends Generatable {

    /**
     * generate the value that would be calculated by the generated code
     * @param generationId 
     */
    generateValue(generationId: number | undefined): T

}

/*export class HybridGeneratableArray<T extends Array<any> = []> extends GeneratableArray implements HybridGeneratable<T> {

    constructor(array: GetHybridGeneratableArray<T>) {
        super(...array)
    }

    generateValue(): T {
        return this.array.map(item => (item as HybridGeneratable).generateValue()) as T
    }
}

export class HybridGeneratableObject<T extends Object = any> extends GeneratableObject implements HybridGeneratable<T> {

    constructor(object: GetHybridGeneratableObject<T>) {
        super(object)
    }

    generateValue(): T {
        return Object.entries(this.object as GetHybridGeneratableObject<T>)
            .map(([name, entry]) => ([name, entry.generateValue()]) as [keyof T, T[string]])
            .reduce((prev, [name, value]) => prev[name] = value, <T>{})
    }

}

export type Object = {
    [Name in string]: any
}

export type GetHybridGeneratableObject<O extends Object> = {
    [Name in keyof O]: HybridGeneratable<O[Name]>
}*/

/**
 * hybrid generatable for a json value
 */
export class HybridGeneratableJSON<T = any> extends GeneratableJSON<T> implements HybridGeneratable<T> {

    generateValue(): T {
        return this.value
    }
}

/**
 * hybrid generatable for an import
 */
export class HybridGeneratableImport<T = any> extends BaseGeneratable implements HybridGeneratable<T> {

    /**
     * import generatable constructor
     * @param value the value that should be imported
     * @param imp the import to generate code from
     */
    constructor(
        protected value: T,
        protected imp: Import
    ) {
        super()
    }

    /**
     * change the import
     * @param value the value that should be imported
     * @param imp the new import
     */
    update(value: T, imp: Import): void {
        this.value = value
        this.imp = imp
    }

    generateValue() {
        return this.value
    }

    generateResult(): GeneratedResult {
        return generateImport(this.imp)
    }

}

/**
 * hybrid generatable for a function execution
 */
export class HybridGenertableFunctionExecution<Parameters extends Array<any> = [], Result = any> extends GenertableFunctionExecution<HybridGeneratable<(...parameters: Parameters) => Result>, GetHybridGeneratableArray<Parameters>> implements HybridGeneratable<Result> {

    private generationId: number | undefined

    generateValue(generationId: number): Result {
        if(generationId == null) {
            generationId = this.generationId != null ? this.generationId + 1 : 0
            this.generationId = generationId 
        }
        let parameters = this.parameters.map(param => param.generateValue(generationId)) as Parameters
        let func = this.func.generateValue(generationId)
        return func(...parameters)
    }

}

/**
 * hybrid generatable for a lazy loadable
 */
export class HybridGeneratableLazyLoading<T = any> extends GeneratableLazyLoading<HybridGeneratable<T>> implements HybridGeneratable<Promise<T>> {

    private generationId: number | undefined

    generateValue(generationId: number | undefined): Promise<T> {
        if(generationId == null) {
            generationId = this.generationId != null ? this.generationId + 1 : 0
            this.generationId = generationId 
        }
        return new Promise(resolve => resolve(this.generatable.generateValue(generationId)))
    }

}

/**
 * hybrid generatable for a share
 */
export class HybridGeneratableShare<T = any> extends GeneratableShare<HybridGeneratable<T>> implements HybridGeneratable<T> {

    private lastGenerationId: number | undefined
    private lastValue: T | undefined

    generateValue(generationId: number | undefined): T {
        if(generationId == null) {
            throw new Error("generatable share must have an generation id")
        }
        if(generationId != this.lastGenerationId) {
            this.lastGenerationId = generationId
            this.lastValue = this.generatable.generateValue(generationId)
        }
        return this.lastValue!
    }

}

/**
 * type for transforming an array of values to an array of Hybrid Generatable of values
 */
export type GetHybridGeneratableArray<Parameters extends Array<any>> = {
    [Index in keyof Parameters]: HybridGeneratable<Parameters[Index]>
}