var appViewModel = null;
//Inspirational message reset
var inspMessage = "";
var inspAuthor = "";

function AcceptInput( mood ) {
	appViewModel.userId( document.getElementById( 'user' ).value ); //ensure the last username entered is being considered
	if( appViewModel.userId() == '' || appViewModel.userId() == 'Enter full name' ) { //If username is not provided -> alert
		alert( 'Kindly provide full name (e.g. Joe Smith) before selecting mood!' );
	}
	else { //else, add user in cookie & file system
		var data = { username : appViewModel.userId(), mood : mood }
		$.getJSON( "/SaveMood", data )
			.done( function( msg ) {
				var message = msg.message.split( "-" )[ 0 ];
				var author = msg.message.split( "-" )[ 1 ];
				
				inspMessage = message;
				inspAuthor = author;
				$( "#message" ).stop( true ).fadeTo( 100, 1 ); //resets animations and removes others in queue
				$( "#author" ).stop( true ).fadeTo( 100, 1 );
				$( "#message" ).html( inspMessage ).fadeTo( 60000, 0.4 );
				$( "#author" ).html( inspAuthor ).fadeTo( 60000, 0.4 );
			})
			.fail( function( state ) {
				alert(state.message);
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
	$( "#message" ).html( inspMessage ).fadeTo( 100, 0.4 );
	$( "#author" ).html( inspAuthor ).fadeTo( 100, 0.4 );
	
	if( appViewModel != null ) { //removing binding as page was reloaded!!!
		var element = $('#user')[ 0 ]; 
		ko.cleanNode( element ); //Keeping same binding will still keep observable but does not update UI!!!!!
	}
	
	
	appViewModel = {
		userId: ko.observable( '' )
	};
	ko.applyBindings( appViewModel, document.getElementById( 'user' ));
	
	$.getJSON( "/GetPreviousUsername", function( cookieUser ) {
		if( cookieUser.previous_user == '' ) {
			appViewModel.userId( "Enter full name" ); 
		}
		else {
			appViewModel.userId( cookieUser.previous_user ); 
		}
    }); 
	
	$.getJSON( "/GetAllUsers", function( allUsers ) {
		$( "#user" ).autocomplete({ 
			source: allUsers.all_users
		});
	});
}