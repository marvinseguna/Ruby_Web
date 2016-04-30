############################################################################################
######################################## MOOD SAVE #########################################
############################################################################################
def get_users
	File.read( 'db/data.dat' ).split( "\n" )
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


############################################################################################
############################### NOTIFICATION FUNCTIONALITY #################################
############################################################################################
def check_for_valid_time( current_time )
	[ 0700..1100, 1101..1500, 1501..2359 ].each{ |time_interval|
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
	time_range = check_for_valid_time current_time
	return false		if time_range == nil
	
	username = ( username.gsub ' ', '_' ).downcase
	last_submission = IO.readlines( "db/#{username}.dat" ).last
	return true		if last_submission.empty? # Nothing is written in the file yet
	
	user_date = last_submission.split( ',' ).first
	user_time = last_submission.split( ',' )[ 1 ].to_i
	
	return false	if user_date == current_date and time_range.cover? user_time
	
	true
end

def create_notification_thread( username, time_interval )
	previous_time = 0000
	Thread.new{
		while true
			push_req		if check_last_submission( username, previous_time, time_interval )
			previous_time = Time.now.strftime( "%H%M" ).to_i
			
			sleep time_interval 
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
def get_moods( users, date_from, date_to )
	moods = {}
	@empty_dates = {}
	
	if date_from != '' # filter
		date_from = (( Date.parse date_from ).strftime '%Y%m%d' ).to_i
		date_to = (( Date.parse date_to ).strftime '%Y%m%d' ).to_i
		
		users.each{ |user|
			moods[ user ] = get_user_moods user, date_from, date_to
		}
	else # 7-days (DEFAULT)
		date_from = (( Date.today - 7).strftime '%Y%m%d' ).to_i
		date_to = ( Date.today.strftime '%Y%m%d' ).to_i
		
		users.each{ |user|
			moods[ user ] = get_user_moods user, date_from, date_to, true
		}
	end
	moods = set_empty_dates moods # if for all users, specific dates are empty, just set them to nil (Easier for JS implementation of grid)
	moods = make_array_equal moods # all users must have the same set of dates. No more, no less.
	puts moods
end

def get_user_moods( user, date_from, date_to, default = false )
	date = date_to.to_s
	@empty_dates[ date ] = false		if !@empty_dates.include? date
	moods = { date => { '0900' => '', '1300' => '', '1700' => '' }}
	user = ( user.gsub ' ', '_' ).downcase
	incrementor = 0
	
	IO.readlines( "db/#{user}.dat" ).reverse.each{ |line| #20160419,2327,h
		date_in_file = line.split( ',' ).first.to_i
		
		incrementor += 1		if date_in_file.to_s != date and default
		break					if incrementor == 7 and default
		
		next		if date_in_file > date_to and !default
		while date != date_in_file.to_s
			date = (( Date.parse date ) - 1 ).strftime '%Y%m%d'
			break		if date.to_i < date_from and !default
			moods[ date ] = { '0900' => '', '1300' => '', '1700' => '' }
			@empty_dates[ date ] = false		if !@empty_dates.include? date
		end
		break		if date_in_file < date_from and !default
		
		time = line.split( ',' )[ 1 ].to_i
		time = get_time_slot time
		
		mood = line.split( ',' ).last.chomp
		if time != '' and moods[ date ][ time ] == ''
			moods[ date ][ time ] = mood
			@empty_dates[ date ] = true
		end
	}
	moods
end

def get_time_slot( time )
	if time >= 700 and time < 1100
		'0900'
	elsif time >= 1100 and time < 1500
		'1300'
	elsif time >= 1500 and time < 1900
		'1700'
	else
		''
	end
end

def set_empty_dates( moods )
	@empty_dates.each{ |date, value|
		next		if value
		moods.each{ |user, data|
			data.each{ |date_2, time_moods| 
				moods[ user ][ date_2 ] = nil		if date == date_2
			}
		}
	}
	moods
end

def make_array_equal( moods )
	dates = []
	moods.each{ |user, data| dates.push data.keys }
	
	return moods		if dates.empty?
	common_dates = dates[ 0 ]
	dates.each{ |date| common_dates = common_dates & date }
	
	moods.each{ |user, data|
		data.each{ |date_2, time_moods| 
			moods[ user ].delete date_2		if !common_dates.include? date_2
		}
	}
	moods
end