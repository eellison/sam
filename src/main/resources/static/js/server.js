var clientsCanvas = $("#clients-canvas");

// audio context (global variable)
var context = new (window.AudioContext || window.webkitAudioContext);

// object used to represent the socket io connection
var socket = null;

// variable needed for peer to peer connection
var peer_key = "";
var peer_id = "";
var peer = null;
var client_ids = [];

$("#clients-canvas").click(function(event){
	var x = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var y = event.pageY - $("#clients-canvas")[0].offsetTop;
	alert("x:" + x + " y:" + y);
});

$("#server-create").click(function(event) {
	if (!socket) {
		// start the socket server
		$.post("/startServer", {}, function(responseJSON) {
			var responseObject = JSON.parse(responseJSON);

			if (!responseObject.error) {
				// get the socket io url and port for the socket connection
				socket_url = responseObject.socket_url;
				socket_port = responseObject.socket_port;

				// set up the socket io connection
				setupSocketConnection(socket_url, socket_port);
			}
		});
	} else {
		// play song second time
		socket.emit('play', false);
	}
});

/* everything below is used for playing music as it is streamed from the server*/
function setupSocketConnection(url, port) {
	socket = io('http://' + url + ':' + port);
	socket.on('connect', function() {
 		console.log("SocketIO Connection Established");

 		// get peer.js key
 		socket.emit('peer_key', 'server');
	});

	socket.on('disconnect', function() {
		console.log("SocketIO Connection Disconnected");
	});

	socket.on('data', function(data) {
		var response = JSON.parse(data);
		var song_bytes = response.song;
		client_ids = response.client_ids;

		stream(song_bytes);
	});

	socket.on("peer_key", function(data) {
		peer_key = data;
		createPeer();
	});
}

/* function used to stream the song to the peer connections */
function stream(bytes) {
	var array_buffer = new ArrayBuffer(bytes.length);
	var buffered = new Uint8Array(array_buffer);

	for (var i = 0; i < bytes.length; i++) {
		buffered[i] = bytes[i];
	}
	
	context.decodeAudioData(array_buffer, function(buffer) {
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.start();

		//source.connect(context.destination);
		var remote = context.createMediaStreamDestination();
		source.connect(remote);

		// pass the stream to the peer
		streamToPeers(remote.stream);	
	});
}


/* create a peer connection using peerjs api */
function createPeer() {
	peer = new Peer({
		key: peer_key, 
		config: {'iceServers': [
    		{url: "stun:stun.l.google.com:19302"},
			{url:"turn:numb.viagenie.ca", credential: "password123", username: "peter_scott@brown.edu"}]}
    });

	peer.on('open', function(id) {
		peer_id = id;
		socket.emit("server_id", peer_id);
	});

	peer.on('connection', function(conn) {
		alert("connected to another peer");
	});
}

function streamToPeers(stream) {
	// play song on server as well ??
	play(stream);

	for (var i = 0; i < client_ids.length; i++) {
		var id = client_ids[i];
		if (id != peer_id) {
			var call = peer.call(id, stream);
		}
	}
}

function play(song) {
	var player = new Audio();
	player.src = URL.createObjectURL(song);
	player.play();
}
