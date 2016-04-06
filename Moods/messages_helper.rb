class Message
	def initialize( message, author, likes )
		@message = message
		@author = author
		@likes = likes
	end
	
	def message
		@message
	end
	
	def author
		@author
	end
	
	def likes
		@likes
	end
end

def load_messages
	messages = {}
	File.readlines( 'db/messages.dat' ).each{ |line|
		parsed_message = line.scan(/"(.*?)"/)
		id = parsed_message[ 0 ][ 0 ]
		
		message = Message.new parsed_message[ 1 ][ 0 ], parsed_message[ 2 ][ 0 ], parsed_message[ 3 ][ 0 ]
		messages[ id ] = message
	}
	messages
end

def get_random_message( messages )
	random = Random.new( Time.now.strftime('%H%M%S').to_i )
	messages[( random.rand( messages.count ) + 1 ).to_s ]
end