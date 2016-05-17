require 'rubygems'
require 'sinatra'
require 'sinatra/cookies'
require 'user_moods_helper'
require 'messages_helper'
require 'gcm'
require 'json'

# Variables required to remain saved for every request
@@users = []
@@thread = nil
@@time_interval = 10		# in minutes
@@previous_time = 0

set :cookie_options, :expires => Time.now + ( 3600 * 24 )		# cookies are valid for 1-day after they are set

configure do
	init # creation of files (if not found)
end

#before do # runs before every request
#end

get "/" do
	content_type 'html'
	erb :index
end

get "/GetPreviousInfo" do		# used in beginning to retrieve the name to place in the input box
	user = ( cookies[ :user ] == nil ? "Enter full name" : cookies[ :user ] )
	team = ( cookies[ :team ] == nil ? "CS" : cookies[ :team ] )
	
	puts "user cookie: #{cookies[ :user ]}"
	puts "team cookie: #{cookies[ :team ]}"
	
	JSON.generate({ :previous_user => user, :team => team })
end

get "/GetAllUsers" do		# used in beginning for autocomplete-functionality of input box
	teams, @@users = get_users_info
	JSON.generate({ :users => @@users, :teams => teams })
end

get "/SaveMood" do  # used when user selects a mood
	username = params[ 'username' ].split.map(&:capitalize).join(' ')
	mood = params[ 'mood' ]
	team = params[ 'team' ].upcase

	return "" if username == nil || mood == nil || !([ "angry", "chill", "happy", "sad" ].member? mood )

	cookies[ :user ] = username
	cookies[ :team ] = team

	unless @@users.include? username
		create_entry_and_file
		@@users.push username
	end

	insert_entry mood

	@messages = load_messages  if @messages == nil
	motivational_msg = get_random_message( @messages )

	JSON.generate({ :message => motivational_msg.message, :author => motivational_msg.author })
end

get "/GetMoodData" do		# used to retrieve information to show in the data grid
	date_from = params[ 'dateFrom' ]
	date_to = params[ 'dateTo' ]
	team = ( params[ 'team' ] == '' ? 'CS' : params[ 'team' ] )
	
	teams, @@users = get_users_info
	mood_data = get_moods @@users, team, date_from, date_to

	JSON.generate({ :moodData => mood_data, :teams => teams })
end

get "/Register" do
	cookies[ :registration_id ] = params[ :registrationId ]
	@@thread = create_notification_thread @@time_interval		if @@thread == nil
	
	JSON.generate({})
end

get "/GetLastSubmission" do		# used for notification alerts
	return false		if cookies[ :user ] == nil	
	
	show_it = check_last_submission @@previous_time, @@time_interval
 	@@previous_time = Time.now.strftime( "%H%M" ).to_i
 	JSON.generate({ :show_it => show_it })
end
