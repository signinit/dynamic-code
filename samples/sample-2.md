# Sample 2

[*source code*](samples/sample-2.ts)  
(Use `npm run sample2` to run the full sample from bellow.)

This sample is nearly the same as Sample 1, but this time the HybridGeneratable is used.  
With the use of a HybridGeneratable not only code can be generated but also the value that the generatable is representing.  
This can be particuallarly useful when build something like a server side rendering system which needs to execute the same code on the current machine and on the web.  

At first a HybridGeneratableJSON is created with the value `20`.

```typescript
let generatable = new HybridGeneratableJSON(20)
```

Logging the result of `generateValue()` 

```typescript
console.log(generatable.generateValue())
```

should result in `20` displayed in the console.  

After updating the value of the HybridGeneratable

```typescript
generatable.update(42)
```

the same log call should result in `42`.

Next: [Sample 3](sample-3.md) - compiling and typechecking the generated code