require 'rubygems'
require 'sinatra'
require 'sinatra/cookies'
require 'helper'
require 'json'

before do
	@users = []
end

get "/" do
	content_type 'html'
	erb :index
end

get "/GetPreviousUsername" do
	user = ( cookies[ :name ] == nil ? "" : cookies[ :name ] )
	JSON.generate({ :previous_user => user })
end

get "/GetAllUsers" do
	@users = get_users		if @users.empty?
	JSON.generate({ :all_users => @users })
end

get "/SaveMood" do
	username = params[ 'username' ]
	mood = params[ 'mood' ]

	cookies[ :name ] = username
	@users = get_users		if @users.empty?
	
	if !@users.include? username
		create_entry_and_file username
		@users.push username
	end
	
	insert_entry username, mood
	JSON.generate({ :message => 'Thanks!' })
end

get "/GetMoodData" do
	@users = get_users		if @users.empty?
	mood_data = get_moods @users, ( Date.today - 6 ).strftime( "%Y%m%d" ).to_i
	JSON.generate( mood_data )
end