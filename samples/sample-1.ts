import { CompileableJSON, CompileableArray } from ".."

let value = 20 / 2

let element1 = new CompileableJSON(value)

let object = {
    text: "Hello "
}
object.text += "World"

let element2 = new CompileableJSON(object)

let array = new CompileableArray(element1, element2)

console.log(array.compile())

object.text = "Change!"

console.log(array.compile())