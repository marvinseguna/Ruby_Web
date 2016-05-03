var DATECELL = "<th colspan=\"3\" class=\"dateCell\">";
var TIMECELL = "<td class=\"timeCell\">"
var USERCELL = "<th scope=\"row\" class=\"userCell\">"
var LASTUSERCELL = "<th scope=\"row\" class=\"lastUserCell\">"
var EMPTYCELLHEADER = "<th class=\"emptyCell\"></th><th class=\"emptyCell\"></th>";
var EMPTYCELLDATA = "<td class=\"emptyCell\"></td><td class=\"emptyCell\"></td>"
var HAPPYICONCELL = "<td class=\"iconCell\"><img src=\"/images/happy_icon.png\"/></td>"
var CHILLICONCELL = "<td class=\"iconCell\"><img src=\"/images/chill_icon.png\"/></td>"
var SADICONCELL = "<td class=\"iconCell\"><img src=\"/images/sad_icon.png\"/></td>"
var ANGRYICONCELL = "<td class=\"iconCell\"><img src=\"/images/angry_icon.png\"/></td>"
var EMPTYICONCELL = "<td class=\"iconCell\"></td>"

function constructTable( moodData ) {
	var table = document.getElementById( "moodsTable" );
	var dateRow = table.insertRow( 0 );
	var timeRow = table.insertRow( 1 );
	
	dateRow.innerHTML = "<td rowspan=\"2\" style\"width:1px;\"></td>"; // to allow for the 2-beginning cells to be empty
	var rows = 1;
	
	var keys = Object.keys( moodData );
	var lastUser = keys.slice( -1 )[ 0 ];
	
	for( var user in moodData ) { // { user => { date1 => { t1 => '', t2 => '', t3 => '' }, date2 => { t1 => '', t2 => '', t3 => '' }, ...} }
		rows += 1;
		if( moodData.hasOwnProperty( user )) {
			var userRow = table.insertRow( rows );
			if( user == lastUser ) {
				userRow.innerHTML += ( LASTUSERCELL + user + "</th>" );
			}
			else {
				userRow.innerHTML += ( USERCELL + user + "</th>" );
			}
			
			for( var date in moodData[ user ]) {				
				if( moodData[ user ].hasOwnProperty( date )) {
					addToHTML( dateRow, timeRow, rows, userRow, date, moodData[ user ][ date ]);
				}
			}
		}
	}
}

function addToHTML( dateRow, timeRow, rows, userRow, date, moods ) {
	date = formatDate( date );
	
	if( moods == null || moods == '' ) {
		if( rows == 2) { //processing first record
			dateRow.innerHTML += EMPTYCELLHEADER;
			timeRow.innerHTML += EMPTYCELLDATA;
		}
		userRow.innerHTML += EMPTYCELLDATA;
	}
	else {
		if( rows == 2) { //processing first record
			dateRow.innerHTML += ( DATECELL + ( "0" + date.getDate()).slice( -2 ) + "/" + ( "0" + date.getMonth()).slice( -2 ) + "/" + date.getFullYear() + "</th>" );
		}
		
		Object.keys( moods ).sort().forEach( function( time ) { // to ensure that the times are sorted
			if( rows == 2) { //processing first record
				timeRow.innerHTML += ( TIMECELL + time + "</td>" )
			}
			if( moods.hasOwnProperty( time )) {
				userRow.innerHTML += getIconToDisplay( moods[ time ]);
			}
		});
	}
}

function formatDate( date ) { // format: yyyymmdd
	var year = date.substring( 0, 4 );
	var month = date.substring( 4, 6 );
	var day = date.substring( 6, 8 );
	
	return new Date( year, month, day );
} 

function getIconToDisplay( mood ) { // h, c, s, a
	if( mood.toUpperCase() == 'H' ) {
		return HAPPYICONCELL;
	}
	else if( mood.toUpperCase() == 'C' ) {
		return CHILLICONCELL;
	} 
	else if( mood.toUpperCase() == 'S' ) {
		return SADICONCELL;
	}
	else if( mood.toUpperCase() == 'A' ) {
		return ANGRYICONCELL;
	}
	else {
		return EMPTYICONCELL;
	}
}

function formGrid( dateFrom, dateTo) { //default is 1-week
	var data = { dateFrom : dateFrom,  dateTo : dateTo }
	$.getJSON( "/GetMoodData", data )
		.done( function( moodData ) {
			var table = document.getElementById( "moodsTable" );
			table.innerHTML = "";
			
			if( moodData != null ) {
				constructTable( moodData );
			}
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