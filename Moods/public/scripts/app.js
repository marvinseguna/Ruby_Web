//SPA functionality
var app = angular.module( 'moodsApp', [
  'ngRoute'
]);
var currPage = 0;
getNotificationPermission();
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
function getNotificationPermission() {
	Notification.requestPermission().then( function( result ) {
	});
}

// function setServiceWorker() {
	// subscribe();
	
	// if ( 'serviceWorker' in navigator ) {  
		// navigator.serviceWorker.register( '/scripts/sw.js' ).then( function( reg ) {
			// if( reg.installing ) {
				// console.log( 'Service worker installing' );
			// } 
			// else if( reg.waiting ) {
				// console.log( 'Service worker installed' );
			// } else if( reg.active ) {
				// console.log( 'Service worker active' );
			// }
			
			// initialiseState( reg );
		// });  
	// }
	// //checkSubmission();
// }
function checkSubmission() {
	//send request to server to check last submission time
	$.getJSON( "/GetLastSubmission", function( showNotification ) {
		if( showNotification.show_it ) {
			notifyUser();
		}
		setTimeout( checkSubmission, 900000 );
	});
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
			var win = window.open( '#/', 'moods' );
			win.focus();
			notification.close();
		}
	});
}