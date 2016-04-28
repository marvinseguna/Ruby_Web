var currPage = 0;
var timeInterval = 600000;

//SPA functionality
var app = angular.module( 'moodsApp', [
  'ngRoute'
]);

getNotificationPermission();

//Page routing
app.config([ '$routeProvider', function ( $routeProvider ) {
  $routeProvider
    .when( "/", { templateUrl: "views/mood_choice.erb", controller: "MoodController" })
    .when( "/dataview", { templateUrl: "views/data_view.erb", controller: "DataViewController" })
    .when( "/infoview", { templateUrl: "views/info_view.erb", controller: "InfoViewController" });
}]);

//Controllers for each page
app.controller( 'MoodController', function () {
	setAppViewModel()
	changeButtonMoods();
	currPage = 0;
});
app.controller( 'DataViewController', function () {
	initCalendars();
	
	formGrid( null, null ); // default is 7-days
	changeButtonHistory();
	currPage = 1;
});
app.controller( 'InfoViewController', function() {
	setTabHandler( currPage );
});

//Notification logic
function getNotificationPermission() {
	if( Notification.permission !== "granted" ) {
		Notification.requestPermission();
	}
}