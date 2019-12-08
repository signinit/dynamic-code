import { ElementImport } from "../index"
import { AppParams } from "./app"
import { compileTypescript } from "./compiler"
import express from "express"
import { GeneratorImport, GeneratorFunctionExecution, GeneratorJSON } from "../generator"

const expressApp = express()

let appFunction = new GeneratorImport(new ElementImport(__dirname, "app", "app"))

//dynamic code is more powerfull than just this primitive data
//by providing a full react components as params to the app the react app becomes dynamic

let data: AppParams = {
    pageNumber: 2,
    subtitle: "Subtitle",
    title: "Title"
}

let appParam = new GeneratorJSON(data)

let appGenerator = new GeneratorFunctionExecution(appFunction, appParam)

let bundledCode: string = ""
let indexHtml: string = `<html>
    <head>
        <script async src='bundle.js'></script>
    </head>
    <body>
        <div id='root'></div>
    </body>
</html>`

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

appGenerator.observeFiles().subscribe(files => {
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