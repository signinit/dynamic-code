import { GeneratableJSON, GenertableFunctionExecution, GeneratableImport, ElementImport } from "../index";
import { compileTypescript } from "./compiler";

let func = new GeneratableImport(new ElementImport(__dirname, "sampleFunction", "function"))

let parameter = new GeneratableJSON({ z: "World" } as any)

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
        parameter.update({ z: 10 })
    })
    .then(() => compileTypescript(execution.generate(), {}))
    .then(result => {
        let bundledCode = result["bundle.js"].toString()
        eval(bundledCode)
    })
    .catch(error => {
        console.log(error)
    })