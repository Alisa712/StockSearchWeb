var express = require('express');
var parseString = require('xml2js').parseString;
var request = require('request');

var app = express();
var PORT = 80;

// stock quote
app.get('/stock/query',function(req, res){
	//console.log(req.query);
	url = 'https://www.alphavantage.co/query';
	APIKEY = 'KKYKI5DCNNT4HBVX';
	req.query['apikey'] = APIKEY;
	request({url:url, qs:req.query}, function(err, response, body) {
		res.send(body);
	});
});

// get news
app.get('/stock/news',function(req, res){
	//console.log(req.query);
	url = 'https://seekingalpha.com/api/sa/combined/';
	request({url:url+req.query['SYMBOL']+".xml"}, function(err, response, body) {
		//console.log(typeof body);		
		parseString(body, function (err, result) {
			var cleanData = [];
			var items = result.rss.channel[0]['item'];
			for (var i=0, j=0; i<items.length; i++) {
				if (/Article/.test(items[i]['guid'][0]['_'])) {
					cleanData[j] = {
						title: items[i]['title'][0],
						link: items[i]['link'][0],
						pubDate: items[i]['pubDate'][0],
						author_name: items[i]['sa:author_name'][0]
					};
					j++;
				}				
			}
			res.send(cleanData);
		});
	});
});

// autocomplete
app.get('/autocomplete', function(req, res){
	url = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json';
	request({url:url, qs:req.query}, function(err, response, body) {
		res.send(body);
	});
})

console.log("Server starting on PORT: "+PORT);
app.listen(PORT)