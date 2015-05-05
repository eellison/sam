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

var svg = d3.select("#clients-canvas")
   .append("svg:svg")
   .attr("width", CANVAS_SIZE)
   .attr("height", CANVAS_SIZE);

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white")
    .attr("fill-opacity", .5)
    .attr("style", "outline: thin solid black;");

var circleGroupH = svg.append("svg:g");
var circleGroup; 

var secondsTimeout = new Date().getTime() / 1000;

$("#clients-canvas").on('mousedown', function(event){
	if (connected) {
		var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
		var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;

		$.post("http://" + server_url + "/updatePosition", {id : client_id, x : xPos, y : yPos, name: name}, 
			function(responseJSON) {
		});
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

	if ((new Date().getTime()/1000 - secondsTimeout)>10) {
		alert("Disconnected from server");
	}
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
		secondsTimeout = new Date().getTime() / 1000;
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


function draw_clients(saved_clients) {
 	
 	if (saved_clients != null ){
 		circleGroupH.selectAll("circle").remove();
 		circleGroup = circleGroupH.selectAll("circle").data(saved_clients);
		var circleEnter = circleGroup.enter().append("circle");
		circleEnter.attr("cx", function(client) { 
 			if (client.x == -1) {
 				return -50;
 			}
 			
 			return client.x;
 		});
 	
 		circleEnter.attr("cy", function(client) { 
 			if (client.y == -1) {
 				return -50;
 			}
 			
 			return client.y;
 		});
 		
 		circleEnter.attr("r", function(d) {	
 			var r = d.volume;
 			if (r === null || r === undefined) {
 				return 10 ;
 			}
 			r = 10*r;
 			r = Math.max(r, 2);
 			return r;
 		});
 		circleEnter.style("stroke", "black");
 		circleEnter.attr("fill", "none");
	 	var prev = 	d3.selectAll("text");
	 	prev.remove();

 		text = svg.selectAll("text")
                       .data(saved_clients)
                        .enter()
                        .append("text");


		//Add SVG Text Element Attributes
		textLabels = text
            .attr("x", function(d) { 
            	if (d.id === "0") {
            		return d.x-20;
            	}
            	return d.x-10;})
            .attr("y", function(d) { return d.y-10; })
            .text( function (d) { 
            	if (d.id === "0") {
            		return "Host";
            	}
            	if (d.id === client_id.toString()) {
            		if ($("#client-name").val().length!=0) {
            			return $("#client-name").val();
            		}
            		return d.id;
            	}
            	if (!(d.name === undefined || d.name === null)) {
            		if (d.name.length != 0) {
            			return d.name;
            		}
            	}
            	return d.id; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black")
            .attr("fill-opacity", .7);
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

	socket.on("song_info", function(data) {
		var songPackage = JSON.parse(data);

		updateCurrentTime(songPackage.current_time);
		updateTotalTime(songPackage.total_time);
		updateProgress(songPackage.progress);
		updateAlbumArt(songPackage.album_art);
		updateSongInfo(songPackage.info);
	});
}

/* functions used to update the gui for song playing */
function updateCurrentTime(time) {
	var current_time = get_mins_from_seconds(time);

	var seconds = current_time.sec;

	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	var stringTime = current_time.min + ":" + seconds;
	$("#current-time").text(stringTime);
}

function updateTotalTime(time) {
	var total_time = get_mins_from_seconds(time);

	var seconds = total_time.sec;

	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	var stringTime = total_time.min + ":" + seconds;
	$("#song-time").text(stringTime);
}

/* function used to convert from seconds to mins/seconds */
function get_mins_from_seconds(seconds) {
	var m = Math.floor(seconds / 60);
	var s = seconds - 60 * m;

	var time = {
		min: Math.floor(m),
		sec: Math.floor(s)
	};

	return time;
}

function updateProgress(percentage) {
	//update the gui progress bar
	var total_width = $("#progressbar").css("width");
	var total = total_width.slice(0, total_width.length - 2);
	var width = total * percentage;
	$("#progressbar > div").css("width", width + "px");
}

function updateAlbumArt(art_url) {
	if (typeof art_url != "undefined") {
		$("#current-song").css("background-image", "url('" + art_url + "')");
	} else {
		$("#current-song").css("background-image", "url('../images/placeholder.png')");
	}
}

function updateSongInfo(song_info) {
	$("#song-info").text(song_info);
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
