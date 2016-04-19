require 'rubygems'
require 'sinatra'
require 'sinatra/cookies'
require 'user_moods_helper'
require 'messages_helper'
require 'gcm'
require 'json'

#Server options
set :port, 8443
set :bind, '0.0.0.0'

#Variables required to remain saved for every request
@@users = []
@@thread = nil
@@time_interval = 10 # in minutes

before do
	init # creation of files (if not found)
end

get "/" do
	content_type 'html'
	erb :index
end

get "/GetPreviousUsername" do		# used in beginning to retrieve the name to place in the input box
	user = ( cookies[ :name ] == nil ? "" : cookies[ :name ] )
	JSON.generate({ :previous_user => user })
end

get "/GetAllUsers" do		# used in beginning for autocomplete-functionality of input box
	@@users = get_users		if @@users.empty?
	JSON.generate({ :all_users => @@users })
end

get "/SaveMood" do		# used when user selects a mood
	username = params[ 'username' ]
	mood = params[ 'mood' ]
	
	return "" if username == nil || mood == nil || !([ "angry", "chill", "happy", "sad" ].member? mood ) 

	cookies[ :name ] = username
	@@users = get_users		if @@users.empty?
	
	if !@@users.map(&:downcase).include? username.downcase
		create_entry_and_file username
		@@users.push username
	end
	
	insert_entry username, mood
	
	@messages = load_messages		if @messages == nil
	motivational_msg = get_random_message( @messages )
	
	JSON.generate({ :message => motivational_msg.message, :author => motivational_msg.author })
end

get "/GetMoodData" do		# used to retrieve information to show in the data grid
	@@users = get_users		if @@users.empty?
	mood_data = get_moods @@users, ( Date.today - 6 ).strftime( "%Y%m%d" ).to_i
	JSON.generate( mood_data )
end

get "/Register" do
	cookies[ :registration_id ] = params[ :registrationId ]
	@@thread = create_notification_thread cookies[ :name ], @@time_interval		if @@thread == nil
	
	JSON.generate({})
end
