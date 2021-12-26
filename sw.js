self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	clients.claim();
});


self.addEventListener('fetch', (event) => {
	event.respondWith(async function() {
		try{
			var res = await fetch(event.request);
			var cache = await caches.open('pagesCached');
			cache.put(event.request.url, res.clone());
			return res;
		}
		catch(error){
			return caches.match(event.request);
		}
	}());
});