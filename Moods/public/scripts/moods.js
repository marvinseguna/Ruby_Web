/* ENLARGE INPUT TEXT AS REQUIRED */
MOODS.setUserInputWidth = function() {
	var input = document.getElementById( 'user' );
	input.onkeypress = input.onkeydown = input.onkeyup = function(){
		setTimeout(function(){
			var x = document.getElementById( 'user' ).value;
			
			if( x.length < 8 ) {
				document.getElementById( 'user' ).style.width = "" + ( x.length * 25 ).toString() + "px";
			}
			else {
				document.getElementById( 'user' ).style.width = "" + ( x.length * 17 ).toString() + "px";
			}
		}, 1);
	}
	var x = document.getElementById( 'user' ).value;
	document.getElementById( 'user' ).style.width = "" + ( x.length * 17 ).toString() + "px";
};
/* VALIDATES USER AND TEAM VALUES */
MOODS.setUserAndTeam = function() {
	var parseUser = /^([A-Za-z\.]*?):?([A-Za-z\s]*)$/;
	var user = document.getElementById( "user" ).value;
	previousTeam = MOODS.appViewModel.team();
	previousUser = MOODS.appViewModel.user();
	
	/* If the values are found for the AppViewModel variables, no changes will be executed from Knockout */
	MOODS.appViewModel.team('foo');
	MOODS.appViewModel.user('foo');
	
	var parsedUser = parseUser.exec( user );
	if( parsedUser != null ) {
		MOODS.appViewModel.team( parsedUser[1] );
		MOODS.appViewModel.user( parsedUser[2] );
	}
	
	if( MOODS.appViewModel.team() == '' ) {
		MOODS.appViewModel.team( previousTeam );
	}
	if( MOODS.appViewModel.user() == '' ) {
		MOODS.appViewModel.user( previousUser );
	}
}
/* SUBMITS MOOD TO SERVER */
MOODS.acceptInput = function( mood ) {
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
		minLength: 0,
		source: MOODS.users,
		select: function( e, ui ) {
			MOODS.appViewModel.user( ui.item.value );
		}
	}).focus(function() {
		$(this).autocomplete("search", $(this).val());
	});
	$( "#team" ).autocomplete({
		minLength: 0,
		source: MOODS.getTeams( MOODS.users ),
		select: function( e, ui ) {
			MOODS.appViewModel.team( ui.item.value );
		}
    }).focus(function() {
		$(this).autocomplete("search", $(this).val());
	});
	
	if( MOODS.appViewModel.user() == 'Full name' ) {        // this implies that cookie is not / was never set!
		document.getElementById( 'team' ).setAttribute( "contentEditable", true );
	}
	document.getElementById( 'user' ).value = MOODS.appViewModel.user();
	document.getElementById( 'team' ).innerHTML = MOODS.appViewModel.team();
	
	MOODS.setUserInputWidth();
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


