function AppViewModel() {
	var self = this;
	self.username = ko.observable( '' ); 
	
	$.getJSON( "/GetPreviousUsername", function( cookieUser ) {
		if( cookieUser.previous_user == '' ) {
			self.username( "Enter name" ); 
		}
		else {
			self.username( cookieUser.previous_user ); 
		}
    }); 
	
	$.getJSON( "/GetAllUsers", function( allUsers ) {
		$( "#user" ).autocomplete({ 
			source: allUsers.all_users
		});
	});
}

function AcceptInput( mood ) {
	var self = getAppViewModel();
	self.username( document.getElementById( "user" ).value );
	
	if( self.username() == '' ) { //If username is not provided -> alert
		alert( 'Kindly provide username before selecting your mood!' );
	}
	else { //else, add user in cookie & file system
		var data = { username : self.username(), mood : mood }
		$.getJSON( "/SaveMood", data )
			.done( function( state ) {
				alert( state.message );
			})
			.fail( function( state ) {
				alert( state.message );
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

function changeUsername() {
	var self = getAppViewModel();
	
	$.getJSON( "/GetPreviousUsername", function( cookieUser ) {
		self.username( cookieUser.previous_user );
    }); 
}