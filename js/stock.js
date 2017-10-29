var preURL = "http://localhost:3000";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','ngMaterial']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval){
	$scope.init = function(){

	};
	// $scope.selectedStock = '';

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

// function AppController($scope, $http) {
//   $scope.query = function(searchText) {
//     return $http
//       .get(BACKEND_URL + '/items/' + searchText)
//       .then(function(data) {
//         // Map the response object to the data object.
//         return data;
//       });
//   };
// }