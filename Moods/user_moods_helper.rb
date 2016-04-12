def get_users
	File.read( 'db/data.dat' ).split( "\n" )
end

def fill_user_data( user_data, prev_data, moods_info, start_date )
	date = moods_info.split( ',' ).first.to_i
	
	if date >= start_date
		hour = moods_info.split( ',' )[ 1 ].to_i
		hour = ( '0900' if hour < 1300 ) || ( '1300' if hour < 1700) || '1700'
		
		mood = moods_info.split( ',' ).last
		
		user_data.pop		if "#{date}#{hour}" == prev_data
		user_data.push "#{date}|#{hour}|#{mood}"
		prev_data = "#{date}#{hour}"
	end
	prev_data
end

def get_moods( users, start_date )
	moods = {}
	
	users.each{ |user| 
		user_data = []
		prev_data = ""
		username = ( user.gsub ' ', '_' ).downcase
		
		File.read( "db/#{username}.dat" ).split.each{ |moods_info|
			prev_data = fill_user_data user_data, prev_data, moods_info, start_date
		}
		moods[ user ] = user_data
	}
	moods
end

def create_entry_and_file( username )
	File.open( 'db/data.dat', 'a+' ) { |f| f.puts username }
	username = ( username.gsub ' ', '_' ).downcase
	File.new( "db/#{username}.dat", "a+" )
end

def insert_entry( username, mood )
	username = ( username.gsub ' ', '_' ).downcase
	File.open( "db/#{username}.dat", 'a+' ) { |f| 
		time = Time.now
		f.puts "#{time.strftime( "%Y%m%d" )},#{time.strftime( "%H%M" )},#{mood[ 0 ]}"
	}
end

def init
	File.open( 'db/data.dat', 'a+' ){}
	File.open( 'db/messages.dat', 'a+' ){}
end

def check_for_valid_time( time_intervals, current_time )
	time_intervals.each{ |time_interval|
		return time_interval		if time_interval.cover? current_time
	}
	nil
end
def check_last_submission( username, previous_time, time_interval )
	#skip if last request was sent longer than 10 minutes ago
	current_time = Time.now.strftime( "%H%M" ).to_i
	current_date = Time.now.strftime( "%Y%m%d" )
	return false		if current_time - previous_time > time_interval + 1 # +1 minute to cater for the request time
	
	#check if current time falls within the defined time ranges
	time_intervals = [ 0700..1100, 1101..1500, 1501..2359 ]
	time_range = check_for_valid_time time_intervals, current_time
	return false		if time_range == nil
	
	username = ( username.gsub ' ', '_' ).downcase
	last_submission = IO.readlines( "db/#{username}.dat" ).last
	return true		if last_submission.empty? # Nothing is written in the file yet
	
	user_date = last_submission.split( ',' ).first
	user_time = last_submission.split( ',' )[ 1 ].to_i
	
	return false	if user_date == current_date and time_range.cover? user_time
	
	true
end