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
		$scope.selectSortBy = $scope.sortChoices[0];
		$scope.orderChoices = ["Ascending", "Descending"];
		$scope.selectOrderBy = $scope.orderChoices[0];
		$scope.expression = "cs"; //current stock
		$scope.stockDetails = {};
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
			var currentDateTemp = res.data["Meta Data"]["3. Last Refreshed"];
			var currentDate = currentDateTemp.substring(0, 10); //yyyy-mm-dd
			var temp = res.data["Time Series (Daily)"][currentDate];
			var submit = {};
			submit['symbol'] = $scope.quoteStockName;
			submit['close'] = temp["4. close"];
			submit['volume'] = temp["5. volume"];
			submit['change'] = (temp["4. close"] - temp["1. open"]).toFixed(2);
			submit['changePercent'] = (submit['change']/temp["1. open"]).toFixed(2);
			submit['timestamp'] = currentDateTemp; //EDT?
			submit['open'] = temp["1. open"];
			$scope.csDetails = submit;
			$scope.quoted = true;
		});

			// var newestTemp = res.data["Meta Data"]["3. Last Refreshed"];
			// var newest = newestTemp.substring(0, 9);
			// var newestInfo = res.data["Time Series (Daily)"][newest];
			// var leftTable = {};
			// leftTable['Stock Ticker Symbol'] = $scope.searchText;
			// leftTable['Last Price'] = newestInfo["4. close"];
			// leftTable['Change (Change Percent)'] = (newestInfo["4. close"] - newestInfo["1. open"]).toFixed(2); 


		// });

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
