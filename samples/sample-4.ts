import { GeneratableImport, ElementImport, GenertableFunctionExecution, GeneratableJSON } from ".."
import { ssrApp, AppParams } from "./ssr-app"
import { compileTypescript } from "./compiler"
import ReactDOM from "react-dom/server"
import express from "express"
import { render } from "./ssr-app"

const expressApp = express()

//this function create the app element which is shared between webapp and webserver
let ssrAppFunction = new GeneratableImport(ssrApp, new ElementImport("ssrApp", "samples/ssr-app"))

//this function hydrates the served html site and is only needed on the web page
let ssrRenderFunction = new GeneratableImport(render, new ElementImport("render", "samples/ssr-app"))

//dynamic code is more powerfull than just this primitive data
//by providing a full react components as params to the app the react app becomes dynamic

let data: AppParams = {
    pageNumber: 2,
    subtitle: "Subtitle",
    title: "Title"
}

let appParam = new GeneratableJSON(data)

let appGeneratable = new GenertableFunctionExecution(ssrAppFunction, appParam)
let renderedGeneratable = new GenertableFunctionExecution(ssrRenderFunction, appParam)

let bundledCode: string = ""

expressApp.get('/bundle.js', function (req, res) {
    res.send(bundledCode)
})

expressApp.get('/', function (req, res) {
    res.send(`<html>
    <head>
        <script async src='bundle.js'></script>
    </head>
    <body>
        <div id='root'>${ReactDOM.renderToString(appGeneratable.generateValue())}</div>
    </body>
</html>`)
})

expressApp.get("/change", (req, res) => {
    appParam.setValue({
        pageNumber: parseInt(req.query.pageNumber || "2"),
        subtitle: req.query.subtitle || "Subtitle",
        title: req.query.title || "Title"
    })
    compile()
        .then(() => res.redirect("/"))
    
})

expressApp.listen(80)

compile()

function compile(): Promise<void> {
    console.log("app is compiling ...")
    return compileTypescript(renderedGeneratable.generate(), {
        "compilerOptions": {
            "jsx": "react",
            "esModuleInterop": true
        }
    })
        .then(result => {
            bundledCode = result["bundle.js"].toString()
            console.log("app compiled! Visit http://localhost")
        })
        .catch(error => {
            console.log(error)
        })
}