import webpack, { Configuration } from "webpack"
import MemoryFS from "memory-fs"
import fs from "fs"
import { resolve } from "path"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { File } from "../index"

export function compileTypescript(files: Array<File>, tsconfig: any): Promise<CompilationResult> {

    files.push({
        name: "tsconfig.json",
        data: JSON.stringify(tsconfig)
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

export function compile(configuration: Configuration): Promise<CompilationResult> {
    //TODO all dynamic imports need to get recompiled even if just one changes
    let outputMemFs = new MemoryFS()
    let webpackOutput = configuration.output || {}
    let webpackResolve = configuration.resolve || {}
    let webpackModules = webpackResolve.modules || []
    let nodeModulesPath = resolve(process.cwd(), "node_modules")
    webpackModules.push(nodeModulesPath)
    webpackOutput.publicPath = "/"
    webpackOutput.path = "/"
    webpackResolve.modules = webpackModules
    configuration.output = webpackOutput
    configuration.resolve = webpackResolve
    return new Promise((resolve, reject) => {
        let compiler = webpack(configuration)
        compiler.inputFileSystem = fs
        compiler.outputFileSystem = outputMemFs
        compiler.run((_error, stats) => {
            if (stats.hasErrors()) {
                reject(stats.toString("errors-only"))
            } else {
                let files = Object.entries<[string, Buffer]>(outputMemFs.data)
                    .reduce((prev, [filename, code]) => {
                        prev[filename] = code
                        return prev
                    }, <any>{})
                resolve(files)
            }
        })
    })
}

export type CompilationResult = { [filename: string]: Buffer }