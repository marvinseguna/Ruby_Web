/* HIGHLIGHTS ALL TEXT INSIDE SPAN ELEMENT */
MOODS.highlightSpanText = function( id ) {        
	var span = document.getElementById( id );
	var range = document.createRange();
	range.setStartBefore( span.firstChild );
	range.setEndAfter( span.lastChild );
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange( range );
};
/* VALIDATES USER AND TEAM VALUES */
MOODS.setUserAndTeam = function() {
	var parseUser = /^([A-Za-z\.]*?):?([A-Za-z\s]*)$/;
	var user = document.getElementById( "user" ).innerHTML;
	previousTeam = MOODS.appViewModel.team();
	
	var parsedUser = parseUser.exec( user );
	MOODS.appViewModel.team( parsedUser[1] );
	MOODS.appViewModel.user( parsedUser[2] );
	
	if( MOODS.appViewModel.team() == '' ) {
		MOODS.appViewModel.team( previousTeam );
	}
}
/* SUBMITS MOOD TO SERVER */
MOODS.acceptInput = function( mood ) {
	MOODS.setUserAndTeam();  
	
	if( MOODS.appViewModel.user() == '' || MOODS.appViewModel.user() == 'Full name' || MOODS.appViewModel.team() == '' ) {        // If username/team is not provided -> alert
		alert( 'Kindly provide full name (e.g. Joe Smith) and the respective team before selecting mood!' );
		MOODS.appViewModel.user( "Full name" );
		MOODS.appViewModel.team( "Team" );
	}
	else {        // Else, add user in cookie & file system
		var data = { username: MOODS.appViewModel.user(), team: MOODS.appViewModel.team(), mood: mood }
		$.getJSON( "/SaveMood", data )
		.done( function( motivation ) {
			MOODS.motivation.message = motivation.message;
			MOODS.motivation.author = motivation.author;
			
			$( "#message" ).stop( true ).fadeTo( 100, 1 );        //resets animations and removes others in queue
			$( "#author" ).stop( true ).fadeTo( 100, 1 );
			$( "#message" ).html( MOODS.motivation.message ).fadeTo( 60000, 0.4 );
			$( "#author" ).html( MOODS.motivation.author ).fadeTo( 60000, 0.4 );
			
			//registerSW();
		})
		.fail( function( state ) {
			alert( 'SaveMood: Error occurred when trying to save the mood / retrieve display message!' );
		});
	}
}
/* APPVIEWMODEL CREATOR */
MOODS.AppViewModel = function() {
	this.user = ko.observable( "Full name" );
	this.team = ko.observable( "Team" );
}
MOODS.setupHTMLElements = function() {
	$( "#user" ).autocomplete({ 
		source: MOODS.users
	});
	$( "#team" ).autocomplete({ 
		source: MOODS.getTeams( MOODS.users )
	});
	
	if( MOODS.appViewModel.user() == 'Full name' ) {        // this implies that cookie is not / was never set!
		document.getElementById( 'team' ).setAttribute( "contentEditable", true );
	}
	document.getElementById( 'user' ).innerHTML = MOODS.appViewModel.user();
	document.getElementById( 'team' ).innerHTML = MOODS.appViewModel.team();
}
MOODS.setMoodsPage = function() {		
	$( "#message" ).html( MOODS.motivation.message ).fadeTo( 100, 0.4 );
	$( "#author" ).html( MOODS.motivation.author ).fadeTo( 100, 0.4 );
	
	if( MOODS.users.length == 0 ) {
		MOODS.appViewModel = new MOODS.AppViewModel();
		ko.applyBindings( MOODS.appViewModel );
			
		$.getJSON( "/GetUserInfo" )
		.done( function( userInfo ) {
			MOODS.users = userInfo.users;
			MOODS.appViewModel.user( userInfo.user );
			MOODS.appViewModel.team( userInfo.team );
			
			MOODS.setupHTMLElements();
		})
		.fail( function() {
			alert( 'GetUserInfo: Failed to retrieve users data from server!' );
		});
	}
	else {
		MOODS.setupHTMLElements();
	}
}

MOODS.getTeams = function( users ) {
	var teams = users.map( function( user ) {
		return user.split( ":" )[0];
	});
	uniqueTeams = teams.filter( function( team, pos ) {
		return teams.indexOf( team ) == pos;
	});
	return uniqueTeams;
}

// Service Worker method
// function registerSW() {
	
	// var isFirefox = typeof InstallTrigger !== 'undefined';
	// if( isFirefox ) { // Service workers are not supported on the latest version of Firefox!
		// doNormalNotifications();
	// }
	// else {
		// navigator.serviceWorker.register( 'scripts/sw.js' )
		// .then( function( registration ) {
			// return registration.pushManager.getSubscription()
			// .then(function( subscription ) {
				// if ( subscription ) {
					// return subscription;
				// }
				
				// return registration.pushManager.subscribe({ userVisibleOnly: true })
			// });
		// }).then( function( subscription ) {
			// var data = { registrationId : subscription.endpoint }
			// $.getJSON( "/Register", data )
			// .done( function(  ) {
			// })
			// .fail( function( state ) {
				// alert( 'Call to server to register client has failed!' );
			// });
		// });
	// }
// }


