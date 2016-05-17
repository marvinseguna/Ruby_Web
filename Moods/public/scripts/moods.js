var appViewModel = null;
//Inspirational message reset
var motivationalMessage = "";
var motivationalAuthor = "";

function AcceptInput( mood ) {
	appViewModel.user( document.getElementById( "user" ).value );		//ensure the last username entered is being considered
	appViewModel.team( document.getElementById( "team" ).value );
	
	if( appViewModel.user() == '' || appViewModel.user() == 'Enter full name' || 
		appViewModel.team() == '' ) {		//If username/team is not provided -> alert
		alert( 'Kindly provide full name (e.g. Joe Smith) and the respective team before selecting mood!' );
	}
	else { //else, add user in cookie & file system
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
				doNormalNotifications();
			})
			.fail( function( state ) {
				alert( 'Call to server to get message has failed!' );
			});
	}
}

function changeButtonMoods() {
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
		user: ko.observable( '' ),
		team: ko.observable( '' )
	};
	ko.applyBindings( appViewModel, document.getElementById( "team" ));
	ko.applyBindings( appViewModel, document.getElementById( "user" ));
	
	$.getJSON( "/GetPreviousInfo", function( cookieUser ) {
		appViewModel.user( cookieUser.previous_user ); 
		appViewModel.team( cookieUser.team ); 
    }); 
	
	$.getJSON( "/GetAllUsers", function( usersInfo ) {
		$( "#user" ).autocomplete({ 
			source: usersInfo.users
		});
		$( "#team" ).autocomplete({ 
			source: usersInfo.teams
		});
	});
}


//Functionality for notifications
function registerSW() {
	
	var isFirefox = typeof InstallTrigger !== 'undefined';
	if( isFirefox ) { // Service workers are not supported on the latest version of Firefox!
		doNormalNotifications();
	}
	else {
		navigator.serviceWorker.register( 'scripts/sw.js' )
		.then( function( registration ) {
			return registration.pushManager.getSubscription()
			.then(function( subscription ) {
				if ( subscription ) {
					return subscription;
				}
				
				return registration.pushManager.subscribe({ userVisibleOnly: true })
			});
		}).then( function( subscription ) {
			var data = { registrationId : subscription.endpoint }
			$.getJSON( "/Register", data )
			.done( function(  ) {
			})
			.fail( function( state ) {
				alert( 'Call to server to register client has failed!' );
			});
		});
	}
}

function doNormalNotifications() {
	$.getJSON( "/GetLastSubmission", function( showNotification ) {
 		if( showNotification.show_it ) {
 			notifyUser();
 		}
		setTimeout( doNormalNotifications, 600000 );
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
 			window.focus();
 			notification.close();
 		}
 	});
 } 