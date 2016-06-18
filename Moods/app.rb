require 'rubygems'
require 'sinatra'
require 'sinatra/cookies'
require 'user_moods_helper'
require 'messages_helper'
require 'gcm'
require 'json'

# Variables required to remain saved for every request
@@thread = nil

set :cookie_options, :expires => Time.now + ( 3600 * 24 * 30 )        # cookies are valid for 1-day after they are set

configure do   # runs when server is started
	init       # creation of files (if not found)
end

#before do # runs before every request
#end

get "/" do
	content_type 'html'
	erb :index
end

get "/GetUserInfo" do		# Used in beginning
	user = ( cookies[ :user ] == nil ? "Enter full name" : cookies[ :user ] )
	team = ( cookies[ :team ] == nil ? "CS" : cookies[ :team ] )
	JSON.generate({ :users => get_users_data, :user => user, :team => team })
end

get "/SaveMood" do  # used when user selects a mood
	username = capitalize_user( params[ 'username' ] )
	mood = params[ 'mood' ]
	team = params[ 'team' ].upcase

	return "" if username == nil || mood == nil || !([ "angry", "chill", "happy", "sad" ].include? mood )

	cookies[ :user ] = username
	cookies[ :team ] = team
	
	users = get_users_data true
	unless users.include? username
		create_entry_and_file
	end

	insert_entry mood

	@messages = load_messages  if @messages == nil
	motivational_msg = get_random_message( @messages )

	JSON.generate({ :message => motivational_msg.message, :author => motivational_msg.author })
end

get "/GetMoodData" do		# used to retrieve information to show in the data grid
	date_from = params[ 'dateFrom' ]
	date_to = params[ 'dateTo' ]
	team = ( params[ 'team' ] == '' ? ( cookies[ :team ] == nil ? 'CS' : cookies[ :team ] ) : params[ 'team' ] )
	
	users_info = get_users_data true
	mood_data = get_moods users_info, team, date_from, date_to

	JSON.generate({ :moodData => mood_data })
end


get "/GetLastSubmission" do		# used for notification alerts
	return JSON.generate({ :show => false })		if cookies[ :user ] == nil
 	JSON.generate({ :show => check_last_submission })
end

# Service Worker method
# get "/Register" do
	# cookies[ :registration_id ] = params[ :registrationId ]
	# @@thread = create_notification_thread @@time_interval		if @@thread == nil
	
	# JSON.generate({})
# end
