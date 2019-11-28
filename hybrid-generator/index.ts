import { Observable, BehaviorSubject, Subject, combineLatest } from "rxjs"
import { map, switchMap, shareReplay } from "rxjs/operators"
import { Generator, GeneratorJSON, BaseGenerator, GeneratorFunctionExecution, GeneratorLazyLoading, GeneratorShare } from "../generator"
import { Import, GeneratedResult, generateImport } from ".."

export interface HybridGenerator<T = any> extends Generator {

    value: Observable<T>

}

export class HybridGeneratorJSON<T = any> extends GeneratorJSON<T> implements HybridGenerator<T> {

    value: Observable<T> = this.valueSubject

}

export class HybridGeneratorImport<T = any> extends BaseGenerator implements HybridGenerator<T> {
    
    result: Observable<GeneratedResult>
    value: Subject<T>
    importSubject: Subject<Import>

    constructor(value: T, imp: Import) {
        super()
        this.value = new BehaviorSubject<T>(value)
        this.importSubject = new BehaviorSubject<Import>(imp)
        this.result = this.importSubject.pipe(
            map(imp => generateImport(imp))
        )
    }

    update(value: T, imp: Import) {
        this.importSubject.next(imp)
        this.value.next(value)
    }

}

export type GetHybridGeneratorArray<Parameters extends Array<any>> = {
    [Index in keyof Parameters]: HybridGenerator<Parameters[Index]>
}

export class HybridGeneratorFunctionExecution<Parameters extends Array<any> = Array<any>, Result = any> extends GeneratorFunctionExecution<HybridGenerator<(...parameters: Parameters) => Result>, GetHybridGeneratorArray<Parameters>> implements HybridGenerator<Result> {
    
    value: Observable<any>

    constructor(
        func: HybridGenerator<(...parameters: Parameters) => Result>,
        ...parameters: GetHybridGeneratorArray<Parameters>
    ) {
        super(func, ...parameters as any)
        this.value = this.funcParamSubject.pipe(
            switchMap(({ func, parameters }) =>
                combineLatest(func.value, ...parameters.map(param => param.value))
            ),
            map(([func, ...parameters]) => func(...parameters))
        )
    }
    
}

export class HybridGeneratorLazyLoading<T = any> extends GeneratorLazyLoading<HybridGenerator<T>> implements HybridGenerator<Promise<T>> {

    value: Observable<Promise<T>>

    constructor(generator: HybridGenerator<T>) {
        super(generator)
        this.value = this.generatorSubject.pipe(
            switchMap(generator => generator.value),
            map(value => new Promise<T>(resolve => resolve(value)))
        )
    }

}

export class HybridGeneratorShare<T = any> extends GeneratorShare<HybridGenerator<T>> implements HybridGenerator<T> {

    value: Observable<T> = this.generatorSubject.pipe(
        switchMap(generator => generator.value),
        shareReplay(1)
    )

}