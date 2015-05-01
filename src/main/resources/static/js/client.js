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
var socket_server_url = "";
var socket_server_port = "";

//Updating
var updateSongTimeTimer;
var updateSongTitleTimer;
var updateVolumeTimer;
var updateClientPositions;



// =======
// >>>>>>> 5e2ba3a4eeb6d6ae805b959cdc00ccf9a7722f47
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
			updateVolumeTimer = setInterval(updateVolume, 50);
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
	$.post("http://" + url + "/connectClient", {name : "Name"}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);

		if (!responseObject.error) {
			server_url = url;
			client_id = responseObject.id;
			socket_server_url = responseObject.server_url;
			socket_server_port = responseObject.server_port;
			connected = true;

			setupSocketConnection(socket_server_url, socket_server_port);

			// var updateSongTimeTimer = setInterval(updateSongTime, 1000);
			// var updateSongTitleTimer = setInterval(updateSongTitle, 1000);
			updateVolumeTimer = setInterval(updateVolume, 1000);
			var updateClientPositionsTimer = setInterval(updateClientPositions, 1000);
		} else {
			connected = false;
		}
	});
}

/* everything below is used for playing music as it is streamed from the server*/
function setupSocketConnection(url, port) {
	var socket = io('http://' + url + ':' + port);
	socket.on('connect', function() {
 		console.log("Client connected");
	});

	socket.on('disconnect', function() {
		console.log("Client disconnected");
	});

	socket.on('data', function(data) {
		var response = JSON.parse(data);
		var song_bytes = response.song;

		if (!song_started) {
			// set up sound 
			setup_sound();

			// buffer the input
			buffer(song_bytes);

			// start sound
			start_sound();

			song_started = true;
		} else {
			//buffer(song_bytes);
		}
	})
}

// declare variables used for playing music:
var audio_ctx;
var buffer_source;
var channels;

// function used to setup sound output for the client
function setup_sound() {
	audio_ctx = new (window.AudioContext || window.webkitAudioContext);
	
	channels = 1; 				// 2; // can use 2 channels to model stereo output
	var frame_count = audio_ctx.sampleRate * channels;

	//buffer_source = audio_ctx.createBuffer(channels, frame_count, audio_ctx.sampleRate);
}

function start_sound() {
	// audio node used to play the audiobuffer
	var source = audio_ctx.createBufferSource();

	// set the buffer in the source
	source.buffer = buffer_source;

	// connect source so we can hear it
	source.connect(audio_ctx.destination);

	// start the source playing
	source.start();
}

// this function fills the buffer with data streamed from backend
function buffer(array) {
	var array_buffer = new ArrayBuffer(array.length);
	var buffered = new Uint8Array(array_buffer);

	for (var i = 0; i < array.length; i++) {
		buffered[i] = array[i];
	}

	audio_ctx.decodeAudioData(array_buffer, function(buffer) {
		buffer_source = buffer;

		// for (var channel = 0; channel < channels; channel++) {
		// 	var decoded_data = buffer.getChannelData(channel);
		// 	var now_buffering = buffer_source.getChannelData(channel);

		// 	for (var i = 0; i < decoded_data.length; i++) {
		// 		now_buffering[i] = decoded_data[i];
		// 	}
		// }
	});
}
