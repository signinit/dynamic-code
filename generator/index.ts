import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs"
import { map, switchMap, shareReplay } from "rxjs/operators"
import { GeneratedResult, getFiles, File, generateJson, Import, generateImport, generateFunctionExecution, generateLazyLoadable, generateShareable as generateShare } from "..";

export interface Generator {

    result: Observable<GeneratedResult>

    observeFiles(mainFileName?: string): Observable<Array<File>>

}

export abstract class BaseGenerator implements Generator {

    abstract result: Observable<GeneratedResult>
    
    observeFiles(mainFileName: string = "index.ts"): Observable<File[]> {
        return this.result.pipe(
            map(result => getFiles(result, mainFileName)),
            shareReplay(1)
        )
    }

}

/*export class GeneratorArray<A extends Array<Generator> = Array<Generator>> extends BaseGenerator {

    result: Observable<GeneratedResult>
    private arraySubject = new Subject<A>()

    constructor(array: A) {
        super()
        this.result = this.arraySubject.pipe(
            switchMap(array => merge(...array.map(item => item.result)).pipe(toArray())),
            map(results => generateArray(results))
        )
        this.arraySubject.next(array)
    }

    update(array: A): void {
        this.arraySubject.next(array)
    }

}*/

export class GeneratorImport extends BaseGenerator {

    result: Observable<GeneratedResult>
    private importSubject: Subject<Import>

    constructor(
        imp: Import
    ) {
        super()
        this.importSubject = new BehaviorSubject<Import>(imp)
        this.result = this.importSubject.pipe(
            map(imp => generateImport(imp)),
            shareReplay(1)
        )
    }

    update(imp: Import): void {
        this.importSubject.next(imp)
    }

}

export class GeneratorJSON<V = any> extends BaseGenerator {

    result: Observable<GeneratedResult>;
    protected valueSubject: Subject<V>

    constructor(value: V) {
        super()
        this.valueSubject = new BehaviorSubject<V>(value)
        this.result = this.valueSubject.pipe(
            map(value => generateJson(value)),
            shareReplay(1)
        )
    }

    update(value: V): void {
        this.valueSubject.next(value)
    }

}

export class GeneratorFunctionExecution<Func extends Generator = Generator, Parameters extends Array<Generator> = Array<Generator>> extends BaseGenerator {
    
    result: Observable<GeneratedResult>;
    protected funcParamSubject: Subject<{ func: Func, parameters: Parameters }>

    constructor(func: Func, ...parameters: Parameters) {
        super()
        this.funcParamSubject = new BehaviorSubject<{ func: Func, parameters: Parameters }>({ func, parameters })
        this.result = this.funcParamSubject.pipe(
            switchMap(({ func, parameters }) =>
                combineLatest(func.result, ...parameters.map(param => param.result))
            ),
            map(([func, ...parameters]) => generateFunctionExecution(func, ...parameters)),
            shareReplay(1)
        )
    }

    update(func: Func, ...parameters: Parameters): void {
        this.funcParamSubject.next({
            func,
            parameters
        })
    }

}

export class GeneratorLazyLoading<G extends Generator = Generator> extends BaseGenerator {

    result: Observable<GeneratedResult>
    protected generatorSubject: Subject<G>

    constructor(
        generator: G,
        private filename: string | undefined = undefined
    ) {
        super()
        this.generatorSubject = new BehaviorSubject<G>(generator)
        this.result = this.generatorSubject.pipe(
            switchMap(generator => generator.result),
            map(result => generateLazyLoadable(result, this.filename)),
            shareReplay(1)
        )
    }
    
    update(generator: G): void {
        this.generatorSubject.next(generator)
    }

}

export class GeneratorShare<G extends Generator = Generator> extends BaseGenerator {

    result: Observable<GeneratedResult>
    protected generatorSubject: Subject<G>

    constructor(generator: G) {
        super()
        this.generatorSubject = new BehaviorSubject<G>(generator)
        this.result = this.generatorSubject.pipe(
            switchMap(generator => generator.result),
            map(result => generateShare(result)),
            shareReplay(1)
        )
    }
    
    update(generator: G): void {
        this.generatorSubject.next(generator)
    }

}