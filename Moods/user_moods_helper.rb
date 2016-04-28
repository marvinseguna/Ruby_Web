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
	dates = {}
	if date_from != '' # filter
		subtractor = 0
		date_from = (( Date.parse date_from ).strftime '%Y%m%d').to_i
		date_to = (( Date.parse date_to ).strftime '%Y%m%d').to_i
		users.each{ |user|
			date = date_to.to_s
			user_h = { date => { '0900' => '', '1300' => '', '1500' => '' }}
			dates[ date ] = false	if !dates[ date ]
			user = ( user.gsub ' ', '_' ).downcase
			IO.readlines( "db/#{user}.dat" ).reverse.each{ |line| #20160419,2327,h
				date_in_file = line.split( ',' ).first.to_i

				next		if date_in_file > date_to
				
				while date != date_in_file.to_s
					subtractor += 1
					date = ( (Date.parse date_to.to_s) - subtractor ).strftime '%Y%m%d'
					
					break		if date.to_i < date_from
					
					user_h[ date ] = { '0900' => '', '1300' => '', '1500' => '' }
					dates[ date ] = false		if !dates[ date ]
				end
				
				break		if date_in_file < date_from
				
				time = line.split( ',' )[ 1 ].to_i
				if time >= 700 and time < 1100
					time = '0900'
				elsif time >= 1100 and time < 1500
					time = '1300'
				elsif time >= 1500 and time < 1900
					time = '1700'
				else
					time = ''
				end
				
				mood = line.split( ',' ).last.chomp
				if user_h[ date ][ time ] == '' and time != ''
					user_h[ date ][ time ] = mood		
					dates[ date ] = true
				end
			}
			moods[ user ] = user_h
		}
	else # 7-days (DEFAULT)
		subtractor = 0
		incrementor = 0
		users.each{ |user|
			date = ( Date.today - subtractor ).strftime '%Y%m%d'
			user_h = { date => { '0900' => '', '1300' => '', '1500' => '' }}
			dates[ date ] = false	if !dates[ date ]
			user = ( user.gsub ' ', '_' ).downcase
			IO.readlines( "db/#{user}.dat" ).reverse.each{ |line| #20160419,2327,h
				date_in_file = line.split( ',' ).first
				
				incrementor += 1		if date_in_file != date
				break					if incrementor == 7
				
				while date_in_file != date
					subtractor += 1
					date = ( Date.today - subtractor ).strftime '%Y%m%d'
					user_h[ date ] = { '0900' => '', '1300' => '', '1500' => '' }
					dates[ date ] = false		if !dates[ date ]
				end
				
				time = line.split( ',' )[ 1 ].to_i
				if time >= 700 and time < 1100
					time = '0900'
				elsif time >= 1100 and time < 1500
					time = '1300'
				elsif time >= 1500 and time < 1900
					time = '1700'
				else
					time = ''
				end
				
				mood = line.split( ',' ).last.chomp
				if user_h[ date ][ time ] == '' and time != ''
					user_h[ date ][ time ] = mood		
					dates[ date ] = true
				end
			}
			moods[ user ] = user_h
		}
	end
	
	dates.each{ |date, value| 
		if !value
			moods.each{ |user, dates|
				dates.each{ |user_date, times| 
					if user_date == date
						moods[ user ][ user_date ] = nil
						break
					end
				}
			}
		end
	}
	puts moods
end