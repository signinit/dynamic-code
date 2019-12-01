# Sample 1

[*source code*](samples/sample-1.ts)  
(Use `npm run sample1` to run the full sample from bellow.)

Lets create the first Generateable. The GeneratableJSON gets any raw object and creates a Generatable from it.  

```typescript
let generatable = new GeneratableJSON(20)
```

Via `generate()` code is generated from the Generatable. 

```typescript
console.log(generatable.generate("mainFile.ts"))
```

This should result in `[ { name: 'mainFile.ts', data: '20' } ]`.  
The result is an array of files. The `name` of the main file is speciefied in the `generate(filename?)` function.  `data` represents the content of the generated file.

Now lets update the value of the generatable

```typescript
generatable.update(42)
```

and then regenerate the files and log them.

```typescript
console.log(generatable.generate())
```

The console should now display 

`[ { name: 'index.ts', data: '42' } ]`

As we changed the value of the generatable the data has changed. Also the filename has changed because we did not specify any filename in the `generate()` function and the default is `"index.ts"`.

Next: [Sample 2](sample-2.md) - generating the value behind the code