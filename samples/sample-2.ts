import { GeneratableJSON, GenertableFunctionExecution, GeneratableImport, ElementImport } from "../index";
import { sampleFunction } from "./function"
import { compileTypescript } from "./compiler";
import { HybridGeneratableImport } from "../hybrid-generatable";

let func = new HybridGeneratableImport(sampleFunction, new ElementImport("sampleFunction", "samples/function"))

let value: any = { z: "World" }

let parameter = new GeneratableJSON(value)

let execution = new GenertableFunctionExecution(func, parameter)

compileTypescript(execution.generate(), {})
    .then(result => {
        let bundledCode = result["bundle.js"].toString()
        eval(bundledCode)
    })
    .catch(error => {
        console.log(error)
    })
    .then(() => {
        //now we change the value to a number, which should result in an compilation error
        value.z = 10
    })
    .then(() => compileTypescript(execution.generate(), {}))
    .then(result => {
        let bundledCode = result["bundle.js"].toString()
        eval(bundledCode)
    })
    .catch(error => {
        console.log(error)
    })