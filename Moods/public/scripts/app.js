//SPA functionality
var app = angular.module( 'moodsApp', [
  'ngRoute'
]);
var currPage = 0;
var timeInterval = 600000;
var tabName = 'moods';
getNotificationPermission();
checkSubmission();

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
function getNotificationPermission() {
	if( Notification.permission !== "granted" ) {
		Notification.requestPermission();
	}
}
function checkSubmission() {
	//send request to server to check last submission time
	$.getJSON( "/GetLastSubmission", function( showNotification ) {
		if( showNotification.show_it ) {
			notifyUser();
		}
	});
	setTimeout( checkSubmission, timeInterval );
}
function notifyUser() {
	var title;
	var options;

	title = 'Moods notifies how you feel ^_^';
	options = {
		body: 'Click here to be redirected to set your mood.',
		tag: 'preset',
		icon: 'images/logo.png'
	};

	Notification.requestPermission( function() {
		var notification = new Notification( title, options );
		notification.onclick = function() {
			window.focus();
			notification.close();
		}
	});
}