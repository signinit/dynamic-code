import { Observable, Subject, BehaviorSubject, combineLatest } from "rxjs"
import { map, switchMap, shareReplay } from "rxjs/operators"
import { GeneratedResult, getFiles, File, generateJson, Import, generateImport, generateFunctionExecution, generateLazyLoading, generateShare } from "../index";

/**
 * base interface for a generator
 * (a generator generates the results after a change)
 */
export interface Generator {

    /**
     * an observable that emits the result as soon as it changes
     */
    result: Observable<GeneratedResult>

    /**
     * creates an observable that emits the resulting files
     * @param mainFileName an optional name for the entry file
     */
    observeFiles(mainFileName?: string): Observable<Array<File>>

}

/**
 * the base class for all generators
 */
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

/**
 * generator for a json value
 */
export class GeneratorJSON<V = any> extends BaseGenerator {

    result: Observable<GeneratedResult>;
    protected valueSubject: Subject<V>

    /**
     * json generator constructor 
     * @param value the json value that will be generated to code
     */
    constructor(value?: V) {
        super()
        if(value != null) {
            this.valueSubject = new BehaviorSubject<V>(value)
        } else {
            this.valueSubject = new Subject<V>()
        }
        this.result = this.valueSubject.pipe(
            map(value => generateJson(value)),
            shareReplay(1)
        )
    }

    /**
     * change the value
     * (each update emits a new value and result)
     * @param value the new value
     */
    update(value: V): void {
        this.valueSubject.next(value)
    }

}


/**
 * generator for an import
 */
export class GeneratorImport extends BaseGenerator {

    result: Observable<GeneratedResult>
    private importSubject: Subject<Import>

    /**
     * import generator constructor
     * @param imp the import that will be generated to code
     */
    constructor(
        imp?: Import
    ) {
        super()
        if(imp != null) {
            this.importSubject = new BehaviorSubject<Import>(imp)
        } else {
            this.importSubject = new Subject<Import>()
        }
        this.result = this.importSubject.pipe(
            map(imp => generateImport(imp)),
            shareReplay(1)
        )
    }

    /**
     * change the import
     * (each update emits a new value and result)
     * @param imp the new import
     */
    update(imp: Import): void {
        this.importSubject.next(imp)
    }

}

/**
 * generator for a function execution
 */
export class GeneratorFunctionExecution<Func extends Generator = Generator, Parameters extends Array<Generator> = Array<Generator>> extends BaseGenerator {
    
    result: Observable<GeneratedResult>;
    protected funcParamSubject: Subject<{ func: Func, parameters: Parameters }>

    /**
     * function execution generator constructor
     * @param func the function that will be generated to code
     * @param parameters the parameters to execute the function with in the code
     */
    constructor(func?: Func, ...parameters: Parameters) {
        super()
        if(func != null) {
            this.funcParamSubject = new BehaviorSubject<{ func: Func, parameters: Parameters }>({ func, parameters })
        } else {
            this.funcParamSubject = new Subject<{ func: Func, parameters: Parameters }>()
        }
        this.result = this.funcParamSubject.pipe(
            switchMap(({ func, parameters }) =>
                combineLatest(func.result, ...parameters.map(param => param.result))
            ),
            map(([func, ...parameters]) => generateFunctionExecution(func, ...parameters)),
            shareReplay(1)
        )
    }

    /**
     * change the function and parameters
     * (each update emits a new value and result)
     * @param func the new function
     * @param parameters the new parameters
     */
    update(func: Func, ...parameters: Parameters): void {
        this.funcParamSubject.next({
            func,
            parameters
        })
    }

}

/**
 * generator for a lazy loadable
 */
export class GeneratorLazyLoading<G extends Generator = Generator> extends BaseGenerator {

    result: Observable<GeneratedResult>
    protected generatorSubject: Subject<G>

    /**
     * lazy loadanble generator constructor
     * @param generator the generator that represents the value that will be generated to be lazy loaded
     * @param filename the optional name of the file that should be generated to load from
     */
    constructor(
        generator?: G,
        private filename: string | undefined = undefined
    ) {
        super()
        if(generator != null) {
            this.generatorSubject = new BehaviorSubject<G>(generator)
        } else {
            this.generatorSubject = new Subject<G>()
        }
        this.result = this.generatorSubject.pipe(
            switchMap(generator => generator.result),
            map(result => generateLazyLoading(result, this.filename)),
            shareReplay(1)
        )
    }
    
    /**
     * change the value to be lazy loaded
     * (each update emits a new value and result)
     * @param generator the new value
     */
    update(generator: G): void {
        this.generatorSubject.next(generator)
    }

}

/**
 * generator for a share
 */
export class GeneratorShare<G extends Generator = Generator> extends BaseGenerator {

    result: Observable<GeneratedResult>
    protected generatorSubject: Subject<G>

    /**
     * share generator constructor
     * @param generator the generator that represents the value that will be generated to be a constant value in code
     */
    constructor(generator?: G) {
        super()
        if(generator != null) {
            this.generatorSubject = new BehaviorSubject<G>(generator)
        } else {
            this.generatorSubject = new Subject()
        }
        this.result = this.generatorSubject.pipe(
            switchMap(generator => generator.result),
            map(result => generateShare(result)),
            shareReplay(1)
        )
    }
    
    /**
     * change the value to be shared
     * (each update emits a new value and result)
     * @param generator the new value
     */
    update(generator: G): void {
        this.generatorSubject.next(generator)
    }

}