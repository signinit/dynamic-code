import { CompileableJSON, CompileableFunctionExecution, CompileableImport, ElementImport } from "..";
import { compile } from "./compiler";
import { x } from "./function"
import { resolve } from "path";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { CompilationResult } from "./compiler"

let func = new CompileableImport(x, new ElementImport("x", "samples/function"))

let value: any = { z: "World" }

let parameter = new CompileableJSON(value)

let execution = new CompileableFunctionExecution(func, parameter)

executeCompile()
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
    .then(() => executeCompile())
    .then(result => {
        let bundledCode = result["bundle.js"].toString()
        eval(bundledCode)
    })
    .catch(error => {
        console.log(error)
    })

function executeCompile(): Promise<CompilationResult> {
    let files = execution.compile()

    files.push({
        name: "tsconfig.json",
        data: "{}"
    })

    if(!existsSync("temp")) {
        mkdirSync("temp")
    }
    
    files.forEach(file => writeFileSync(`temp/${file.name}`, file.data))

    return compile({
        entry: "./temp/index.ts",
        module: {
            rules: [
                {
                  test: /\.tsx?$/,
                  use: [{
                        loader: resolve(__dirname, "../node_modules/ts-loader")
                  }],
                  exclude: /node_modules/
                },
            ]
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ]
        },
        output: {
            filename: 'bundle.js'
        },
    })
}