def init
	File.open( 'db/data.dat', 'a+' ){}           if !File.file?( 'db/data.dat' )
	File.open( 'db/performance.dat', 'a+' ){}    if !File.file?( 'db/performance.dat' )
	File.open( 'db/messages.dat', 'a+' ){ |f| f.puts '"1","","","0"'}    if !File.file?( 'db/messages.dat' ) # write a sample message
	
	set :dates, IO.readlines( 'db/performance.dat' ).map{ |date| date.chomp }    # saved last 7 dates to improve performance
	set :users, get_users_data( true )                  # users without teams
	set :users_teams, get_users_data( false )           # users with teams
end

############################################################################################
######################################## MOOD SAVE #########################################
############################################################################################
def get_users_data( split_users = false )
	users_teams = File.read( 'db/data.dat' ).split "\n" 
	return users_teams        if !split_users
	
	users_teams.map{ | user_team | user_team.split( ':' )[1] }
end

def get_user_file_path( user = nil, team = nil )
	user = ( user == nil ? cookies[ :user ] : user ).downcase.gsub( '+', '_' ).gsub( ' ', '_' )
	team = ( team == nil ? cookies[ :team ] : team ).gsub( /[^0-9A-Za-z]/ , '' )
	
	"db/#{team}/#{user}.dat"
end

def capitalize_user( user )
	user.downcase.split.map( &:capitalize ).join ' '
end 

def create_entry_and_file
	File.open( "db/data.dat", 'a+' ) { |f| f.puts "#{cookies[ :team ]}:#{capitalize_user( cookies[ :user ].gsub( '+', ' ' ))}" }		# E.g. CS:Marvin Seguna
	File.new( get_user_file_path, "a+" )
end

def insert_entry( mood )
	File.open( get_user_file_path, 'a+' ) { |f| 
		f.puts "#{Time.now.strftime( "%Y%m%d" )},#{Time.now.strftime( "%H%M" )},#{mood[ 0 ]}"		# E.g. 20160707,1818,h
	}
end

def update_dates
	date = Time.now.strftime '%Y%m%d'
	return if settings.dates.include? date
	
	settings.dates.push date
	File.open( 'db/performance.dat', 'a+' ) { |f| f.puts date }
end

############################################################################################
############################### NOTIFICATION FUNCTIONALITY #################################
############################################################################################
def get_time_range( current_time )
	[ 0..1100, 1101..1500, 1501..2359 ].each{ |time_interval|
		return time_interval		if time_interval.cover? current_time
	}
end

def check_last_submission()
	last_submission = IO.readlines( get_user_file_path ).last
	return true		if last_submission.empty? # Nothing is written in the file yet
	
	current_time = get_time_range Time.now.strftime( "%H%M" ).to_i
	current_date = Time.now.strftime( "%Y%m%d" )
	
	user_date = last_submission.split( ',' ).first
	user_time = get_time_range last_submission.split( ',' )[ 1 ].to_i
	
	return false	if user_date == current_date and current_time == user_time
	
	true
end

############################################################################################
################################ DATA VIEW FUNCTIONALITY ###################################
############################################################################################
def get_grid_dates( date_from, date_to )
	if date_from == '' or date_to == ''
		settings.dates.last 7
	else
		date_from = ( Date.parse date_from ).strftime '%Y%m%d'
		date_to = ( Date.parse date_to ).strftime '%Y%m%d'
		
		filter_dates = Array ( date_from..date_to )
		settings.dates & filter_dates
	end
end

def fill_default_moods( filter_dates, date_from, date_to )
	defaults = {}
	first_date = ''
	last_date = ''
	
	if date_from == '' or date_to == ''
		first_date = Date.strptime( filter_dates.first, '%Y%m%d' )
		last_date = Date.strptime( filter_dates.last, '%Y%m%d' )
	else
		first_date = Date.strptime((( Date.parse date_from ).strftime '%Y%m%d' ), '%Y%m%d' )
		last_date = Date.strptime((( Date.parse date_to ).strftime '%Y%m%d' ), '%Y%m%d' )
	end
	
	while first_date <= last_date
		first_date_str = first_date.strftime '%Y%m%d'
		
		if filter_dates.include? first_date_str
			defaults[first_date_str] = { '0900' => '', '1300' => '', '1700' => '' }
		else
			defaults[first_date_str] = nil
		end
		first_date += 1
	end
	defaults
end

def get_moods( team, date_from = nil, date_to = nil )
	moods = {}
	filter_dates = get_grid_dates date_from, date_to
	filter_dates_str = filter_dates.join '|'
	
	settings.users_teams.each{ |team_user| 
		user_team, user = team_user.split( ':' )
		next if user_team != team
		
		file = get_user_file_path user, user_team
		moods[user] = fill_default_moods filter_dates, date_from, date_to
		
		File.readlines( file ).grep( /#{filter_dates_str}/ ).each{ |rec|
			rec_date, rec_time, rec_mood = rec.split ','
			rec_time = get_time_slot rec_time.to_i
			
			moods[user][rec_date][rec_time] = rec_mood.chomp
		}
	}
	moods
end

def get_time_slot( time )
	case time
	when 0..1100 then return '0900'
	when 1101..1500 then return '1300'
	when 1501..2359 then return '1700'
	end
end


############################################################################################
############################## SERVICE WORKER FUNCTIONALITY ################################
############################################################################################
# def create_notification_thread( time_interval )
	# previous_time = 0000
	# Thread.new{
		# while true
			# push_req		if check_last_submission( previous_time, time_interval )
			# previous_time = Time.now.strftime( "%H%M" ).to_i
			
			# sleep( time_interval * 60 ) 
		# end
	# }
# end
# def push_req
	# registration_id = cookies[ :registration_id ]
	# registration_id.gsub!( '%3A', ':' ) 
	# registration_id.gsub!( '%2F', '/' )
	# registration_id.gsub!( 'https://android.googleapis.com/gcm/send/', '' )
	
	# gcm = GCM.new( "AIzaSyDF_wvs9YWlrP5g2X7kThbD_O1s5nmvwoY" )
	# reg_tokens = [ registration_id ]
	# options = { :data => { :title =>"foobar", :body => "this is a longer message" } }
	# response = gcm.send( reg_tokens, options )
# end