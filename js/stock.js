var preURL = "http://localhost:3000";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','ngMaterial']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval){
	$scope.init = function(){
		$scope.disabled = true;
		$scope.showDetail = false;
		$scope.records = ["Symbol", "Stock Price", "Change (Change Percent)", "Volume"];
		$scope.sortChoices = ["Default", "Symbol", "Stock Price", "Change", "Change Percent", "Volume"];
		$scope.selectSortBy = $scope.sortChoices[0];
		$scope.orderChoices = ["Ascending", "Descending"];
		$scope.selectOrderBy = $scope.orderChoices[0];


	};

	$scope.clear = function() {
		//TODO: implement clear function here
	};

	$scope.getQuote = function() {
		console.log($scope.searchText);
		$scope.showDetail = true;
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
	$scope.checkDefault = function() {
		return $scope.selectSortBy == "Default";
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
