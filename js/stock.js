var preURL = "http://shuhuihe571hw8-env.us-east-2.elasticbeanstalk.com";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','ngMaterial','ui.toggle']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval, $window, $timeout, $interval) {
	$scope.init = function(){
		$scope.disabled = true;
		$scope.showDetail = false;
		$scope.quoted = false;
		$scope.error = false;
		$scope.reverse = false;
		$scope.property = null;

		$scope.records = ["Symbol", "Stock Price", "Change (Change Percent)", "Volume"];
		$scope.sortChoices = ["Default", "Symbol", "Stock Price", "Change", "Change Percent", "Volume"];
		$scope.priceIndicators = ["Price", "SMA", "EMA", "STOCH", "RSI", "ADX", "CCI", "BBANDS", "MACD"];
		$scope.chartsInfo = {};
		$scope.datesCollection = [];
		$scope.formattedDates =[];
		$scope.closePrice = [];
		$scope.volumeData = [];
		$scope.hisData =[];
		$scope.arrStocks = [];

		$scope.selectSortBy = $scope.sortChoices[0]; //default
		$scope.orderChoices = ["Ascending", "Descending"];
		$scope.selectOrderBy = $scope.orderChoices[0];
		$scope.expression = "cs"; //current stock
		$scope.chartsExpression = "Price";
		$scope.stockDetails = {};
		$scope.downColor = "red";
		$scope.upColor = "green";


		if ($window.localStorage.getItem("favorite") === null){
			$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
		} else {
			$scope.stockDetails = JSON.parse($window.localStorage.getItem("favorite"));
		}
		$scope.refresh();
	};

	$scope.notFocused = function(text) {
		$scope.focused = false;
		$scope.searchTextChange(text);
	}

	//clear text field and errors
	$scope.clear = function() { 
		$scope.cleared = true;
		$scope.searchText = "";
		$scope.selectedItem = "";
		$scope.showDetail = false;
		$scope.redMark = false;
		$scope.disabled = true;
		$scope.quoted = false;
		// $scope.init();
	};

	$scope.getQuote = function(stockSearch) {
		$scope.expression = "cs";
		$scope.quoteStockName = stockSearch;
		$scope.showDetail = true;
		$scope.quoted = false;
		$scope.newsError = false;
		$scope.error = false;
		$scope.redMark = false;
		$scope.datesCollection = [];
		$scope.formattedDates =[];
		$scope.closePrice = [];
		$scope.volumeData = [];
		$scope.hisData =[];
		$scope.chartsInfo = {};
		$scope.csDetails = {};
		$scope.errorInfo = {};
		
		URL = preURL+"/stock/query";
		var params = {symbol: $scope.quoteStockName, function: "TIME_SERIES_DAILY", outputsize: "full"};
		$http.get(URL, {params: params}).then(function(res) {
			try{
				var timeSeriesDaily = [];
				var timeSet = res.data["Time Series (Daily)"]; // error would occur
				angular.forEach(timeSet, function(value, key) {
				  	this.push(value);
				  	$scope.datesCollection.push(key);
				}, timeSeriesDaily);

				for (var i = 120; i >= 0; i--) {
					var dates  = $scope.datesCollection[i];
					var formatted = (dates.split('-').join('/')).substring(5,10);
					$scope.formattedDates.push(formatted);
					$scope.closePrice.push(parseFloat(timeSeriesDaily[i]["4. close"]));
					$scope.volumeData.push(parseInt(timeSeriesDaily[i]["5. volume"]));
				}			
				for (var i = Math.min(999, $scope.datesCollection.length-1); i >= 0; i--) { //1000 data 
					var hisDate = new Date($scope.datesCollection[i]);
					$scope.hisData.push([hisDate.getTime(), parseFloat(timeSeriesDaily[i]["4. close"])]);
				}

				var previousDate = timeSeriesDaily[1];
				var currentDateTemp = res.data["Meta Data"]["3. Last Refreshed"];
				var closedTime = "16:00:00"; 
				var currentDate = currentDateTemp.substring(0, 10); //yyyy-mm-dd
				var temp = timeSet[currentDate];
				var submit = {};
				submit['symbol'] = $scope.quoteStockName;
				submit['volume'] = temp["5. volume"];
				submit['change'] = (temp["4. close"] - previousDate["4. close"]).toFixed(2);
				submit['changePercent'] = (submit['change']/previousDate["4. close"] * 100).toFixed(2);
				submit['open'] = temp["1. open"];
				submit['low'] = temp["3. low"];
				submit['high'] = temp["2. high"];
				submit['lastPrice'] = temp["4. close"];

				if (currentDateTemp.length == 10 || (currentDateTemp.indexOf(closedTime) !== -1)) {
					submit['close'] = temp["4. close"]; //already closed today
					submit['timestamp'] = currentDate + " " + closedTime + " EDT"; //EDT?
					$scope.newestDate = currentDate;
				} else {
					submit['close'] = previousDate["4. close"]; // today not closed yet
					submit['timestamp'] = currentDateTemp + " EDT"; //EDT?
					$scope.newestDate = currentDateTemp;
				}
				$scope.chartsInfo["Price"] = res.data;
				$scope.csDetails = submit;
				$scope.quoted = true;
			}
			catch(e){
				$scope.error = true;
				$scope.errorInfo['Price'] = true;
			}

			//call all indicators
			var startIndex = 1;
			var seqRequest = function(startIndex){
				if (startIndex + 1 <= $scope.priceIndicators.length) {
					var paramsIndicator = {symbol: $scope.quoteStockName, function: $scope.priceIndicators[startIndex], interval: "daily", time_period: 10, series_type: "close"};
					$http.get(URL, {params: paramsIndicator}).then(function(res) {
						$scope.chartsInfo[$scope.priceIndicators[startIndex]] = res.data;
						if ($scope.chartsExpression == $scope.priceIndicators[startIndex]) {
							$scope.changeIndi($scope.chartsExpression);
						}	
					});	
					seqRequest(startIndex+1);
				}

			}

			if ($scope.chartsExpression == $scope.priceIndicators[0]) {
				$scope.changeIndi($scope.chartsExpression);
			}

			seqRequest(startIndex);
			$scope.getNews(stockSearch);
			$scope.drawHis();
		});
	};
	
	$scope.changeIndi = function(indiName) {
		$scope.chartsExpression = indiName;
		if ($scope.chartsExpression == 'Price') {
			$scope.drawPrice();
		} else {
			//$scope.chartsExpression
			$scope.drawIndi();
		}		
	}

	$scope.drawPrice = function() {
		var priceData = $scope.chartsInfo['Price'];
		if (priceData) {
			$scope.option1 = {					
			    chart: {
			       zoomType: 'x',
			       height: 300
			    },
			    xAxis: {
			        categories: $scope.formattedDates,
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
			    }, {
			        title: {
			            text: 'Volume'
			        },
			        opposite: true
			    }],
			    plotOptions: {
			        area: {
			        	tooltip:{
			            	valueDecimals: 2
			    		},
			            marker: {
			                enabled: false
			            },		
			        }       
			    },
			    series: [{
			    	type: 'area',
			    	name: 'Price',
			        data: $scope.closePrice,
			        color: '#0000FF',
			        fillOpacity: 0.1,
			        yAxis: 0
			    }, {
			    	type: 'column',
			    	name: 'Volume',
			        data: $scope.volumeData,
			        color: '#FF0000',
			        yAxis: 1
			    }, ]
			};			
			$scope.chart = Highcharts.chart('chartsContainer', $scope.option1);
		}
	}

	$scope.drawIndi = function() {
		var indiDataAll = [];
		var dataSet = [];
		var addCall = $scope.chartsExpression;
		var indiEntry = "Technical Analysis: "+$scope.chartsExpression;
		if ($scope.chartsInfo[$scope.chartsExpression]) {

			try{
				var indiData = $scope.chartsInfo[$scope.chartsExpression];
				var lastRefresh = indiData["Meta Data"]["3: Last Refreshed"];
				var indicatorName = indiData["Meta Data"]["2: Indicator"];
				var tecAnalysis = indiData[indiEntry];
				if (tecAnalysis[lastRefresh]) {
					var indiKeys = Object.keys(tecAnalysis[lastRefresh]);
					for (var i = 120; i >0; i--) {
						var indiDate = $scope.datesCollection[i]; //2017-mm-dd
						var indiValues = tecAnalysis[indiDate];				
						indiDataAll.push(indiValues);
					}
					var newestIndiValues = tecAnalysis[lastRefresh];
					indiDataAll.push(newestIndiValues);
					
					var set = [];
					for (var i = 0; i < indiKeys.length; i++) { //1-3
						for (var j = 0; j < indiDataAll.length; j++) { //121
							set.push(parseFloat(indiDataAll[j][indiKeys[i]]));
						}
						dataSet.push(set);
						set = [];
					}

					$scope.option2 = {
						chart: {
			        		zoomType: 'x',
		   					height: 300
						},
			    		xAxis: {
			    			categories: $scope.formattedDates,
			    		},
			    		title: {
		    				text: indicatorName
						},
						subtitle: {
		    				text: '<a href="https://www.alphavantage.co/" target="_blank">Source: Alpha Vantage</a>',       
		    				useHTML: true
						},
						yAxis: [{					
						    title: {
						        text: $scope.chartsExpression
						    },   
						}],
					    series:[]		
					};
					for (var i = 0; i < dataSet.length; i++) {
						$scope.option2.series.push({data: dataSet[i], name: $scope.quoteStockName+" "+indiKeys[i]});
					}	
			        $scope.chart = Highcharts.chart('chartsContainer', $scope.option2);
				} 
			}
			catch(e){
				$scope.errorInfo[$scope.chartsExpression] = true;
			}
		}
	}

	$scope.drawHis = function() {
	    $scope.hisChart = Highcharts.stockChart('hisContainer', {
	        title: {
	            text: $scope.quoteStockName+" "+"Stock Value",
	        },
	        subtitle: {
	            text: '<a href="https://www.alphavantage.co/" target="_blank">Source: Alpha Vantage</a>',       
    			useHTML: true
	        },
	        xAxis: {
	        	type: 'datetime'
	        },
	        yAxis: {
	        	title: {
	        		text: "Stock Value"
	        	}
	        },
	        rangeSelector: {
	        	selected: 0,
                buttons: [{
                    type: 'week',
                    count: 1,
                    text: '1w',
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m',
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }]
            },
    		tooltip: {
    			split: false
			},
	        series: [{
	            name: $scope.quoteStockName,
	            data: $scope.hisData,
	            type: 'area',
	            threshold: null,
	            tooltip: {
	                valueDecimals: 2
	            }
	        }],
	    });
	}
	

	$scope.searchTextChange = function(text) {
		if(!$scope.cleared) {
			if(!text || text.length == 0 || text.trim().length == 0){
				$scope.disabled = true;
				$scope.redMark = true;
			} else {
				$scope.disabled = false;
				$scope.redMark = false;
			}
		} else {
			$scope.cleared = false;
		}
	}

	// favorite stocks
	$scope.changeFav = function(stockName) {
		if ($scope.stockDetails[stockName]) {
			delete $scope.stockDetails[stockName];
			$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
		} else {
			$scope.stockDetails[stockName] = {"symbol": stockName, "close": "pending", "volume": "pending", "change": "pending"};
			$scope.refresh();
		}
		$scope.sortBy();	
	}

	$scope.refresh = function() {
		console.log("begin refresh");
		Object.keys($scope.stockDetails).forEach(function(stock, index) {
			URL = preURL+"/stock/query";
			var params = {symbol: stock, function: "TIME_SERIES_DAILY"};
			$http.get(URL, {params: params}).then(function(res) {
				console.log(res);
				var currentDateTemp = res.data["Meta Data"]["3. Last Refreshed"];
				var timeDaily = res.data["Time Series (Daily)"];
				var dayBeforeTemp = [];
				angular.forEach(timeDaily, function(value, key) {
				  	dayBeforeTemp.push(value);
				});
				var dayBefore = dayBeforeTemp[1];
				var currentDate = currentDateTemp.substring(0, 10); //yyyy-mm-dd
				var temp = timeDaily[currentDate];
				var submit = {};
				submit['symbol'] = stock;
				submit['close'] = temp["4. close"];
				submit['volume'] = temp["5. volume"];
				submit['change'] = (temp["4. close"] - dayBefore["4. close"]).toFixed(2);
				submit['changePercent'] = (submit['change']/dayBefore["4. close"] * 100).toFixed(2);
				$scope.stockDetails[stock] = submit;
				$window.localStorage.setItem('favorite', JSON.stringify($scope.stockDetails));
			});
		});
	}

	//automatic refresh
	setInterval(function() { 
	    if($scope.isRefreshing){
	      $scope.refresh();
	      console.log("refresh called");
	    }
	 }, 5000);

  	$scope.getStock = function(searchText) {
  		if(!$scope.redMark){
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
  		} else {
  			return {};
  		}
  	};

	$scope.getNews = function(stockNews) {
		$scope.newsQuoted = false;
		$scope.newsData = [];
	  	URL = preURL+"/stock/news";
	  	var params = {SYMBOL: stockNews};
		$http.get(URL, {params: params}).then(function(res) {
			if (res.data == "newsError") {
				$scope.newsError = true;
			} else {
				$scope.newsData = res.data;
				$scope.newsQuoted = true;				
			}

		});		
	}

	$scope.convStockDeatils = function() {
		$scope.arrStocks = [];
		angular.forEach($scope.stockDetails, function(value, key) {
			$scope.arrStocks.push(value);
		});
		for (var i = 0; i < $scope.arrStocks.length; i++) {
			$scope.arrStocks[i]["close"] = parseFloat($scope.arrStocks[i]["close"]);
			$scope.arrStocks[i]["volume"] = parseFloat($scope.arrStocks[i]["volume"]);
			$scope.arrStocks[i]["change"] = parseFloat($scope.arrStocks[i]["change"]);
			$scope.arrStocks[i]["changePercent"] = parseFloat($scope.arrStocks[i]["changePercent"]);
		}
	}

	$scope.sortBy = function() {
		$scope.convStockDeatils();
		if ($scope.selectSortBy == "Default") {$scope.property = null;}
		if ($scope.selectSortBy == "Symbol") {$scope.property = "symbol";}
		if ($scope.selectSortBy == "Stock Price") {$scope.property = "close";}
		if ($scope.selectSortBy == "Change") {$scope.property = "change";}
		if ($scope.selectSortBy == "Change Percent") {$scope.property = "changePercent";}
		if ($scope.selectSortBy == "Volume") {$scope.property = "volume";} 
	    $scope.reverse = ($scope.selectOrderBy == "Descending") ? true : false;
  	};

	$scope.shareFB = function() {
		var exportUrl = 'http://export.highcharts.com/';
		var optionStr = "";
		if ($scope.chartsExpression == "Price") {
			 optionStr = JSON.stringify($scope.option1);
		} else {
			 optionStr = JSON.stringify($scope.option2);
		}
		var params = {async: true, type: "image/png", options: optionStr};	

        $http({
            url: exportUrl,
            method: "POST",
            data: params
        }).then(function (res) {
        	$scope.urlFB = res.data;
        	console.log($scope.urlFB);
		    FB.ui({
		    	appId: '1955986657996915',
		        method: 'feed',
		        picture: exportUrl+$scope.urlFB
		    }, (response) => {
			   if (response && !response.error_message) {
			    $window.alert("Posted Successfully");
			   } else {
			    $window.alert("Not Posted");
			   }
		    });
        });
	};
}

