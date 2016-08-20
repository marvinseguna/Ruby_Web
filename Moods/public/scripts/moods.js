/* USER FUNCTIONS */
MOODS.setUserInputWidth = function( dropDownSupplied ) { /* true if value was supplied by selecting combo box, false otherwise */
	var userLength = dropDownSupplied ? MOODS.userData.user.length : document.getElementById( 'user' ).value.length;
	var length = ( userLength < 8 ) ? 23 : 19;
	document.getElementById( 'user' ).style.width = "" + ( userLength * length ).toString() + "px";
};
MOODS.setUserAndTeam = function() {
	try {
		var user = document.getElementById( "user" ).value;
		if( user == "" ) throw "No input was provided!";
		
		var userRegex = /^([A-Za-z\.]*?):?([A-Za-z\s]*)$/;
		var parsedUser = userRegex.exec( user );
		if( parsedUser[0].replace(/\s/g, '') == "" ) throw "No input was provided!"; /* Spaces only are not allowed */
		if( parsedUser == null ) throw "Error while parsing user provided.";
		if( parsedUser[1] == '' ) parsedUser[1] = document.getElementById( 'team' ).innerHTML; /* No error because tabbing out of an already entered username is still valid */
		
		MOODS.userData.team = parsedUser[1];
		MOODS.userData.user = parsedUser[2];
	}
	catch( error ) {
		alert( error );
		console.log( error );
	}
	finally {
		document.getElementById( 'user' ).value = MOODS.userData.user;
		document.getElementById( 'team' ).innerHTML = MOODS.userData.team;
		MOODS.setUserInputWidth( false );
	}
}
MOODS.checkNewUser = function( team, user ){
	var fullUser = team + ":" + user
	var present = $.inArray( fullUser, MOODS.userData.users );
	if( present < 0 ) MOODS.userData.users.push( fullUser );
}
MOODS.setupHTMLElements = function() {
	$( "#user" ).autocomplete({ 
		minLength: 0,
		source: MOODS.userData.users,
		select: function( e, ui ) {
			MOODS.userData.user = ui.item.value;
			MOODS.setUserInputWidth( true );
		}
	}).focus(function() {
		$(this).autocomplete("search", $(this).val());
	});
	$( "#team" ).autocomplete({
		minLength: 0,
		source: MOODS.getUniqueTeams( MOODS.userData.users ),
		select: function( e, ui ) {
			MOODS.userData.team = ui.item.value;
		}
    }).focus(function() {
		$(this).autocomplete("search", $(this).val());
	});
	
	if( MOODS.userData.user == 'Full name' ) {        // this implies that cookie is not / was never set!
		document.getElementById( 'team' ).setAttribute( "contentEditable", true );
	}
	document.getElementById( 'user' ).value = MOODS.userData.user;
	document.getElementById( 'team' ).innerHTML = MOODS.userData.team;
	
	MOODS.setUserInputWidth( false );
}
MOODS.setMoodsPage = function() {		
	$( "#message" ).html( MOODS.motivation.message ).fadeTo( 100, 0.4 );
	$( "#author" ).html( MOODS.motivation.author ).fadeTo( 100, 0.4 );
	
	if( MOODS.userData.users.length == 0 ) {
		$.getJSON( "/GetUserInfo" )
		.done( function( userInfo ) {
			MOODS.userData.users = userInfo.users;
			MOODS.userData.user = userInfo.user;
			MOODS.userData.team = userInfo.team;
			
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
MOODS.getUniqueTeams = function( users ) {
	var teams = users.map( function( user ) {
		return user.split( ":" )[0];
	});
	uniqueTeams = teams.filter( function( team, pos ) {
		return teams.indexOf( team ) == pos;
	});
	return uniqueTeams;
}

/* SUBMITS MOOD TO SERVER */
MOODS.acceptInput = function( mood ) {
	if( MOODS.userData.user == '' || MOODS.userData.user == 'Full name' || MOODS.userData.team == '' ) {        // If username/team is not provided -> alert
		alert( 'Kindly provide full name (e.g. Joe Smith) and the respective team before selecting mood!' );
		document.getElementById( 'user' ).value = "Full name";
		document.getElementById( 'team' ).innerHTML = "Team";
	}
	else {        // Else, add user in cookie & file system
		var data = { username: MOODS.userData.user, team: MOODS.userData.team, mood: mood }
		$.getJSON( "/SaveMood", data )
		.done( function( motivation ) {
			MOODS.checkNewUser( MOODS.userData.team, MOODS.userData.user );
			
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

/* PAGE LISTENERS */
MOODS.userListener = function( e ){
	if( e.keyCode == 13 ) MOODS.setUserAndTeam();
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


