//Song
var playing = true;

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

$("#clients-canvas").click(function(event) {
	if (connected) {
		var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
		var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
		alert("x:" + xPos + " y:" + yPos);

		$.post("http://" + server_url + "/updatePosition", {id : client_id, x : xPos, y : yPos}, function(responseJSON) {
			
		});
	}
});

/* Song Info */
function updateSongTime() {
	$.get("http://" + server_url + "/songTime", {id : client_id}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		$("#song-length").text(responseObject.songLength);
	});
}

function updateSongTitle() {
	$.get("http://" + server_url + "/songTitle", {id : client_id}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		$("#song-title").text(responseObject.songTitle);
	});
}

/* Volume */
function updateVolume() {
	$.get("http://" + server_url + "/volume", {id : client_id}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		volume = min(responseObject.volume, max_volume);
		console.log(volume);
	});
}

$("client-volume").on("input", function(e) {
	console.log($(this).value);
	max_volume = $(this).value / 10;
});

/* Update Client Positions */
function updateClientPositions() {
	$.get("http://" + server_url + "/clientPositions", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject;

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

	for (client in clients) {
		ctx.beginPath();
		ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

$("#client-connect").click(function(event) {
	var url = $("#server-url").val();
	setupClient(url);
});

function setupClient(url) {
	$.get("http://" + url + "/connectClient", function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);

		if (!responseObject.error) {
			server_url = url;
			client_id = responseObject.id;
			socket_server_url = responseObject.server_url;
			socket_server_port = responseObject.server_port;
			connected = true;

			setupSocketConnection(socket_server_url, socket_server_port);

			var updateSongTimeTimer = setInterval(updateSongTime, 10000000);
			var updateSongTitleTimer = setInterval(updateSongTitle, 10000000);
			var updateVolumeTimer = setInterval(updateVolume, 100000000);
			var updateClientPositions = setInterval(updateClientPositions, 100000000);
		} else {
			connected = false;
		}
	});
}

function setupSocketConnection(url, port) {
	var socket = io('http://' + url + ':' + port);
	socket.on('connect', function() {
 		console.log("Client connected");
	});

	socket.on('disconnect', function() {
		console.log("Client disconnected");
	});

	socket.on('data', function() {
		alert("RECEIVED SONG DATA");
	})
}

/* everything below is used for playing music as it is streamed from the server*/
var audioCtx = new (window.AudioContext || window.webkitAudioContext);

// can use 2 channels to model stereo output
var channels = 1;// 2;

var frameCount = audioCtx.sampleRate * channels;

var arrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);

// this function fills the buffer with data streamed from backend
function buffer(array) {
	for (var channel = 0; channel < channels; channel++) {
		var buffering = myArrayBuffer.getChannelData(channel);
		
		for (var i = 0; i < frameCount; i++) {
			buffering[i] = b[i];
		}
	}
}

// audio node used to play the audiobuffer
var source = audioCtx.createBufferSource();

// set the buffer in the source
source.buffer = arrayBuffer;

// connect source so we can hear it
source.connect(audioCtx.destination);

// start the source playing
source.start();

// window.onload = init;
// var context;    // Audio context
// var buf;        // Audio buffer

// function init() {
// if (!window.AudioContext) {
//     if (!window.webkitAudioContext) {
//         alert("Your browser does not support any AudioContext and cannot play back this audio.");
//         return;
//     }
//         window.AudioContext = window.webkitAudioContext;
//     }

//     context = new AudioContext();
// }

// function playByteArray(byteArray) {
//     var arrayBuffer = new ArrayBuffer(byteArray.length);
//     var bufferView = new Uint8Array(arrayBuffer);
//     for (i = 0; i < byteArray.length; i++) {
//       bufferView[i] = byteArray[i];
//     }

//     context.decodeAudioData(arrayBuffer, function(buffer) {
//         buf = buffer;
//         play();
//     });
// }

// // Play the loaded file
// function play() {
//     // Create a source node from the buffer
//     var source = context.createBufferSource();
//     source.buffer = buf;
//     // Connect to the final output node (the speakers)
//     source.connect(context.destination);
//     // Play immediately
//     source.start(0);
// }
