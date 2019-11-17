import webpack, { Configuration } from "webpack"
import MemoryFS from "memory-fs"
import { Union } from "unionfs"
import fs from "fs"
import { resolve } from "path"
import { File, } from ".."

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