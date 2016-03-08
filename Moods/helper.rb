def get_users
	File.read( 'public/data.txt' ).split
end

def fill_user_data( user_data, prev_data, moods_info, start_date )
	date = moods_info.split( ',' ).first.to_i
	
	if date >= start_date
		hour = moods_info.split( ',' )[ 1 ].to_i
		hour = ( "0900" if hour < 1300 ) || ( 1300 if hour < 1700) || 1700
		
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
		
		File.read( "public/#{user}.txt" ).split.each{ |moods_info|
			prev_data = fill_user_data user_data, prev_data, moods_info, start_date
		}
		moods[ user ] = user_data
	}
	moods
end

def create_enty_and_file( username )
	File.open( 'public/data.txt', 'a+' ) { |f| f.write username }
	File.new( "public/#{username}.txt", "w+" )
end

def insert_entry( username, mood )
	File.open( "public/#{username}.txt", 'a+' ) { |f| 
		time = Time.now
		f.write "\n#{time.strftime("%Y%m%d")},#{time.strftime("%H%M")},#{mood[ 0 ]}"
	}
end