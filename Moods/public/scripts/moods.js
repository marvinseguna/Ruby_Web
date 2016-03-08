function AppViewModel() {
	var self = this;
	this.username = ko.observable( "Enter name" ); 
	
	$.getJSON( "/GetPreviousUsername", function( cookieUser ) {
		var user = cookieUser.previous_user;
		self.username( user ); 
    }); 
	
	$.getJSON( "/GetAllUsers", function( allUsers ) {
		$( "#user" ).autocomplete({ 
			source: allUsers.all_users
		});
	});
}

function AcceptInput( mood ) {
	var username = getAppViewModel().username();
	if( username == '' ) { //If username is not provided -> alert
		alert( 'Kindly provide username before selecting your mood!' );
	}
	else { //else, add user in cookie & file system
		var data = { username : username, mood : mood }
		$.getJSON( "/SaveMood", data )
			.done( function( state ) {
				alert( state.message );
			})
			.fail( function( state ) {
				alert( state.message );
			});
	}
}