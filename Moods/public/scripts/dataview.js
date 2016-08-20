MOODS.constructTable = function( moodData ) {
	var table = document.getElementById( "moodsTable" );
	var dateRow = table.insertRow( 0 );
	var timeRow = table.insertRow( 1 );
	var rows = 1;
	
	dateRow.innerHTML = "<td rowspan=\"2\" style\"width:1px;\"></td>"; // to allow for the 2-beginning cells to be empty
	for( var user in moodData ) { // { user => { date1 => { t1 => '', t2 => '', t3 => '' }, date2 => { t1 => '', t2 => '', t3 => '' }, ...} }
		rows += 1;
		if( moodData.hasOwnProperty( user )) {
			var userRow = table.insertRow( rows );
			
			userRow.className = ( rows % 2 == 0 ? "evenGridCell" : "oddGridCell" )
			userRow.innerHTML += ( "<th scope=\"row\" class=\"userCell " + userRow.className + "\">" + user + "</th>" );
			
			var userRowArr = []
			for( var date in moodData[ user ]) {
				if( moodData[user].hasOwnProperty( date )) {
					userRowArr.push( MOODS.addToHTML( dateRow, timeRow, rows, date, moodData[user][ date ] ));
				}
			}
			userRow.innerHTML += userRowArr.join( '' );
		}
	}
}

MOODS.addToHTML = function( dateRow, timeRow, rows, date, moods ) {
	if( moods == null || moods == '' ) {
		if( rows == 2) { //processing first record
			dateRow.innerHTML += "<th class=\"emptyCell\"></th><th class=\"emptyCell\"></th>";
			timeRow.innerHTML += "<td class=\"emptyCell\"></td><td class=\"emptyCell\"></td>";
		}
		return "<td class=\"emptyCell\"></td><td class=\"emptyCell\"></td>";
	}
	else {
		if( rows == 2) { //processing first record
			var year = date.substring( 0, 4 );
			var month = date.substring( 4, 6 );
			var day = date.substring( 6, 8 );
			
			dateRow.innerHTML += ( "<th colspan=\"3\" class=\"dateCell\">" + ( day + "/" + month + "/" + year ) + "</th>" );
		}
		
		var userRowArr = "";
		Object.keys( moods ).sort().forEach( function( time ) { // to ensure that the times are sorted
			if( rows == 2) { //processing first record
				timeRow.innerHTML += ( "<td class=\"timeCell\">" + time + "</td>" )
			}
			if( moods.hasOwnProperty( time )) {
				userRowArr += MOODS.getIconToDisplay( moods[ time ]);
			}
		});
		return userRowArr;
	}
}

MOODS.getIconToDisplay = function( mood ) { // h, c, s, a
	if( mood.toUpperCase() == 'H' ) {
		return "<td class=\"iconCell\"><img src=\"/images/happy_icon.png\"/></td>";
	}
	else if( mood.toUpperCase() == 'C' ) {
		return "<td class=\"iconCell\"><img src=\"/images/chill_icon.png\"/></td>";
	} 
	else if( mood.toUpperCase() == 'S' ) {
		return "<td class=\"iconCell\"><img src=\"/images/sad_icon.png\"/></td>";
	}
	else if( mood.toUpperCase() == 'A' ) {
		return "<td class=\"iconCell\"><img src=\"/images/angry_icon.png\"/></td>";
	}
	else {
		return "<td class=\"iconCell\"></td>";
	}
}

MOODS.formGrid = function( dateFrom = null, dateTo = null ) { //default is 1-week
	try {
		if( MOODS.userData.users == null ) throw "Users were previously not retrieved correctly! Kindly refresh the page.";
		
		$( "#teamFilter" ).autocomplete({ 
			source: MOODS.getUniqueTeams( MOODS.userData.users )
		});
		
		var teamFilter = document.getElementById( "teamFilter" ).value;
		if( teamFilter == "" ) teamFilter = MOODS.userData.team;
		if( teamFilter == "" ) teamFilter = "CS";
		document.getElementById( "teamFilter" ).value = teamFilter;
		
		var data = { dateFrom: dateFrom,  dateTo: dateTo, team: teamFilter }
		$.getJSON( "/GetMoodData", data )
		.done( function( usersInfo ) {
			if( usersInfo.moodData == null ) throw "Mood data was not received correctly from server!";
			
			document.getElementById( "moodsTable" ).innerHTML = "";
			MOODS.constructTable( usersInfo.moodData );
		});
	}
	catch( error ) {
		alert( error );
		console.log( "formGrid: " + error );
	}
}

MOODS.filterMoods = function() {
	var dateFrom = $( "#datepickerFrom" ).datepicker( "getDate" );
	var dateTo = $( "#datepickerTo" ).datepicker( "getDate" );
	if( dateFrom > dateTo ) {
		alert( 'From-date must be less than or equal to To-date!' );
	}
	else {
		MOODS.formGrid( dateFrom, dateTo );
	}
}

MOODS.initCalendars = function() {
	$( "#datepickerTo" ).datepicker();
	$( "#datepickerFrom" ).datepicker();
}
