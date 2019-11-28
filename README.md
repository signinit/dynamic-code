# Dynamic Code

This package is all about dynamic javascript/typescript/... systems. Dynamic here means: able to change and (re)generate its code.  
Its not really about the code thats behind this package but more about the way of structuring a dynamic system.

## Why and When should you use Dynamic Code

Dynamic Code is usefull when there is compiled code that should change automatically.  
These changes shouldn't come in every minute, because the application would have to generate and recompile itself every time.  
Changes can be like anything like a npm package update or a content update basically anything that should be integrated into the code.  
Some [possible use cases](#possible-use-cases) are listed bellow. 

## Install

Use `npm install dynamic-code` to use Dynamic Code in your project.  
To try all the samples clone this project via `git clone https://github.com/signinit/dynamic-code.git`. Then build everything using `npm run build` and then run any of the samples via `npm run sample<NR>`.

## Prevent errors and mistakes

Dynamic Systems might produce contextual or syntax errors while running because they have the ability to change dynamically.  
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

* sample 4 use lazy loading
* explain HybridGeneratable in sample 3 and only use normal Generatables in the samples above
* Move the samples to the specific readme's
* check share functionality and general correctness of when to generate