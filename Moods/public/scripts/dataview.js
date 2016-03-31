var styleTableHeadersDoubleBorder = "class=\"tableTitles th_double_border\"";
var styleTableHeaders = "class=\"tableTitles\"";
var styleTableHeadersGridName = "class=\"tableTitles gridNames\"";
var styleTableDataDoubleBorder = "class=\"tableData td_double_border\"";
var styleTableData = "class=\"tableData\"";

function getFullDate( date ) {
	var day = ( "0" + ( date.getDate() )).slice( -2 );
	var month = ( "0" + ( date.getMonth() + 1 )).slice( -2 );
	var year = date.getFullYear();
	
	var fullDate = day + "/" + month + "/" + year;
	return fullDate;
}

function setTableHeaders( dateHeaders, dateFrom, dayDifference ) { //setting dates on top of table 
	var shownDates = {};
	var tableColumnHeaders = '';
	for( var i = 0; i < dayDifference; i++ ) {		
		var fullDate = getFullDate( dateFrom );
		tableColumnHeaders += "<th scope=\"col\" colspan=\"3\" " + styleTableHeadersDoubleBorder + ">" + fullDate + "</th>"; //class=\"th_double_border\"

		shownDates[ fullDate ] = i * 3;
		dateFrom.setDate( dateFrom.getDate() + 1 );
	}
	var fullDate = getFullDate( dateFrom );
	tableColumnHeaders += "<th scope=\"col\" colspan=\"3\" " + styleTableHeaders + " style=\"border-right: 2px solid #4EC3F0;\">" + fullDate + "</th>";
	shownDates[ fullDate ] = i * 3;
	
	dateHeaders.innerHTML = tableColumnHeaders; //class=\"th_single_border\", "<th></th>" + 
	return shownDates;
}
function setTimeHeaders( timeHeaders, dayDifference ) { //setting the times beneath the dates
	//timeHeaders.innerHTML = "<td style=\"width: 150px;\"></td>"; //class=\"td_single_border\"
	for( var i = 0; i < dayDifference; i++ ) {
		timeHeaders.innerHTML += "<td " + styleTableData + ">09:00</td><td " + styleTableData + ">13:00</td><td " + styleTableDataDoubleBorder + ">17:00</td>"; //class=\"td_double_border\"
	}
	timeHeaders.innerHTML += "<td " + styleTableData + ">09:00</td><td " + styleTableData + ">13:00</td><td " + styleTableData + ">17:00</td>";
}
function setMoodData( nameRow, currentColumn, doubleLines, maxColumns, mood ) {
	if( currentColumn == (( 3 * doubleLines ) - 1 ) && currentColumn != maxColumns ) {
		if( mood == '' ) {
			nameRow.innerHTML += "<td " + styleTableDataDoubleBorder + "></td>"; //class=\"td_double_border\"
		}
		else {
			nameRow.innerHTML += "<td " + styleTableDataDoubleBorder + "><img src=\"/images/" + mood + ".png\"/></td>"; //class=\"td_double_border\"
		}
		doubleLines++;
	}
	else {
		if( mood == '' ) {
			nameRow.innerHTML += "<td " + styleTableData + "></td>";
		}
		else {
			nameRow.innerHTML += "<td " + styleTableData + "><img src=\"/images/" + mood + ".png\"/></td>";
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
		
		var nameTable = document.getElementById( "nameTable" );
		var namingRow = nameTable.insertRow( counter );
		namingRow.innerHTML = "<th " + styleTableHeadersGridName + ">" + key + "</th>";
		
		counter++;
		
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
		var nameTable = document.getElementById( "nameTable" );
		var nameRow = nameTable.insertRow( 0 );
		nameRow.innerHTML = "<th " + styleTableHeaders + "></th>";
		shownDates = setTableHeaders( dateHeaders, dateFrom, dayDifference );
		
		//Top times
		var timeHeaders = table.insertRow( 1 );
		var nameRow = nameTable.insertRow( 1 );
		nameRow.innerHTML = "<th " + styleTableHeaders + "></th>";
		setTimeHeaders( timeHeaders, dayDifference );
		
		//Mood Data
		setMoodRows( table, moodData, shownDates, dayDifference );
	});
}

function filterMoods() {
	var dateFrom = $( "#datepickerFrom" ).datepicker( "getDate" );
	var dateTo = $( "#datepickerTo" ).datepicker( "getDate" );
	
	document.getElementById( "moodTable" ).innerHTML = "";
	document.getElementById( "nameTable" ).innerHTML = "";
	fillGrid( dateFrom, dateTo );
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