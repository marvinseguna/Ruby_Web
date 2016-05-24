var currPage = 0;		// indicates current page. 0=Moods, 1=Grid view
var timeInterval = 600000;		// notification request timeout
var users = null;		// info of all users stored in the system
var currentUser = "";		// user retrieved from cookie
var currentTeam = "";		// team retrieved from cookie

init();

//Single Page Application functionality
var app = angular.module( 'moodsApp', ['ngRoute']);

//--------------------Page routing--------------------------//
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
//-----------------------------------------------------------------------------//
function init() {
	if( Notification.permission !== "granted" ) {		// Get notification permission for full functionality
		Notification.requestPermission();
	}
	
	$.getJSON( "/GetAllUsers" )
	.done( function( usersInfo ) {
		users = usersInfo.users;
	})
	.fail( function( usersInfo ) {
		alert( 'GetAllusers: Failed to retrieve users from file!' );
	});
		
	$.getJSON( "/GetPreviousInfo" )
	.done( function( cookieUser ) {
		currentUser = cookieUser.previous_user;
		currentTeam = cookieUser.team;
	})
	.fail( function( usersInfo ) {
		alert( 'GetPreviousInfo: Failed to retrieve cookies from server! Setting defaults.' );
		currentUser = "Enter full name";
		currentTeam = "CS";
	});
}