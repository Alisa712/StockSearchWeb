var preURL = "http://localhost:3000";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','ngMaterial']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval, $window){
	$scope.init = function(){
		$scope.disabled = true;
		$scope.showDetail = false;
		$scope.quoted = false;
		$scope.records = ["Symbol", "Stock Price", "Change (Change Percent)", "Volume"];
		$scope.sortChoices = ["Default", "Symbol", "Stock Price", "Change", "Change Percent", "Volume"];
		//$scope.leftTable = ["Stock Ticker Symbol", "Last Price", "Change (Change Percent)", ]
		$scope.selectSortBy = $scope.sortChoices[0];
		$scope.orderChoices = ["Ascending", "Descending"];
		$scope.selectOrderBy = $scope.orderChoices[0];
		$scope.expression = "cs"; //current stock
		$scope.stockDetails = {};
		$scope.downColor = "red";
		//$scope.downImg = "./img/Up.png";
		$scope.upColor = "green";

		// $window.localStorage.removeItem("favorite");
		if ($window.localStorage.getItem("favorite") === null){
			$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
		} else {
			$scope.stockDetails = JSON.parse($window.localStorage.getItem("favorite"));
		}
		console.log($scope.stockDetails);
	};

	$scope.clear = function() {
		//TODO: implement clear function here
	};

	$scope.getQuote = function() {
		$scope.quoteStockName = $scope.searchText;
		$scope.showDetail = true;
		$scope.quoted = false;

		URL = preURL+"/stock/query";
		var params = {symbol: $scope.quoteStockName, function: "TIME_SERIES_DAILY"};
		$http.get(URL, {params: params}).then(function(res) {
			console.log(res);
			var timeSeriesDaily = [];
			var timeSet = res.data["Time Series (Daily)"];

			angular.forEach(timeSet, function(value, key) {
			  	this.push(value);
			}, timeSeriesDaily);

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

			$scope.csDetails = submit;
			$scope.quoted = true;
		});
	};

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
