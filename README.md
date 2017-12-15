# Starting a Node.js Project

## Create a new Node.js Project
- Do npm install if you have a existing package.json file
- Do npm init and follow the manual to create package.json file

## Install new package
the packages may need: express, request(Call to external API)
```
$ npm install --save <package name>
```

## Start from Scratch 
Create a file namely index.js that contains the followings
```javascript
var express = require('express')
 
var app = express()
 
app.get('/notes', function(req, res) {
  res.json({notes: "This is your notebook. Edit this to start saving your notes!"})
})
 
app.listen(3000)
```
You should see the Json file if you try to request to http://localhost:3000

## Call to external APIs
Use request library to do so:
```
request.get({url: "http://localhost:3000/my-api-controller", 
             qs: {url: url}},
            function(error, response, body){
               console.log(body);
            });
```

# Porject Details (screenshots of webpage)
<p align="center"><img src="./img/1.png" /></p>
<p align="center"><img src="./img/2.png" /></p>
<p align="center"><img src="./img/3.png" /></p>
<p align="center"><img src="./img/4.png" /></p>
<p align="center"><img src="./img/5.png" /></p>
<p align="center"><img src="./img/6.png" width="600" height="400"/></p>
<p align="center"><img src="./img/7.png" width="600" height="400"/></p>
<p align="center"><img src="./img/8.png" width="600" height="400"/></p>
<p align="center"><img src="./img/9.png" width="200" height="100"/></p>
<p align="center"><img src="./img/10.png" width="800" height="600"/></p>
<p align="center"><img src="./img/11.png" width="800" height="400"/></p>
<p align="center"><img src="./img/12.png" width="800" height="400"/></p>
<p align="center"><img src="./img/13.png" width="800" height="400"/></p>

# Porject Details (screenshots of mobile page)

The following are snapshots of the major screens taken on Safari of iPhone 6s.
<p align="center"><img src="./img/14.png" width="460" height="270"/></p>
<p align="center"><img src="./img/15.png" width="460" height="270"/></p>
<p align="center"><img src="./img/16.png" width="460" height="540"/></p>
