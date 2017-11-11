var express = require('express');
var http = require('http');
var parseString = require('xml2js').parseString;
var request = require('request');

var app = express();
var PORT = process.env.PORT || 3000;

// //assuming app is express Object.
// app.get('/',function(req,res){       
//   res.sendFile('./index.html');
// });


// allow CROS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use('/', express.static('./'));

var requestTime = function(times, url, query, res) {
	console.log('Request Remaining', times);
	request({url:url, qs:query}, function(err, response, body) {
			if (response.statusCode != 200 || Object.keys(body).length < 3) {
				console.log("Failed request to Query server", query);
				if (times - 1 > 0) {
					requestTime(times-1, url, query, res);
				} else {
					res.send({});
				}
			} else {
				console.log("Received Query Length",Object.keys(body).length);
				res.send(body);
			}
	});
}

// stock quote
app.get('/stock/query',function(req, res){
	//console.log(req.query);
	url = 'https://www.alphavantage.co/query';
	APIKEY = 'KKYKI5DCNNT4HBVX';
	req.query['apikey'] = APIKEY;
	// var tried = 0;
	// for(; tried < 3 && !res.headersSent; tried++) {
	// 	request({url:url, qs:req.query}, function(err, response, body) {
	// 		if (response.statusCode != 200 || JSON.stringify(body) === '{}' ) {
	// 			console.log("Failed request to Query server");
	// 		} else {
	// 			res.send(body);
	// 		}
	// 	});
	// }
	// if (tried == 3) {
	// 	res.send({});
	// }
	requestTime(3, url, req.query, res);

});

// get news
app.get('/stock/news',function(req, res){
	//console.log(req.query);
	url = 'https://seekingalpha.com/api/sa/combined/';
	request({url:url+req.query['SYMBOL']+".xml"}, function(err, response, body) {
		//console.log(typeof body);		
		if (response.statusCode == 200) {
			parseString(body, function (err, result) {
				var cleanData = [];
				var items = result.rss.channel[0]['item'];
				for (var i=0, j=0; i<items.length && j<5; i++) {
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
		} else {
			res.send("newsError");
		}
	});
});

// autocomplete
// Param: input
app.get('/autocomplete', function(req, res){
	url = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json';
	request({url:url, qs:req.query}, function(err, response, body) {
		res.send(body);
	});
})


console.log("Server starting on PORT: "+PORT);
//app.listen(PORT)
var server = http.createServer(app);
server.listen(PORT);