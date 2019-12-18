import { Observable, BehaviorSubject, Subject, combineLatest } from "rxjs"
import { map, switchMap, shareReplay } from "rxjs/operators"
import { Generator, GeneratorJSON, BaseGenerator, GeneratorFunctionExecution, GeneratorLazyLoading, GeneratorShare } from "../generator"
import { Import, GeneratedResult, generateImport } from "../index"

/**
 * base interface for a hybrid generator
 * (it extends all the functions of a generator but also emits the computed result)
 */
export interface HybridGenerator<T = any> extends Generator {

    /**
     * the observable that emits the computed result
     */
    value: Observable<T>

}

/**
 * hybrid generator for a json value
 */
export class HybridGeneratorJSON<T = any> extends GeneratorJSON<T> implements HybridGenerator<T> {

    value: Observable<T> = this.valueSubject

}

/**
 * hybrid generator for an import
 */
export class HybridGeneratorImport<T = any> extends BaseGenerator implements HybridGenerator<T> {
    
    result: Observable<GeneratedResult>
    value: Observable<T>
    private subject: Subject<{ value: T, imp: Import }>

    /**
     * import generator constructor
     * @param value the value that should be imported
     * @param imp the import that will be generated to code
     */
    constructor(value?: T, imp?: Import) {
        super()
        if(value != null && imp != null) {
            this.subject = new BehaviorSubject({
                value,
                imp
            })
        } else {
            this.subject = new Subject()
        }
        this.result = this.subject.pipe(
            map(({ imp }) => generateImport(imp))
        )
        this.value = this.subject.pipe(
            map(({ value}) => value)
        )
    }

    /**
     * change the import
     * (each update emits a new value and result)
     * @param value the value that should be imported
     * @param imp the new import
     */
    update(value: T, imp: Import) {
        this.subject.next({
            value,
            imp
        })
    }

}

/**
 * hybrid generator for a function execution
 */
export class HybridGeneratorFunctionExecution<Parameters extends Array<any> = Array<any>, Result = any> extends GeneratorFunctionExecution<HybridGenerator<(...parameters: Parameters) => Result>, GetHybridGeneratorArray<Parameters>> implements HybridGenerator<Result> {
    
    value: Observable<any>

    /**
     * function execution generator constructor
     * @param func the function that will be generated to code
     * @param parameters the parameters to execute the function with in the code
     */
    constructor(
        func?: HybridGenerator<(...parameters: Parameters) => Result>,
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

/**
 * hybrid generator for a lazy loadable
 */
export class HybridGeneratorLazyLoading<T = any> extends GeneratorLazyLoading<HybridGenerator<T>> implements HybridGenerator<Promise<T>> {

    value: Observable<Promise<T>>

    /**
     * lazy loadanble generator constructor
     * @param generator the generator that represents the value that will be generated to be lazy loaded
     * @param filename the optional name of the file that should be generated to load from
     */
    constructor(
        generator?: HybridGenerator<T>,
        filename: string | undefined = undefined
    ) {
        super(generator, filename)
        this.value = this.generatorSubject.pipe(
            switchMap(generator => generator.value),
            map(value => new Promise<T>(resolve => resolve(value)))
        )
    }

}

/**
 * hybrid generator for a share
 */
export class HybridGeneratorShare<T = any> extends GeneratorShare<HybridGenerator<T>> implements HybridGenerator<T> {

    value: Observable<T> = this.generatorSubject.pipe(
        switchMap(generator => generator.value),
        shareReplay(1)
    )

}


/**
 * type for transforming an array of values to an array of Hybrid Generators of values
 */
export type GetHybridGeneratorArray<Parameters extends Array<any>> = {
    [Index in keyof Parameters]: HybridGenerator<Parameters[Index]>
}