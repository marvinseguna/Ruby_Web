self.addEventListener('push', function(e) {
});

self.onmessage = function(e) {
}
self.onpush = function(event) {
	var title = 'Moods notifies how you feel ^_^';  
	var body = 'Click here to be redirected to set your mood.';  
	var icon = '../images/logo.png';  
	var tag = 'preset';
  
	event.waitUntil(  
		self.registration.showNotification( title, {  
			body: body,  
			icon: icon,  
			tag: tag  
		})
	); 
}

self.addEventListener( 'notificationclick', function( event ) {
	event.notification.close();

	// This looks to see if the current is already open and focuses if it is  
	event.waitUntil(
		clients.matchAll({
		})
		.then(function(clientList) {  
			for (var i = 0; i < clientList.length; i++) {  
				var client = clientList[i]; 
				if (client.url == '/' && 'focus' in client)  
					return client.focus();  
			}  
			if ( clients.openWindow ) {
				return clients.openWindow( '/' );  
			}
		})
	);
});