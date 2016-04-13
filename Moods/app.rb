require 'rubygems'
require 'sinatra'
require 'sinatra/cookies'
require 'user_moods_helper'
require 'messages_helper'
require 'json'

set :port, 8080
set :bind, '0.0.0.0'

@@users = []
@@previous_time = 0000

before do
	@time_interval = 10 # in minutes
	
	init # creation of files, if required
end

get "/" do
	content_type 'html'
	erb :index
end

get "/GetPreviousUsername" do		# used in beginning to retrieve the name to place in the input box
	user = ( cookies[ :name ] == nil ? "" : cookies[ :name ] )
	JSON.generate({ :previous_user => user })
end

get "/GetAllUsers" do		# used in beginning for autocomplete of input box
	@@users = get_users		if @@users.empty?
	JSON.generate({ :all_users => @@users })
end

get "/SaveMood" do		# used when user selects a mood
	username = params[ 'username' ]
	mood = params[ 'mood' ]
	
	return "" if username == nil || mood == nil || !(["angry", "chill", "happy", "sad"].member? mood)

	cookies[ :name ] = username
	@@users = get_users		if @@users.empty?
	unless @@users.include? username
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

get "/GetLastSubmission" do		# used for notification alerts
	return false		if cookies[ :name ] == nil		# do not make the check if the cookies are not set!
	
	show_it = check_last_submission cookies[ :name ], @@previous_time, @time_interval
	@@previous_time = Time.now.strftime( "%H%M" ).to_i
	JSON.generate({ :show_it => show_it })
end
