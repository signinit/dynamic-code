/**
 * data that is either dynamically loadable or statically avaiable
 */
export type SplittedData<T> = StaticData<T> | DynamicData<T>

/**
 * static data on the server side
 */
export type StaticData<T> = {
    type: "static",
    value: T
}

/**
 * dynamic data is dynamically loadable on the client side
 */
export type DynamicData<T> = {
    type: "dynamic",
    load: () => Promise<T>
}