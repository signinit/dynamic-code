import { GeneratableJSON } from ".."

let generatable = new GeneratableJSON(20)

console.log(generatable.generate("mainFile.ts"))

generatable.update(42)

console.log(generatable.generate("mainFile.ts"))