//SPA functionality
var app = angular.module( 'moodsApp', [
  'ngRoute'
]);

//To access variable from moods.js
var appViewModel = null;
function getAppViewModel() {
	return appViewModel;
}

//Page routing
app.config([ '$routeProvider', function ( $routeProvider ) {
  $routeProvider
    .when( "/", { templateUrl: "views/mood_choice.erb", controller: "MoodController" })
    .when( "/dataview", { templateUrl: "views/data_view.erb", controller: "DataViewController" });
}]);

//Controllers for each page
app.controller( 'MoodController', function () {
	appViewModel = new AppViewModel();
	ko.applyBindings( appViewModel );
});
app.controller( 'DataViewController', function () {
	initCalendars();
	
	var currentDate = new Date();
	var fromDate = new Date();
	fromDate.setDate( currentDate.getDate() - 6 );		//1 week
	fillGrid( fromDate, currentDate );
});
