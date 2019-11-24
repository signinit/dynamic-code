import { GeneratableJSON, GeneratableArray } from ".."

let value = 20 / 2

let element1 = new GeneratableJSON(value)

console.log(element1.generateValue())

console.log(element1.generate("mainFile.ts"))

let object = {
    text: "Hello "
}
object.text += "World"

let element2 = new GeneratableJSON(object)

let array = new GeneratableArray(element1, element2)

console.log(array.generate())

object.text = "Change!"

console.log(array.generate())