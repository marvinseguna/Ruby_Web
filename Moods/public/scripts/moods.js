var appViewModel = null;

function AcceptInput( mood ) {
	appViewModel.userId( document.getElementById( 'user' ).value ); //ensure the last username entered is being considered
	if( appViewModel.userId() == '' ) { //If username is not provided -> alert
		alert( 'Kindly provide username before selecting your mood!' );
	}
	else { //else, add user in cookie & file system
		var data = { username : appViewModel.userId(), mood : mood }
		$.getJSON( "/SaveMood", data )
			.done( function( state ) {
				alert(state.message);
			})
			.fail( function( state ) {
				alert(state.message);
			});
	}
}

function changeButtonMoods() {
	var upperTab = document.getElementById( "upperTabMoodChoice" );
	if( upperTab != null ) {
		document.getElementById( "upperTabMoodChoice" ).innerHTML = 
			"<a href=\"#/dataview\" class=\"buttonLinks\" data-toggle=\"tooltip\" title=\"History\"><img src=\"/images/time_machine_shaped.png\" width=\"40\" height=\"40\" alt=\"submit\" /></a>";
	}
}

function setAppViewModel() {
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
			appViewModel.userId( "Enter name" ); 
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