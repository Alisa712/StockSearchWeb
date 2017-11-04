var preURL = "http://localhost:3000";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','ngMaterial']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval, $window, $timeout){
	$scope.init = function(){
		$scope.disabled = true;
		$scope.showDetail = false;
		$scope.quoted = false;
		$scope.indiCalled = false;
		$scope.records = ["Symbol", "Stock Price", "Change (Change Percent)", "Volume"];
		$scope.sortChoices = ["Default", "Symbol", "Stock Price", "Change", "Change Percent", "Volume"];
		$scope.priceIndicators = ["Price", "SMA", "EMA", "STOCH", "RSI", "ADX", "CCI", "BBANDS", "MACD"];
		$scope.chartsInfo = {};
		$scope.datesCollection = [];
		$scope.formattedDates =[];
		$scope.closePrice = [];
		$scope.volumeData = [];
		$scope.selectSortBy = $scope.sortChoices[0];
		$scope.orderChoices = ["Ascending", "Descending"];
		$scope.selectOrderBy = $scope.orderChoices[0];
		$scope.expression = "cs"; //current stock
		$scope.chartsExpression = "Price";
		$scope.stockDetails = {};
		$scope.downColor = "red";
		$scope.upColor = "green";

		// $window.localStorage.removeItem("favorite");
		if ($window.localStorage.getItem("favorite") === null){
			$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
		} else {
			$scope.stockDetails = JSON.parse($window.localStorage.getItem("favorite"));
		}
		console.log($scope.stockDetails);
		console.log($scope.chartsExpression);
	};

	$scope.clear = function() {
		//TODO: implement clear function here
	};

	$scope.getQuote = function() {
		$scope.quoteStockName = $scope.searchText;
		$scope.showDetail = true;
		$scope.quoted = false;

		URL = preURL+"/stock/query";
		var params = {symbol: $scope.quoteStockName, function: "TIME_SERIES_DAILY", outputsize: "full"};
		$http.get(URL, {params: params}).then(function(res) {
			//console.log(res);
			var timeSeriesDaily = [];
			var timeSet = res.data["Time Series (Daily)"];

			angular.forEach(timeSet, function(value, key) {
			  	this.push(value);
			  	$scope.datesCollection.push(key);
			}, timeSeriesDaily);

			for (var i = 120; i >= 0; i--) {
				var dates  = $scope.datesCollection[i];
				var formatted = (dates.split('-').join('/')).substring(5,10);
				$scope.formattedDates.push(formatted);
				$scope.closePrice.push(timeSeriesDaily[i]["4. close"].toString());
				$scope.volumeData.push(timeSeriesDaily[i]["5. volume"].toString());
			}			

			console.log($scope.formattedDates);
			console.log(typeof $scope.closePrice);
			console.log(typeof $scope.volumeData[3]);
			var previousDate = timeSeriesDaily[1];
			var currentDateTemp = res.data["Meta Data"]["3. Last Refreshed"];
			var closedTime = "16:00:00"; 
			var currentDate = currentDateTemp.substring(0, 10); //yyyy-mm-dd
			var temp = timeSet[currentDate];
			var submit = {};
			submit['symbol'] = $scope.quoteStockName;
			submit['volume'] = temp["5. volume"];
			submit['change'] = (temp["4. close"] - temp["1. open"]).toFixed(2);
			submit['changePercent'] = (submit['change']/temp["1. open"] * 100).toFixed(2);
			//submit['timestamp'] = currentDateTemp + " EDT"; //EDT?
			submit['open'] = temp["1. open"];
			submit['low'] = temp["3. low"];
			submit['high'] = temp["2. high"];
			submit['lastPrice'] = temp["4. close"];

			if (currentDateTemp.length == 10 || (currentDateTemp.indexOf(closedTime) !== -1)) {
				submit['close'] = temp["4. close"]; //already closed today
				submit['timestamp'] = currentDate + " " + closedTime + " EDT"; //EDT?
			} else {
				submit['close'] = previousDate["4. close"]; // today not closed yet
				submit['timestamp'] = currentDateTemp + " EDT"; //EDT?
			}
			$scope.chartsInfo["Price"] = res.data;
			$scope.csDetails = submit;
			$scope.quoted = true;
		});
		
		var startIndex = 1; //introduce delay to optimize API call frequency
		var seqRequest = function(startIndex){
			if (startIndex + 1 <= $scope.priceIndicators.length) {
				var paramsIndicator = {symbol: $scope.quoteStockName, function: $scope.priceIndicators[startIndex], interval: "daily", time_period: 10, series_type: "close"};
				$http.get(URL, {params: paramsIndicator}).then(function(res) {
					$scope.chartsInfo[$scope.priceIndicators[startIndex]] = res.data;
					$timeout(seqRequest(startIndex+1), 200);
					$scope.indiCalled = true;	
				});	
			} else {
				console.log($scope.chartsInfo);
			}
		}
		$timeout(seqRequest(startIndex), 200);
		console.log($scope.datesCollection);
	};

	
	$scope.changeIndi = function(indiName) {
		$scope.chartsExpression = indiName;
		if ($scope.chartsExpression == 'Price') {
			$scope.drawPrice();
		}		
	}

	$scope.drawPrice = function() {
		var priceData = $scope.chartsInfo['Price'];
		if (priceData) {
				Highcharts.chart('chartsContainer', {
			    chart: {
			       //borderColor: '#D3D3D3',
			       //borderWidth: 2
			    },
			    xAxis: {
			        categories: $scope.formattedDates,
			        //tickInterval: 5
			    },
			    title: {
			        text: $scope.quoteStockName+" "+"Stock Price and Volume",
			    },
			    subtitle: {
			        text: '<a href="https://www.alphavantage.co/" target="_blank">Source: Alpha Vantage</a>',       
			        useHTML: true
			    },
			    yAxis: [{
			    	
			        title: {
			            text: 'Stock Price'
			        },
			        //min: minValue * 0.9      
			    }, {
			        title: {
			            text: 'Volume'
			        },
			        //max: volumeMax * 6,
			        opposite: true
			    }],
			    legend: {
			        //layout: 'vertical',
			        //align: 'right',
			        //verticalAlign: 'middle'
			    },
			    plotOptions: {
			        area: {
			        	tooltip:{
			            	valueDecimals: 2
			    		},
			            marker: {
			                enabled: false
			            },
			            //threshold: null		
			        }       
			    },
			    series: [{
			    	type: 'area',
			    	name: 'Price',
			        data: $scope.closePrice,
			        //color: '#F37F81',
			        yAxis: 0
			    }, {
			    	type: 'column',
			    	name: 'Volume',
			        data: $scope.volumeData,
			        //color: '#FFFFFF',
			        yAxis: 1

			    }, ]
			});			

		} else {
			//code to show error bar and message
		}


	}

	$scope.searchTextChange = function(text) {
		// console.log(text);
		// console.log(text.split("\\s+").length);
		if(text.length == 0 || text.split("\\s+").length == 0){
			$scope.disabled = true;
		} else {
			$scope.disabled = false;
		}
		// console.log("disabled", $scope.disabled);
	}

	// favorite stocks
	$scope.changeFav = function(stockName) {
		if ($scope.stockDetails[stockName]) {
			delete $scope.stockDetails[stockName];
			$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
		} else {
			$scope.stockDetails[stockName] = {};
			$scope.refresh();
		}
		
	}

	$scope.refresh = function() {
		Object.keys($scope.stockDetails).forEach(function(stock, index) {
			URL = preURL+"/stock/query";
			var params = {symbol: stock, function: "TIME_SERIES_DAILY"};
			$http.get(URL, {params: params}).then(function(res) {
				console.log(res);
				var currentDateTemp = res.data["Meta Data"]["3. Last Refreshed"];
				var currentDate = currentDateTemp.substring(0, 10); //yyyy-mm-dd
				var temp = res.data["Time Series (Daily)"][currentDate];
				var submit = {};
				submit['symbol'] = stock;
				submit['close'] = temp["4. close"];
				submit['volume'] = temp["5. volume"];
				submit['change'] = (temp["4. close"] - temp["1. open"]).toFixed(2);
				submit['changePercent'] = (submit['change']/temp["1. open"]).toFixed(2);
				$scope.stockDetails[stock] = submit;
				$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
			});
		});
	}

  	$scope.getStock = function(searchText) {
  		URL = preURL+"/autocomplete"
    	var params = {input: searchText};
    	return $http.get(URL, {params: params})
    	.then(function(res) {
    	console.log(res);
    	for (var i=0; i<res.data.length; i++) {
    		res.data[i]["show"] = res.data[i]["Symbol"]+" - "+res.data[i]["Name"]+" ("+res.data[i]["Exchange"]+")"; 
    	}
      	return res.data;
    });
  };
}
