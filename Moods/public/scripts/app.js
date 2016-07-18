/* ALL VARIABLES FOR THE APPLICATION */
var MOODS = {};    //Main container to reduce global variables use
MOODS.currPage = 0;    //0=Moods, 1=Grid view
MOODS.timeInterval = 600000;    //Notification request timeout
MOODS.users = [];    //All users retrieved from server
MOODS.moveParticles = null;
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
MOODS.loadParticles = function() {
	particlesJS.load('particles-js-nomove', 'assets/particles_nomove.json', function() {});
	particlesJS.load('particles-js-move', 'assets/particles_move.json', function() {});
};
MOODS.checkParticleEnabler = function( setting = false ) {
	try {
		if( setting && MOODS.moveParticles != null ) {
			if( MOODS.moveParticles ) {
				document.getElementById( "particles-js-move" ).style.visibility = "visible";
				document.getElementById( "particles-js-nomove" ).style.visibility = "hidden";
				$( "#particlesEnabler" ).prop( "checked", true );
			}
			else {
				document.getElementById( "particles-js-move" ).style.visibility = "hidden";
				document.getElementById( "particles-js-nomove" ).style.visibility = "visible";
				$( "#particlesEnabler" ).prop( "checked", false );
			}
		}
		else {
			var enableParticles = $( '#particlesEnabler' ).is( ":checked" );
			if( enableParticles ) {
				MOODS.moveParticles = true;
			}
			else {
				MOODS.moveParticles = false;
			}
			MOODS.checkParticleEnabler( true );
		}
	}
	catch( error ) {
		console.log( "Warning in checkParticleEnabler! Method called before HTML element was loaded." );
	}
}
/* CHANGES ICON FOR DATA VIEW/MOODS */
MOODS.changeStyles = function() {
	return {
		setUpperTab: function( url, imageSrc ) {
			var htmlElement = "<a tabindex=\"7\" href=\"#/" + url + "\" class=\"buttonLinks\" data-toggle=\"tooltip\">";
			htmlElement += "<img src=\"/images/" + imageSrc + ".png\" width=\"40\" height=\"40\" alt=\"submit\"/></a>";
			document.getElementById( "upperTab" ).innerHTML = htmlElement;
		},
		checkIfElementExists: function( elementId ){
			var exists = document.getElementById( elementId ) == null ? false : true;
			return exists;
		},
		setDataViewButton: function() {
			MOODS.changeStyles.checkIfElementExists( "upperTab" ) ? 
				MOODS.changeStyles.setUpperTab( "dataview", "time_machine_shaped" ) : 
				setTimeout( MOODS.changeStyles.setDataViewButton, 200 );
		},
		setMoodsButton: function() {
			MOODS.changeStyles.checkIfElementExists( "upperTab" ) ? 
				MOODS.changeStyles.setUpperTab( "", "logo" ) : 
				setTimeout( MOODS.changeStyles.setMoodsButton, 200 );
		},
		disableGreeting: function() {
			MOODS.changeStyles.checkIfElementExists( "greeting" ) ? 
				( document.getElementById( "greeting" ).style.visibility = "hidden" ) : 
				setTimeout( MOODS.changeStyles.disableGreeting, 200 );
		},
		enableGreeting: function() {
			MOODS.changeStyles.checkIfElementExists( "greeting" ) ? 
				( document.getElementById( "greeting" ).style.visibility = "visible" ) : 
				setTimeout( MOODS.changeStyles.enableGreeting, 200 );
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
	MOODS.setMoodsPage();
	MOODS.changeStyles.setDataViewButton();
	MOODS.changeStyles.enableGreeting();
	MOODS.currPage = 0;
	MOODS.checkParticleEnabler( true );
});

MOODS.app.controller( 'DataViewController', function () {
	MOODS.initCalendars();
	MOODS.formGrid(); // default is 7-days
	MOODS.changeStyles.setMoodsButton();
	MOODS.changeStyles.disableGreeting();
	MOODS.currPage = 1;
});

MOODS.app.controller( 'InfoViewController', function() {
	MOODS.setTabHandler( MOODS.currPage );
	MOODS.changeStyles.disableGreeting();
});

MOODS.init;