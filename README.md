# Dynamic Code

This package is all about dynamic javascript/typescript/... systems. Dynamic here means: able to change and (re)generate its code. 
Its not really about the code thats behind this package but more about the way of structuring a dynamic system.

Introduction to Dynamic Code - [Medium Article](https://medium.com/@signinit/dynamic-code-352a0011ce05?sk=af136ea95cccbeea42e6461b2e1fb694)

![Dynamic Code GIF](dynamic-code.gif)

## Why and When can you use Dynamic Code

Dynamic Code is usefull when there is compiled code that should change automatically.  
These changes shouldn't come in every minute, because the application would have to generate and recompile itself every time.  
Changes can be like anything like a npm package update or a content update basically anything that should be integrated into the code.  
Some [possible use cases](#possible-use-cases) are listed bellow.

## Install

Execute `npm install dynamic-code` to use Dynamic Code in your project.  
To try all the samples clone this project via `git clone https://github.com/signinit/dynamic-code.git`. Install depenencies via `npm install `and build everything using `npm run build`. If everything was successfull run any of the samples 1 to 5 via `npm run sample<NR>`.

## Samples

1. [First Generatable](samples/sample-1.md)  
2. [Hybrid values](samples/sample-2.md)  
3. [Compile generated code](samples/sample-3.md)  
4. [Generated webpage](samples/sample-4.md)  
5. [Server side rendering](samples/sample-5.md)

## Concepts / Classes

These are all the base classes this package offers. Each class comes with their own capabilites.  
Every class can deal with the same data but has a different behaviour when it comes to generating.

||generate|compute value|
|-|-|-|
|[Generatable](generatable/README.md)|manual|:heavy_multiplication_x:|
|[HybridGeneratable](hybrid-generatable/README.md)|manual|:heavy_check_mark:|
|[Generator](generator/README.md)|on change|:heavy_multiplication_x:|
|[HybridGenerator](hybrid-generator/README.md)|on change|:heavy_check_mark:|

## Prevent errors and mistakes

Dynamic Systems might produce context or syntax errors while running because they have the ability to change dynamically.  
To prevent these errors the use of a typed programming language is recommended.
The [Sample 2](#sample-2) demonstrates how typescript can be used to detect errors in dynamically generated and compiled code.

## Possible use cases

### Remove network requests

Having dynamic content often means requesting the content each time it is used because it might have changed.  
For example a webpage might always request the title of the webpage, because at some point the admin may want to change it.  
Dynamic Code can help compiling the dynamic parts into the static page, so its always up to date but can be served like a static page.

### Dynamic component system in react app

React components structure an app so the individual components are managable.  
With the use of Dynamic Code they also can be changed, upgraded or swapped out complete while running.  

Maybe the user should be able to change the primary color of the app.  
Dynamic Code could be used to recompile the new color into the webapp automatically.

### Server side rendering

Just like building a dynamic web app it is possible to build a dynamic webapp that leverages server side rendering.  
Every dynamic code that is generated as "hybrid" can also be executed directly. This means the code can be run on the server side and can be served to the web.  
Obviously if your web app does not need to be dynamic there are much better tools for sole SSR.

## TBD

* sample 5 - use lazy loading
* write sample 6 - dynamic code and deno
* write test to check share functionality and general correctness (also when to regenerate)
* document/comment all functions and classes -> generate documentation
* make readmes more fany with icons :)
* include repositories that use dynamic code
* write about creating a new Genertable/Generator (like a GeneratableArray & GeneratorArray)

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).