var appViewModel = null;

var motivationalMessage = "";
var motivationalAuthor = "";

function highlightText( id ) {		// used to highlight text in a span
	var span = document.getElementById( id );
	var range = document.createRange();
	range.setStartBefore( span.firstChild );
	range.setEndAfter( span.lastChild );
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange( range );
}

function setProperInfo() {		// This function must be called on tab-out AND when pressing the mood to ensure that the team is set correctly.
	full_user = document.getElementById( "user" ).innerHTML;
	team = '';
	username = '';
	
	if( full_user.indexOf( ':' ) > - 1 ) {
		team = full_user.split( ':' )[0]
		username = full_user.split( ':' )[1]
		
		document.getElementById( "user" ).innerHTML = username;
		document.getElementById( "team" ).innerHTML = team;
	}
	else {
		team = document.getElementById( "team" ).innerHTML;
		username = document.getElementById( "user" ).innerHTML;
	}
	
	if( username === undefined || username == "" || team == "" ) {		// changing the appviewmodel variables themselves was not updating UI element
		document.getElementById( "user" ).innerHTML = currentUser;
		document.getElementById( "team" ).innerHTML = currentTeam;
	}
	else {
		
		for ( i = 0; i < users.length; i++ ) { 
			user = users[i];
			userInfo = user.split( ':' )[1]
			
			if( username.toUpperCase() === userInfo.toUpperCase() ) {
				appViewModel.user( userInfo );
				appViewModel.team( user.split( ':' )[0] );
			}
		}
	}
	// update connection with UI
	appViewModel.user( document.getElementById( "user" ).innerHTML );
	appViewModel.team( document.getElementById( "team" ).innerHTML );
}

function AcceptInput( mood ) {
	setProperInfo();  
	
	if( appViewModel.user() == '' || appViewModel.user() == 'Enter full name' || 
		appViewModel.team() == '' ) {		//If username/team is not provided -> alert
		alert( 'Kindly provide full name (e.g. Joe Smith) and the respective team before selecting mood!' );
	}
	else { //else, add user in cookie & file system
		currentUser = appViewModel.user();
		currentteam = appViewModel.team();
		var data = { username: appViewModel.user(), team: appViewModel.team(), mood: mood }
		$.getJSON( "/SaveMood", data )
			.done( function( msg ) {
				var message = msg.message;
				var author = msg.author;
				
				motivationalMessage = message;
				motivationalAuthor = author;
				$( "#message" ).stop( true ).fadeTo( 100, 1 ); //resets animations and removes others in queue
				$( "#author" ).stop( true ).fadeTo( 100, 1 );
				$( "#message" ).html( motivationalMessage ).fadeTo( 60000, 0.4 );
				$( "#author" ).html( motivationalAuthor ).fadeTo( 60000, 0.4 );
				
				//registerSW();
			})
			.fail( function( state ) {
				alert( 'SaveMood: Error occurred when trying to save the mood / retrieve display message!' );
			});
	}
}

function changeButtonMoods() {		// used to change the image when the view has changed
	var upperTab = document.getElementById( "upperTabChoice" );
	if( upperTab != null ) {
		document.getElementById( "upperTabChoice" ).innerHTML = 
			"<a href=\"#/dataview\" class=\"buttonLinks\" data-toggle=\"tooltip\" title=\"History\"><img src=\"/images/time_machine_shaped.png\" width=\"40\" height=\"40\" alt=\"submit\" /></a>";
	}
}

function setAppViewModel() {		
	$( "#message" ).html( motivationalMessage ).fadeTo( 100, 0.4 );
	$( "#author" ).html( motivationalAuthor ).fadeTo( 100, 0.4 );
	
	if( appViewModel != null ) { //removing binding as page was reloaded!!!
		var element = $( '#user' )[ 0 ]; 
		ko.cleanNode( element ); //Keeping same binding will still keep observable but does not update UI!!!!!
		var element = $( '#team' )[ 0 ]; 
		ko.cleanNode( element );
	}
	
	appViewModel = {
		user: ko.observable( currentUser ),
		team: ko.observable( currentTeam )
	};
	ko.applyBindings( appViewModel, document.getElementById( "team" ));
	ko.applyBindings( appViewModel, document.getElementById( "user" ));
	
	$( "#user" ).autocomplete({ 
		source: users
	});
	$( "#team" ).autocomplete({ 
		source: getTeams( users )
	});
	
	if( currentUser == 'Enter full name' ) {		// this implies that cookie is not / was never set!
		document.getElementById( 'team' ).setAttribute( "contentEditable", true );
	}
}

function getTeams( users ) {
	var teams = users.map( function( user ) {
		return user.split( ":" )[0];
	});
	uniqueTeams = teams.filter( function( team, pos ) {
		return teams.indexOf( team ) == pos;
	});
	return uniqueTeams;
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


//Functionality for notifications
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


