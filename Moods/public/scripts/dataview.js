function initCalendars() {
	$( "#datepickerTo" ).datepicker();
	$( "#datepickerFrom" ).datepicker();
}

function getFullDate( date ) {
	var day = ( "0" + ( date.getDate() )).slice( -2 );
	var month = ( "0" + ( date.getMonth() + 1 )).slice( -2 );
	var year = date.getFullYear();
	
	var fullDate = day + "/" + month + "/" + year;
	return fullDate;
}

function setTableHeaders( dateHeaders, dateFrom, dayDifference ) {
	var shownDates = {};
	var tableColumnHeaders = '';
	for( var i = 0; i < dayDifference; i++ ) {		
		var fullDate = getFullDate( dateFrom );
		tableColumnHeaders += "<th scope=\"col\" colspan=\"3\" class=\"th_double_border\">" + fullDate + "</th>";

		shownDates[ fullDate ] = i * 3;
		dateFrom.setDate( dateFrom.getDate() + 1 );
	}
	var fullDate = getFullDate( dateFrom );
	tableColumnHeaders += "<th scope=\"col\" colspan=\"3\" style=\"font-size:16px;\">" + fullDate + "</th>";
	shownDates[ fullDate ] = i * 3;
	
	dateHeaders.innerHTML = "<th class=\"th_single_border\"></th>" + tableColumnHeaders;
	return shownDates;
}
function setTimeHeaders( timeHeaders, dayDifference ) {
	timeHeaders.innerHTML = "<td class=\"td_single_border\"></td>";
	for( var i = 0; i < dayDifference; i++ ) {
		timeHeaders.innerHTML += "<td>09:00</td><td>13:00</td><td class=\"td_double_border\">17:00</td>";
	}
	timeHeaders.innerHTML += "<td>09:00</td><td>13:00</td><td>17:00</td>";
}
function setMoodData( nameRow, currentColumn, doubleLines, maxColumns, mood ) {
	if( currentColumn == (( 3 * doubleLines ) - 1 ) && currentColumn != maxColumns ) {
		if( mood == '' ) {
			nameRow.innerHTML += "<td class=\"td_double_border\"></td>";
		}
		else {
			nameRow.innerHTML += "<td class=\"td_double_border\"><img src=\"/images/" + mood + ".png\"/></td>";
		}
		doubleLines++;
	}
	else {
		if( mood == '' ) {
			nameRow.innerHTML += "<td></td>";
		}
		else {
			nameRow.innerHTML += "<td><img src=\"/images/" + mood + ".png\"/></td>";
		}
	}
	return doubleLines;
}
function setMoodRows( table, moodData, shownDates, dayDifference ) {
	var counter = 2;
	var times = { "0900" : 0, "1300" : 1, "1700" : 2 };
	var moods = { "h" : "happy_icon", "s" : "sad_icon", "a" : "angry_icon", "c" : "chill_icon" };
	for( var key in moodData ) {
		var nameRow = table.insertRow( counter );
		counter++;
		nameRow.innerHTML = "<td>" + key + "</td>";
		var currentColumn = 0;
		var doubleLines = 1;
	
		for( var i = 0; i < moodData[ key ].length; i++ ){
			var currentInfo = moodData[ key ][ i ];
			var date = currentInfo.split( '|' )[ 0 ];
			var time = currentInfo.split( '|' )[ 1 ]; 
			var mood = currentInfo.split( '|' )[ 2 ]; 
			date = date.substring( 6, 8 ) + "/" + date.substring( 4, 6 ) + "/" + date.substring( 0, 4 );
			if( date in shownDates ) {
				var toLoop = shownDates[ date ] + times[ time ] - currentColumn;
				for( var j = 0; j < toLoop; j++ ) {
					doubleLines = setMoodData( nameRow, currentColumn, doubleLines, (( dayDifference + 1 ) * 3 ) - 1, '' );
					currentColumn++;
				}
				doubleLines = setMoodData( nameRow, currentColumn, doubleLines, (( dayDifference + 1 ) * 3 ) - 1, moods[ mood ]);
				currentColumn++;
			}
		}
		while( currentColumn < ( dayDifference + 1 ) * 3 ) {
			doubleLines = setMoodData( nameRow, currentColumn, doubleLines, (( dayDifference + 1 ) * 3 ) - 1, '' );
			currentColumn++
		}
	}
}

function fillGrid( dateFrom, dateTo) { //default is 1-week
	$.getJSON( "/GetMoodData", function( moodData ) {
		var table = document.getElementById( "moodTable" );
		var dateHeaders = table.insertRow( 0 );
		
		var utc1 = Date.UTC( dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate() );
		var utc2 = Date.UTC( dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate() );
		var dayDifference = Math.floor(( utc2 - utc1 ) / ( 1000 * 60 * 60 * 24 ));
		
		//Top dates
		shownDates = setTableHeaders( dateHeaders, dateFrom, dayDifference );
		
		//Top times
		var timeHeaders = table.insertRow( 1 );
		setTimeHeaders( timeHeaders, dayDifference );
		
		//Mood Data
		setMoodRows( table, moodData, shownDates, dayDifference );
	});
}

function FilterMoods() {
	var dateFrom = $( "#datepickerFrom" ).datepicker( "getDate" );
	var dateTo = $( "#datepickerTo" ).datepicker( "getDate" );
	
	document.getElementById( "moodTable" ).innerHTML = "";
	fillGrid( dateFrom, dateTo );
}