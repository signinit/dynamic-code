import { Generatable, GeneratableJSON, GenertableFunctionExecution, GeneratableLazyLoading, BaseGeneratable, GeneratableShare } from "../generatable";
import { Import, generateImport, GeneratedResult } from "..";

export interface HybridGeneratable<T = any> extends Generatable {

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

export class HybridGeneratableJSON<T = any> extends GeneratableJSON<T> implements HybridGeneratable<T> {

    generateValue(): T {
        return this.value
    }
}

export class HybridGeneratableImport<T = any> extends BaseGeneratable implements HybridGeneratable<T> {

    constructor(
        protected value: T,
        protected imp: Import
    ) {
        super()
    }

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

export type GetHybridGeneratableArray<Parameters extends Array<any>> = {
    [Index in keyof Parameters]: HybridGeneratable<Parameters[Index]>
}