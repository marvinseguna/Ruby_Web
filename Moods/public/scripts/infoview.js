function setTabHandler( prevPage ) { //used to show link of previous page before entering in the 'about'-section
	var upperTab = document.getElementById( "upperTabChoice" );
	if( upperTab != null ) {
		
		if( prevPage == 0 ) { //implies previous page was the moods-selection page
			document.getElementById( "upperTabChoice" ).innerHTML = 
			"<a href=\"#/\" class=\"buttonLinks\" data-toggle=\"tooltip\" title=\"Moods\"><img src=\"/images/logo.png\" width=\"40\" height=\"40\" alt=\"submit\"/></a>";
		}
		else {
			document.getElementById( "upperTabChoice" ).innerHTML = 
			"<a href=\"#/dataview\" class=\"buttonLinks\" data-toggle=\"tooltip\" title=\"History\"><img src=\"/images/time_machine_shaped.png\" width=\"40\" height=\"40\" alt=\"submit\" /></a>";
		}
	}
}