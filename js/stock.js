var preURL = "http://localhost:3000";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','mgcrea.ngStrap']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval){
	$scope.init = function(){

	};
	$scope.selectedStock = '';

  	$scope.getStock = function(viewValue) {
  		URL = preURL+"/autocomplete"
    	var params = {input: viewValue};
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