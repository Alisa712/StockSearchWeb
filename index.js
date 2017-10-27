var express = require('express')
var request = require('request')
 
var app = express()
var PORT = 3000
 
app.get('/notes', function(req, res) {
  res.json({notes: "This is your notebook. Edit this to start saving your notes!"})
})

app.get('/stock/query',function(req, res){
	console.log(req.query);
	url = 'https://www.alphavantage.co/query';
	APIKEY = 'KKYKI5DCNNT4HBVX';
	req.query['apikey'] = APIKEY;
	request({url:url, qs:req.query}, function(err, response, body) {
	res.json(response);
	});
});

console.log("Server starting on PORT: "+PORT);
app.listen(PORT)