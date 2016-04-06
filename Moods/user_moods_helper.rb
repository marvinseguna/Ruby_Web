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
		
		File.read( "db/#{user}.dat" ).split.each{ |moods_info|
			prev_data = fill_user_data user_data, prev_data, moods_info, start_date
		}
		moods[ user ] = user_data
	}
	moods
end

def create_entry_and_file( username )
	File.open( 'db/data.dat', 'a+' ) { |f| f.puts username }
	File.new( "db/#{username}.dat", "w+" )
end

def insert_entry( username, mood )
	File.open( "db/#{username}.dat", 'a+' ) { |f| 
		time = Time.now
		f.puts "#{time.strftime("%Y%m%d")},#{time.strftime("%H%M")},#{mood[ 0 ]}"
	}
end

def init
	File.open( 'db/data.dat', 'a+' ){}
end


def check_last_submission( user )

	last_submission = IO.readlines( "db/#{user}.dat" ).last
	return false		if last_submission.empty? # Nothing is written in the file yet

	user_date = last_submission.split( ',' ).first
	current_date = Time.now.strftime( "%Y%m%d" )
	
	user_time = last_submission.split( ',' )[ 1 ].to_i
	current_time = Time.now.strftime( "%H%M" ).to_i
	
	time_intervals.each{ |time_range|		#Check if time falls within any range of the array		
		if time_range.cover? current_time and time_range.cover? user_time
			user_date == current_date ? ( return false ) : ( return true )
		elsif time_range.cover? current_time and !time_range.cover? user_time
			return true
		end
	}
	false
end