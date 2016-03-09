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

function changeButtonMoods() {
	var upperTab = document.getElementById("upperTab");
	if( upperTab != null ) {
		document.getElementById("upperTab").innerHTML = 
			"<a href=\"#/dataview\" class=\"buttonLinks\" data-toggle=\"tooltip\" title=\"History\"><img src=\"/images/time_machine_shaped.png\" width=\"40\" height=\"40\" alt=\"submit\" /></a>";
	}
}