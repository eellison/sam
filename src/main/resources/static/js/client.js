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
	alert(url);
	setupClient(url);
});

function setupClient(url) {
	$.get("http://" + url + "/connectClient", function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		alert(responseObject.status);
		
		if (!responseObject.error) {
			server_url = url;
			client_id = responseObject.id;
			connected = true;

			var updateSongTimeTimer = setInterval(updateSongTime, 10000000);
			var updateSongTitleTimer = setInterval(updateSongTitle, 10000000);
			var updateVolumeTimer = setInterval(updateVolume, 100);
			var updateClientPositions = setInterval(updateClientPositions, 100);
		} else {
			connected = false;
		}
	});

	var io = require('socket.io')();
	io.on('connection', function(socket){});
	var port = url;
	io.listen(port);
}

/* everything below is used for playing music as it is streamed from the server*/
var audioCtx = new (window.AudioContext || window.webkitAudioContext);

// use 2 channels to model stereo output
var channels = 2;

var arrayBuffer = audioCtx.createBuffer(channels, audioCtx.sampleRate * channels, audioCtx.sampleRate);

$.post("/getData", {}, function(responseJSON) {
	var response = JSON.parse(responseJSON);

	updateData(response.data);
});


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
