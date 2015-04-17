var clientsCanvas = $("#clients-canvas");
var playing = true;

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

function setupClient(url) {
	var io = require('socket.io')();
	io.on('connection', function(socket){});
	var port = url;
	io.listen(port);
}