/* ALL VARIABLES FOR THE APPLICATION */
var MOODS = {};    //Main container to reduce global variables use
MOODS.currPage = 0;    //0=Moods, 1=Grid view
MOODS.timeInterval = 600000;    //Notification request timeout
MOODS.users = [];    //All users retrieved from server
MOODS.motivation = {
	message: "", //Motivational message in moods page
	author: ""   //Respective author
};
MOODS.app = angular.module( "moodsApp", ["ngRoute"] );    //Single Page Application functionality
/* NOTIFICATION HANDLERS */
MOODS.notification = function() {
	return {
		checkPermission: function() {
			if( Notification.permission !== "granted" ) {
				Notification.requestPermission();
			}
		},
		checkForNotification: function() {
			$.getJSON( "/GetLastSubmission" )
			.done( function( notification ) {
				if( notification.show ) {
					MOODS.notification.notifyUser();
				}
			});   
			setTimeout( MOODS.notification.checkForNotification, MOODS.timeInterval );
		},
		notifyUser: function() { 
			options = {
				body: 'Click here to be redirected to set your mood.',
				tag: 'preset',
				icon: 'images/logo.png'
			};    
			var notification = new Notification( 'Moods notifies how you feel ^_^', options );
			notification.onclick = function() {
				window.focus();
				notification.close();
			};
		}
	}
}();
/* EXECUTES FIRST STEPS FOR THE APPLICATION */
MOODS.init = function() {
	MOODS.notification.checkPermission();
	MOODS.notification.checkForNotification();
}();
/* CHANGES ICON FOR DATA VIEW/MOODS */
MOODS.changeStyles = function() {
	return {
		setUpperTab: function( url, imageSrc ) {
			var htmlElement = "<a href=\"#/" + url + "\" class=\"buttonLinks\" data-toggle=\"tooltip\">";
			htmlElement += "<img src=\"/images/" + imageSrc + ".png\" width=\"40\" height=\"40\" alt=\"submit\"/></a>";
			document.getElementById( "upperTab" ).innerHTML = htmlElement;
		},
		setDataViewButton: function() {
			if( document.getElementById( "upperTab" ) != null ) {
				MOODS.changeStyles.setUpperTab( "dataview", "time_machine_shaped" );
			}   
		},
		setMoodsButton: function() {
			if( document.getElementById( "upperTab" ) != null ) {
				MOODS.changeStyles.setUpperTab( "", "logo" );
			}   
		},
		disableGreeting: function() {
			document.getElementById( "greeting" ).style.visibility = "hidden";
		},
		enableGreeting: function() {
			document.getElementById( "greeting" ).style.visibility = "visible";
		}
	}
}();

/* PAGE ROUTING */
MOODS.app.config([ '$routeProvider', function ( $routeProvider ) {
	$routeProvider
		.when( "/", { templateUrl: "views/mood_choice.erb", controller: "MoodController" })
		.when( "/dataview", { templateUrl: "views/data_view.erb", controller: "DataViewController" })
		.when( "/infoview", { templateUrl: "views/info_view.erb", controller: "InfoViewController" });
}]);

/* CONTROLLERS FUNCTIONS */
MOODS.app.controller( 'MoodController', function () {
	particlesJS.load('particles-js', 'assets/particles.json', function() {});
	MOODS.setMoodsPage();
	MOODS.changeStyles.setDataViewButton();
	MOODS.changeStyles.enableGreeting();
	MOODS.currPage = 0;
});

MOODS.app.controller( 'DataViewController', function () {
	particlesJS.load('particles-js', 'assets/particles.json', function() {});
	MOODS.initCalendars();
	MOODS.formGrid(); // default is 7-days
	MOODS.changeStyles.setMoodsButton();
	MOODS.changeStyles.disableGreeting();
	MOODS.currPage = 1;
});

MOODS.app.controller( 'InfoViewController', function() {
	setTabHandler( MOODS.currPage );
});

MOODS.init;