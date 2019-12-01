import { HybridGeneratableJSON } from "../index"

let generatable = new HybridGeneratableJSON(20)

console.log(generatable.generateValue())

generatable.update(42)

console.log(generatable.generateValue())