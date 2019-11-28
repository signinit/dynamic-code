# Generatable

A Generatable is pull based.  
That means to get the result, you have to call `generate()`.
After changing the content via `update(...)` a call to `generate()` is necassary to get the new result.

## Sample

[*sample 1 source code*](samples/sample-1.ts)  
(Use `npm run sample1` to run the full sample from bellow.)

Lets create the first Generateable. The GeneratableJSON gets any raw object and creates a Generatable from it.  
generated code.

```typescript
let value = 20 / 2
let element1 = new GeneratableJSON(value)
```

*remove generate Value from here because its not supported by the basic generateable*  
The `generateValue()` gets the real value behind the Generatable. In this case its nothing special because we are dealing just with a raw value.  
`10` hould be logged to the console, which is the content of the variable `value`.

```typescript
console.log(element1.generateValue())
```

Via `generate()` code is generated from the Generatable. This should result in `[ { name: 'mainFile.ts', data: '10' } ]`.  
The result is an array of files. The `name` of the main file is speciefied in the `generate()` function. Attribute `data` of the file is the result of the generation.

```typescript
console.log(element1.generate("mainFile.ts"))
```

Now lets create a more complex combination of Generatables.  
`element1` and `element2` are merged into the Generatables `array`.

```typescript
let object = {
    text: "Hello "
}
object.text += "World"

let element2 = new GeneratableJSON(object)

let array = new GeneratableArray(element1, element2)

console.log(array.generate())
```

Logging the generated files should result in the following files.
```json
[ { "name": "index.ts", "data": "[10,{'text':'Hello World'}]" } ]
```
If no filename is specified in the `generate()` function, the function defaults to `"index.ts"`.