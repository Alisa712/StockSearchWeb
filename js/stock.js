var preURL = "http://localhost";

var app = angular.module("myModule", ['ngAnimate','ngSanitize','ui.bootstrap']);
app.controller("myController", mainControl);

function mainControl($scope, $http, $interval){
	$scope.init = function(){

	};
}