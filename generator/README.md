# Generator

A Generator is push based.  
That means by subscribing to the generated result, each time there is a change, the generator will return the newest results.

## Sample

[*sample 3 source code*](samples/sample-3.ts)  
(Use `npm run sample3` to run the full sample from bellow.)

*this sample requires some understanding of express and react which i won't go into any detail* 

Sample 3 uses react and express to create a dynamic generated web app that can be changed and automatically recompiled by the user.  
The 3 input field represent the 3 elements above.  
By clicking *change* the page will transfer the entered words and numbers to the system.  
Now the system takes these values and compiles these values into the webapp and then updates the webpage.  

![image of the generate web app](sample-3-image.png)