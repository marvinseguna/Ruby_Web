require 'rubygems'
require 'sinatra'
require 'sinatra/cookies'
require 'user_moods_helper'
require 'messages_helper'
require 'gcm'
require 'json'

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
	user = ( cookies[ :user ] == nil ? "Full name" : cookies[ :user ] )
	team = ( cookies[ :team ] == nil ? "Team" : cookies[ :team ] )
	JSON.generate({ :users => get_users_data, :user => user, :team => team })
end

get "/SaveMood" do  # used when user selects a mood
	username = capitalize_user( params[ 'username' ] )
	mood = params[ 'mood' ]
	team = params[ 'team' ].upcase

	return "" if username == nil or mood == nil or !([ "angry", "chill", "happy", "sad" ].include? mood )

	cookies[ :user ] = username
	cookies[ :team ] = team
	
	unless settings.users.include? username
		create_entry_and_file
	end

	insert_entry mood
	update_dates

	@messages = load_messages  if @messages == nil
	motivational_msg = get_random_message( @messages )

	JSON.generate({ :message => motivational_msg.message, :author => motivational_msg.author })
end

get "/GetMoodData" do		# used to retrieve information to show in the data grid
	date_from = params[ 'dateFrom' ]
	date_to = params[ 'dateTo' ]
	team = ( params[ 'team' ] == '' ? ( cookies[ :team ] == nil ? 'CS' : cookies[ :team ] ) : params[ 'team' ] )
	
	date_from = date_from == '' ? nil : date_from
	date_to = date_from == '' ? nil : date_to
	
	t1 = Time.now
	mood_data = get_moods team, date_from, date_to
	t2 = Time.now
	delta = t2 - t1 # in seconds
	
	puts "time taken: #{delta}"
	
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
