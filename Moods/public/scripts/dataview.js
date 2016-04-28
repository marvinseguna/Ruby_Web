function formGrid( dateFrom, dateTo) { //default is 1-week
	var data = { dateFrom : dateFrom,  dateTo : dateTo }
	$.getJSON( "/GetMoodData", data )
		.done( function( moodData ) {
		});
}

function filterMoods() {
	var dateFrom = $( "#datepickerFrom" ).datepicker( "getDate" );
	var dateTo = $( "#datepickerTo" ).datepicker( "getDate" );
	if( dateFrom > dateTo ) {
		alert( 'From-date must be less than or equal to To-date!' );
	}
	else {
		formGrid( dateFrom, dateTo );
	}
}

function changeButtonHistory() {
	var upperTab = document.getElementById( "upperTabDataView" );

	document.getElementById( "upperTabDataView" ).innerHTML = 
		"<a href=\"#/\" class=\"buttonLinks\" data-toggle=\"tooltip\" title=\"Moods\"><img src=\"/images/logo.png\" width=\"40\" height=\"40\" alt=\"submit\"/></a>";
	
}

function initCalendars() {
	$( "#datepickerTo" ).datepicker();
	$( "#datepickerFrom" ).datepicker();
}