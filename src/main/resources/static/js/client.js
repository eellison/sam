var clientsCanvas = $("#clients-canvas");
var playing = true;
var max_volume = 1;
var volume = 1;

$("#clients-canvas").click(function(event){
	var x = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var y = event.pageY - $("#clients-canvas")[0].offsetTop;
	alert("x:" + x + " y:" + y);
});

$("#client-connect").click(function(event) {
	var url = $("server-url")[0];
	setupClient(url);
});

function updateSongTime() {
	$.post("/songTime", {}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		$("#song-length").text(responseObject.songLength);
	});
}

var updateSongTimeTimer = setInterval(updateSongTime, 10000000);

function updateSongTitle() {
	$.post("/songTitle", {}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		$("#song-title").text(responseObject.songTitle);
	});
}

var updateSongTitleTimer = setInterval(updateSongTitle, 10000000);

function updateVolume() {
	$.post("/volume", {}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		volume = min(responseObject.volume, max_volume);
		console.log(volume);
	});
}

var updateVolumeTimer = setInterval(updateVolume, 100);

function setupClient(url) {
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
