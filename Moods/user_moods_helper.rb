############################################################################################
######################################## MOOD SAVE #########################################
############################################################################################
def get_users_info
	File.read( 'db/data.dat' ).split "\n" 
end

def split_info( users )
	user_info = []
	users.each{ |user|		# CS:Marvin Seguna
		user_info.push user.split( ':' )[1]
	}
	user_info
end

def search_for_team( user )
	res = File.foreach( 'db/data.dat' ).grep /#{user}/i
	res.empty? ? '' : res.first.strip.split( ':' )[0] 
end

def get_user_info( option )
	user = cookies[ :user ].downcase.gsub( '+', '_' ).gsub( ' ', '_' )
	team = cookies[ :team ].upcase.gsub( /[^0-9A-Za-z]/ , '' )

	return user							if option == 1		# used to search for file name -> marvin_seguna.dat
	return "db/#{team}/#{user}.dat"		if option == 2		# used to get path of user
end

def create_entry_and_file
	File.open( "db/data.dat", 'a+' ) { |f| f.puts "#{cookies[ :team ].downcase.capitalize}:#{cookies[ :user ].gsub( '+', ' ' )}" }		# E.g. CS:Marvin Seguna
	File.new( get_user_info( 2 ), "a+" )
end

def insert_entry( mood )
	File.open( get_user_info( 2 ), 'a+' ) { |f| 
		f.puts "#{Time.now.strftime( "%Y%m%d" )},#{Time.now.strftime( "%H%M" )},#{mood[ 0 ]}"		# E.g. 20160707,1818,h
	}
end

def init
	File.open( 'db/data.dat', 'a+' ){}		if !File.file?( 'db/data.dat' )
	File.open( 'db/messages.dat', 'a+' ){ |f| f.puts '"1","","","0"'}		if !File.file?( 'db/messages.dat' ) 		# write a sample message
end


############################################################################################
############################### NOTIFICATION FUNCTIONALITY #################################
############################################################################################
def check_for_valid_time( current_time )
	[ 0..1100, 1101..1500, 1501..2359 ].each{ |time_interval|
		return time_interval		if time_interval.cover? current_time
	}
	nil
end
def check_last_submission( previous_time, time_interval )
	#skip if last request was sent longer than 10 minutes ago
	current_time = Time.now.strftime( "%H%M" ).to_i
	current_date = Time.now.strftime( "%Y%m%d" )
	return false		if current_time - previous_time > time_interval + 1 # +1 minute to cater for the request time
	
	#check if current time falls within the defined time ranges
	time_range = check_for_valid_time current_time
	return false		if time_range == nil
	
	last_submission = IO.readlines( get_user_info( 2 )).last
	return true		if last_submission.empty? # Nothing is written in the file yet
	
	user_date = last_submission.split( ',' ).first
	user_time = last_submission.split( ',' )[ 1 ].to_i
	
	return false	if user_date == current_date and time_range.cover? user_time
	
	true
end

def create_notification_thread( time_interval )
	previous_time = 0000
	Thread.new{
		while true
			push_req		if check_last_submission( previous_time, time_interval )
			previous_time = Time.now.strftime( "%H%M" ).to_i
			
			sleep( time_interval * 60 ) 
		end
	}
end
def push_req
	registration_id = cookies[ :registration_id ]
	registration_id.gsub!( '%3A', ':' ) 
	registration_id.gsub!( '%2F', '/' )
	registration_id.gsub!( 'https://android.googleapis.com/gcm/send/', '' )
	
	gcm = GCM.new( "AIzaSyDF_wvs9YWlrP5g2X7kThbD_O1s5nmvwoY" )
	reg_tokens = [ registration_id ]
	options = { :data => { :title =>"foobar", :body => "this is a longer message" } }
	response = gcm.send( reg_tokens, options )
end


############################################################################################
################################ DATA VIEW FUNCTIONALITY ###################################
############################################################################################
def get_moods( users, team, date_from, date_to )
	moods = {}
	@empty_dates = {}
	
	if date_from != ''		# filter
		begin
			date_from = (( Date.parse date_from ).strftime '%Y%m%d' ).to_i
			date_to = (( Date.parse date_to ).strftime '%Y%m%d' ).to_i
			
			users.each{ |user|
				moods_info = get_user_moods team, user, date_from, date_to
				moods[ user ] = moods_info		if moods_info != ''		# '' implies that user does not belong to the selected team
			}
			cut_moods moods, false
		rescue
			puts "get_moods: Error when parsing dates!! date_from: #{date_from}, date_to: #{date_to}.\nDefaulting to 7-days"
			get_moods users, team, '', ''
		end
	else # 7-days (DEFAULT)
		users.each{ |user|
			moods_info = get_user_moods team, user
			moods[ user ] = moods_info		if moods_info != ''		# '' implies that user does not belong to the selected team
		}
		cut_moods moods, true		# set empty dates to nil and including only common dates
	end
end

def get_user_moods( team, user, date_from = 0, date_to = 99991231 )
	user = ( user.gsub '+', '_' ).gsub( ' ', '_' ).downcase
	return ''		if !File.file?( "db/#{team}/#{user}.dat" )		# user is not found in team directory
	
	date = 0
	date_to == 99991231 ? ( date = Time.now.strftime( '%Y%m%d' ).to_i ) : ( date = date_to )
	@empty_dates[ date ] = false		if !@empty_dates.include? date
	moods = { date => { '0900' => '', '1300' => '', '1700' => '' }}
	incrementor = 0
	
	IO.readlines( "db/#{team}/#{user}.dat" ).reverse.each{ |line| #20160419,2327,h
		next		if line == ''
		date_in_file = line.split( ',' ).first.to_i
		next		if date_in_file > date_to
		
		if date_from == 0
			incrementor += 1		if date_in_file != date and moods.length != 1		# for first one, it doesn't apply
			break					if incrementor == 6		# Default: 7-days
		end
		
		moods, date = increment_date date, moods, date_in_file, date_from
		break		if date_in_file < date_from
		
		time = get_time_slot line.split( ',' )[ 1 ].to_i
		if moods[ date ][ time ] == ''
			moods[ date ][ time ] = line.split( ',' ).last.chomp		# to get the mood
			@empty_dates[ date ] = true
		end
	}
	
	moods, date = increment_date date, moods, date_from, date_from		if date_from != 0		# then the dates were passed as a filter
	moods
end

def increment_date( date, moods, comparableDate, date_from )
	while date != comparableDate		# Keep looping until the date-variable matches that found in the file
		date = ((( Date.parse date.to_s ) - 1 ).strftime '%Y%m%d').to_i
		break		if date < date_from
		moods[ date ] = { '0900' => '', '1300' => '', '1700' => '' }
		@empty_dates[ date ] = false		if !@empty_dates.include? date
	end
	[ moods, date ]
end

def get_time_slot( time )
	case time
	when 0..1100 then return '0900'
	when 1101..1500 then return '1300'
	when 1501..2359 then return '1700'
	end
end

def cut_moods( moods, cutoff )
	dates = []
	moods.each{ |user, data| dates.empty? ? ( dates = data.keys ) : ( dates = dates & data.keys ) }
	
	moods.each{ |user, data|
		data.each{ |date, time_moods| 
			if !dates.include? date and cutoff
				moods[ user ].delete date		# to eliminate any dates which went beyond the default for a given user
			elsif @empty_dates.include? date
				moods[ user ][ date ] = nil		if !@empty_dates[ date ]		# implies that no input was given on the specific day, hence delete
			end
		}
	}
	moods
end