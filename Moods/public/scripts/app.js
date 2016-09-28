/* ALL VARIABLES FOR THE APPLICATION */
var MOODS = {}; // Main container to reduce global variables use
MOODS.currPage = 0; // 0 = Moods, 1 = Grid view
MOODS.particlesLoaded = false; // indicates whether the particles were already loaded for the current session
MOODS.moveParticles = null; // indicates particles status
MOODS.timeInterval = 600000; //Notification request timeout
MOODS.userData = ({ //All users retrieved from server
	users: [],
	user: [],
	team: []
});    
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
	MOODS.particlesLoaded = true;
	
	$.getJSON( "/GetParticleEnabler", { change: false } )
	.done( function( particleResp ) {
		if( particleResp.moveParticles == 'true' ) {
			MOODS.moveParticles = true;
			MOODS.checkParticleEnabler( true );
		}
	})
	.fail( function( state ) {
		alert( 'GetParticleEnabler: Error occurred when trying to retrieve cookie!' );
	});
};
MOODS.checkParticleEnabler = function( setting = false ) {  // true to force move/disable particles
	try {
		if( setting && MOODS.moveParticles != null ) {
			if( MOODS.moveParticles ) {
				document.getElementById( "particles-js-move" ).style.visibility = "visible";
				document.getElementById( "particles-js-nomove" ).style.visibility = "hidden";
			}
			else {
				document.getElementById( "particles-js-move" ).style.visibility = "hidden";
				document.getElementById( "particles-js-nomove" ).style.visibility = "visible";
			}
		}
		else {
			$.getJSON( "/GetParticleEnabler", { change: true } )
			.done( function( particleResp ) {
				MOODS.moveParticles = ( particleResp.moveParticles === 'true' );
				MOODS.checkParticleEnabler( true );
			});
		}
	}
	catch( error ) {
		console.log( "Warning in checkParticleEnabler! Method called before HTML element was loaded." );
	}
}
/* CHANGES ICON FOR DATA VIEW/MOODS */
MOODS.changeStyles = function() {
	return {
		checkIfElementExists: function( elementId ){
			var exists = document.getElementById( elementId ) == null ? false : true;
			return exists;
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
	MOODS.changeStyles.enableGreeting();
	MOODS.currPage = 0;
	MOODS.setMoodsPage();
	if( !MOODS.particlesLoaded ) MOODS.loadParticles();
	if( MOODS.moveParticles ) $( "#particlesEnabler" ).prop( "checked", true );
});

MOODS.app.controller( 'DataViewController', function () {
	MOODS.initCalendars();
	MOODS.formGrid(); // default is 7-days
	MOODS.changeStyles.disableGreeting();
	MOODS.currPage = 1;
	if( !MOODS.particlesLoaded ) MOODS.loadParticles();
});

MOODS.app.controller( 'InfoViewController', function() {
	MOODS.setTabHandler( MOODS.currPage );
	MOODS.changeStyles.disableGreeting();
	if( !MOODS.particlesLoaded ) MOODS.loadParticles();
});

MOODS.init;