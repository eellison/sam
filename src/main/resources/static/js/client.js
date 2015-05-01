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

//Updating
var updateSongTimeTimer;
var updateSongTitleTimer;
var updateVolumeTimer;
var updateClientPositions;

$("#clients-canvas").click(function(event) {
	if (connected) {
		var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
		var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
		alert("x:" + xPos + " y:" + yPos);

		$.post("http://" + server_url + "/updatePosition", {id : client_id, x : xPos, y : yPos}, function(responseJSON) {
			
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
	$.get("http://" + server_url + "/volume", {id : client_id}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		volume = responseObject.volume;
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
// var ntpClient = require('ntp-client');
 
// ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
//     if(err) {
//         console.error(err);
//         return;
//     }
 
//     console.log("Current time : ");
//     console.log(date); // Mon Jul 08 2013 21:31:31 GMT+0200 (Paris, Madrid (heure d’été)) 
// });
/*
>>>>>>> bc008fad57bb3ad12af694834585e5e994b33403

/* Update Client Positions */
function updateClientPositions() {
	$.get("http://" + server_url + "/clients", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		console.log("Updated clients");
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject.clients;

		console.log(clients);
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
		console.log("drawing");
		ctx.beginPath();
		console.log(client.x);
		console.log(client.y);
		if (client.x != -1 || client.y != -1) {
			ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
		}

		ctx.stroke();
		ctx.font = "18px serif";
	  	ctx.fillText(client.id, client.x - 10, client.y - 10);
	}
}

$("#client-connect").click(function(event) {
	var url = $("#server-url").val();
	setupClient(url);
});
var updateVolumeTimer;
function setupClient(url) {
	if (!connected) {
		$.post("http://" + url + "/connectClient", {name : "Name"}, function(responseJSON) {
			var responseObject = JSON.parse(responseJSON);

			if (!responseObject.error) {
				server_url = url;
				client_id = responseObject.id;
				socket_server_url = responseObject.server_url;
				socket_server_port = responseObject.server_port;

				setupSocketConnection(socket_server_url, socket_server_port);
				connected = true;

				// var updateSongTimeTimer = setInterval(updateSongTime, 1000);
				// var updateSongTitleTimer = setInterval(updateSongTitle, 1000);
				updateVolumeTimer = setInterval(updateVolume, 1000);
				var updateClientPositionsTimer = setInterval(updateClientPositions, 1000);
			} else {
				connected = false;
			}
		});
	}
}

/* everything below is used for playing music as it is streamed from the server*/
function setupSocketConnection(url, port) {
	socket = io('http://' + url + ':' + port);
	socket.on('connect', function() {
 		console.log("SocketIO Connection Established");

 		// get peer.js key
 		socket.emit('peer_key', 'client');
	});

	socket.on('disconnect', function() {
		console.log("SocketIO Connection Disconnected");
	});

	socket.on("peer_key", function(data) {
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
			{url:"turn:numb.viagenie.ca", credential: "password123", username: "peter_scott@brown.edu"}]}
    });

	peer.on('open', function(id) {
		peer_id = id;
		socket.emit("client_id", peer_id);
	});

	peer.on('call', function(call) {
		call.answer();

		call.on('stream', function(stream) {
			// play(stream);
			var player = new Audio();
			player.src = URL.createObjectURL(stream);
			player.play(0);
		});
	});
}

function play(song) {
	console.log(song.stream);
	var player = new Audio();
	player.src = URL.createObjectURL(song);
	player.play();
}

function connectPeer(server_id) {
	var conn = peer.connect(server_id);
}
