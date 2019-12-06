import { ElementImport } from "../index"
import { ssrApp, AppParams } from "./ssr-app"
import { compileTypescript } from "./compiler"
import ReactDOM from "react-dom/server"
import express from "express"
import { render } from "./ssr-app"
import { HybridGeneratorImport, HybridGeneratorFunctionExecution, HybridGeneratorJSON } from "../hybrid-generator"

const expressApp = express()

//this function create the app element which is shared between webapp and webserver
let ssrAppFunction = new HybridGeneratorImport(ssrApp, new ElementImport(__dirname, "ssrApp", "ssr-app"))

//this function hydrates the served html site and is only needed on the web page
let ssrRenderFunction = new HybridGeneratorImport(render, new ElementImport(__dirname, "render", "ssr-app"))

//dynamic code is more powerfull than just this primitive data
//by providing a full react components as params to the app the react app becomes dynamic

let data: AppParams = {
    pageNumber: 2,
    subtitle: "Subtitle",
    title: "Title"
}

let appParam = new HybridGeneratorJSON(data)

let appGenerator = new HybridGeneratorFunctionExecution(ssrAppFunction, appParam)
let renderedGenerator = new HybridGeneratorFunctionExecution(ssrRenderFunction, appParam)

let bundledCode: string = ""
let indexHtml: string = ""

expressApp.get('/bundle.js', function (req, res) {
    res.send(bundledCode)
})

expressApp.get('/', function (req, res) {
    res.send(indexHtml)
})

expressApp.get("/change", (req, res) => {
    appParam.update({
        pageNumber: parseInt(req.query.pageNumber || "2"),
        subtitle: req.query.subtitle || "Subtitle",
        title: req.query.title || "Title"
    })
    res.redirect("/")
})

expressApp.listen(80)

appGenerator.value.subscribe(app => {
    indexHtml = `<html>
        <head>
            <script async src='bundle.js'></script>
        </head>
        <body>
            <div id='root'>${ReactDOM.renderToString(app)}</div>
        </body>
    </html>`
})

renderedGenerator.observeFiles().subscribe(files => {
    compileTypescript(files, {
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
})
    