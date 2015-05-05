//Song
var playing = true;
var song_started = false;

//Volume
var max_volume = 1;
var volume = 1;

//Drawing
var CANVAS_SIZE = 400;

//Connection
var server_url = "";
var client_id = "";
var connected = false;

// socket io connection
var socket = null;
var socket_server_url = "";
var socket_server_port = "";

// variable needed for peer to peer connection
var peer_key = "";
var peer_id = "";
var peer = null;
var peer_connection = null;

// variable used for playing song
var player = null;

//Updating
var updateSongTimeTimer;
var updateSongTitleTimer;
var updateVolumeTimer;
var updateClientPositions;

$("#clients-canvas").click(function(event) {
	if (connected) {
		name = $("#client-name").val();
		var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
		var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;

		$.post("http://" + server_url + "/updatePosition", {id : client_id, x : xPos, y : yPos, name: name}, 
			function(responseJSON) {
			
		});
	} else {
		alert("Not connected to server");
	}
});

/* Song Info */
// function updateSongTime() {
// 	$.get("http://" + server_url + "/songTime", {id : client_id}, function(responseJSON) {
// 		var responseObject = JSON.parse(responseJSON);
// 		$("#song-length").text(responseObject.songLength);
// 	});
// }

// function updateSongTitle() {
// 	$.get("http://" + server_url + "/songTitle", {id : client_id}, function(responseJSON) {
// 		var responseObject = JSON.parse(responseJSON);
// 		$("#song-title").text(responseObject.songTitle);
// 	});
// }

/* Volume */

function updateVolume() {
	var name = "";
	name = $("#client-name").val();
	if (name === null || name === undefined) {
		name = "";
	}
	$.get("http://" + server_url + "/volume", {id : client_id, name: name}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		volume = responseObject.volume;
		changeVolumeLevel(volume);
		quick = responseObject.quick;
		if (quick) {
			clearInterval(updateVolumeTimer);
			updateVolumeTimer = setInterval(updateVolume, 100);
		}
		else {			
			clearInterval(updateVolumeTimer);
			updateVolumeTimer = setInterval(updateVolume, 1000);
		}
	});
}

/* Update Client Positions */
function updateClientPositions() {
	$.get("http://" + server_url + "/clients", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject.clients;

		draw_clients(clients);
	});
}

function draw_clients(clients) {
	// Get the canvas
	var canvas = $("#clients-canvas")[0];
	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;

	//Get 2D context for canvas drawing
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	for (var i in clients) {
		var client = clients[i];
		ctx.beginPath();

		if (client.x != -1 || client.y != -1) {
			ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
		}

		ctx.stroke();
		ctx.font = "18px serif";
	  	ctx.fillText(client.id, client.x - 10, client.y - 10);
	}
}

prepareClientJoin();
function prepareClientJoin() {
	value = window.location.host + window.location.pathname;
	var search = /(client)/i;
	value = value.replace(search, "");
	var slashI = value.indexOf("/")
	value = value.substring(0, slashI) + value.substring(slashI+1, value.length);
	url = value;
	setupClient(url);
	setupPlayer();
};





var updateVolumeTimer;
function setupClient(url) {
	if (!connected) {
		$.post("http://" + url + "/connectClient", {name : ""})
		.done(function(responseJSON) {
			var responseObject = JSON.parse(responseJSON);

			if (!responseObject.error) {
				server_url = url;
				client_id = responseObject.id;
				socket_server_url = responseObject.server_url;
				socket_server_port = responseObject.server_port;
				setupSocketConnection(socket_server_url, socket_server_port);
				connected = true;
				$("#client-connect").text("Connected");
				$("#client-title").text("Client " + client_id);

				// var updateSongTimeTimer = setInterval(updateSongTime, 1000);
				// var updateSongTitleTimer = setInterval(updateSongTitle, 1000);
				updateVolumeTimer = setInterval(updateVolume, 1000);
				var updateClientPositionsTimer = setInterval(updateClientPositions, 1000);
			} else {
				alert("Error connecting to server");
				connected = false;
			}
		})
		.fail(function(xhr, textStatus, errorThrown) {
			$("#client-connect").text("Failure: Retry Connect");
			connected = false;
		});
	}
}

/* everything below is used for playing music as it is streamed from the server*/
function setupSocketConnection(url, port) {
	socket = io('http://' + url + ':' + port);
	socket.on('connect', function() {
 		console.log("SocketIO Connection Established");

 		// get peer.js key (wait 1 second first)
 		setTimeout(function() {
 			socket.emit('peer_key', 'client');
 		}, 1000);
	});

	socket.on('disconnect', function() {
		console.log("SocketIO Connection Disconnected");
	});

	socket.on("peer_key", function(data) {
		console.log("Peer Created");
		peer_key = data;
		createPeer();
	});

	socket.on("server_id", function(data) {
		connectPeer(data);
	});
}

/* create a peer connection using peerjs api */
function createPeer() {
	peer = new Peer({
		key: peer_key, 
		config: {'iceServers': [
    		{url: "stun:stun.l.google.com:19302"},
			{url:"turn:numb.viagenie.ca", credential: "password123"}]}
    });

	peer.on('open', function(id) {
		peer_id = id;
		socket.emit("client_id", peer_id);
	});

	peer.on('call', function(call) {
		call.answer();

		call.on('stream', function(stream) {
			play(stream);
		});
	});
}

function setupPlayer() {
	player = new Audio();
}

/* function used to play the song */
function play(song) {
	player.src = URL.createObjectURL(song);
	player.play(0);
}

/* function used to set the volume level of the audio player */
function changeVolumeLevel(vol) {
	player.volume = vol;
}

/* function used to connect to a the peer (server) */
function connectPeer(server_id) {
	peer_connection = peer.connect(server_id);

	peer_connection.on('open', function() {
		// receive volume info:
		peer_connection.on('data', function(data) {
			var saved_clients = JSON.parse(data);
			
			for (var i = 0; i < saved_clients.length; i++) {
				var curr = saved_clients[i];
				if (curr.id = client_id) {
					changeVolumeLevel(curr.volume);
				}
			}
		});
	});
}
