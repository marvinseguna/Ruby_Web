//SPA functionality
var app = angular.module( 'moodsApp', [
  'ngRoute'
]);
var currPage = 0;
checkSubmission(); 

//To access variable from moods.js

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
	
	var currentDate = new Date();
	var fromDate = new Date();
	fromDate.setDate( currentDate.getDate() - 6 );		//1 week
	fillGrid( fromDate, currentDate );
	changeButtonHistory();
	currPage = 1;
});
app.controller( 'InfoViewController', function() {
	setTabHandler( currPage );
});

//Notification logic
function checkSubmission() {
	//send request to server to check last submission time
	
	//set timeout only if the notification should not be shown
	
	//else, show notification
}
function notifyUser() {
	var title;
	var options;

	title = 'Set your moods!';
	options = {
		body: 'You have 30minutes left to set your mood!',
		tag: 'preset'
	};

	Notification.requestPermission( function() {
		var notification = new Notification( title, options );
		notification.onclick = function() {
			window.open( '#/' );
			notification.close();
		}
	});
}