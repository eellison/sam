// Drawing
var CANVAS_SIZE = 400;

// audio context (global variable)
var context = new (window.AudioContext || window.webkitAudioContext);

// object used to represent the socket io connection
var socket = null;

// variable needed for peer to peer connection
var peer_key = "";
var peer_id = "";
var peer = null;
var self_peer = null;
var peer_client_ids = [];
var peer_connections = {};
var muted = false;
var current_dir = "src/main/resources/static/testdirectory";
var songsdiv = $("<div></div>");
var API_KEY = "0d73a4465bd208188cc852a95b011b22";


var address;
var value;
getIP();



function getIP() {
	$.post("/getIP", {}, function(responseJSON) {
		var ipResponse = JSON.parse(responseJSON);
		if (ipResponse.success) {
			address = ipResponse.address;
			value = window.location.host + window.location.pathname;
			var search = /(server)/i;
			value = value.replace(search, "client");
			search = "localhost";
			value = value.replace(search, address);
			$('#tweetBtn iframe').remove();
    		// Generate new markup

    		var tweetBtn = $('<a></a>')
		        .addClass('twitter-hashtag-button')
		        .attr('data-text', "Join the Party @ " + value);
		    $('#tweetBtn').append(tweetBtn);
		    twttr.widgets.load();
		} catch(e) {
			console.log("Allow twitter cross-platform access");
		}	
	}
}



// media stream used to represent audio streaming to clients
var audio_stream = null;
var stream_started = false;
var audio_tracks = {};
var audio_track_ids = [];
var current_song_id = -1;

var svg = d3.select("#clients-canvas")
   .append("svg:svg")
   .attr("width", CANVAS_SIZE)
   .attr("height", CANVAS_SIZE);

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white")
    .attr("fill-opacity", .5)
    .attr("style", "outline: thin solid black;")

var focusGroup = svg.append("svg:g");
var focus = focusGroup.select("circle").append("circle");

var circleGroupH = svg.append("svg:g");
var circleGroup; 
var running = false;
var focus_x = -1;
var focus_y = -1;
var nowPause = true;
var saved_clients = null;
var paused = false;

var xPos = 0;
var yPos = 0;
var quick = false;
$("#clients-canvas").on('mousedown', function(event){
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;

	focus_x = xPos;
	focus_y = yPos;
	draw(saved_clients);
	quick = false;
	$.post("/changeFocus", {x : xPos, y : yPos, quick:quick, pause:paused}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject.clients;
		saved_clients = clients;
		updateVolumeOfPeers();
	});

	$("#clients-canvas").on('mouseup mousemove', function handler(event) {
		if (event.type == 'mousemove') {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;

			focus_x = xPos;
			focus_y = yPos;
			quick = false;
			draw(saved_clients);
			$.post("/changeFocus", {x : xPos, y : yPos, quick:quick, pause:paused}, function(responseJSON) {
			});
		} else {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
			
			focus_x = xPos;
			focus_y = yPos;
			quick = false;
			draw(saved_clients);
			$("#clients-canvas").off('mouseup mousemove', handler);
			$.post("/changeFocus", {x : xPos, y : yPos, quick:quick, pause:paused}, function(responseJSON) {
				var responseObject = JSON.parse(responseJSON);
				var clients = responseObject.clients;
				saved_clients = clients;
				updateVolumeOfPeers();
			});
		}
	});
});
var pulseTime = 3000;
var timer;
var down = false;

function pulse() {
	if (paused) {
		return;
	}

	if (focusDec && !paused) {
		if (down) {
			down = false;
			focus
				.transition()
				.duration(pulseTime/2*(focus.attr("r")-7)/6)
				.attr("stroke-width", 1.5)
				.attr("r", 7)
				.ease('sine')
				.transition()
				.duration(pulseTime/2)
				.attr('stroke-width', 0.5)
				.attr("r", 13)
				.ease('sine')
		}
		else {
			down = true;
			focus
				.transition()
				.duration(pulseTime/2*(13-focus.attr("r"))/6)
				.attr('stroke-width', 0.5)
				.attr("r", 13)
				.ease('sine')
				.transition()
				.duration(pulseTime/2)
				.attr("stroke-width", 1.5)
				.attr("r", 7)
				.ease('sine')
		}
	}
}
$("#clear-focus").click(function(event) {
	if (running) {
		nowPause = true;
		paused = false;
		draw(saved_clients);
		$.post("/changeFocus", {x : focus_x, y : focus_y, noFocus:pause}, function(responseJSON) {
		});
	}
});

$("#mute").click(function(event) {
	if (audio_stream) {
		audio_stream.getAudioTracks()[0].enabled = !(audio_stream.getAudioTracks()[0].enabled);
		muted = !muted;
		if (muted) {
			$("#mute").text("Unmute");
		} else {
			$("#mute").text("Mute");
		}
	} else {
		alert('no song playing!');
	}
});

var focus;
var focusDec = false;
running = true;
var text;
var textLabels;
function draw(clients) {
	if (!running) {
		alert("Server not created!");
		return;
	}

	if (paused) {
		focus.attr("r", 10);
		timer = setInterval(pulse, pulseTime/2);
	}

 	var time = 0;
 	if (nowPause && !paused) {
 		paused = true;
 		nowPause = false;
 		clearInterval(timer);
 		focus
 			.transition()
 			.transition()
 			.duration(200)
 			.attr("r", 0);

 	} else if (!focusDec) {
 		timer = setInterval(pulse, pulseTime/2);
 		focus = focusGroup.append("circle")
 			.attr("cx", focus_x)
			.attr("cy", focus_y)
			.attr("r", 10)
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("fill", "none")
		focusDec = true;
		time = .01;
 	} else {
 		time = Math.sqrt(Math.pow((focus.attr("cx") - focus_x), 2) + 
 			Math.pow((focus.attr("cy")-focus_y), 2));
 		time = time * 3;
 		time = Math.pow(time, .9);
 		if (quick) {
 			time = 0;
 		}
 		if (paused) {
 			time = .01;
 			paused = false;
 		}
 		focus.transition()
 		.duration(time)
 		.attr("cx", focus_x)
		.attr("cy", focus_y);
 	}
 	
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
 			if (r === null || r === undefined || paused ===true) {
 				return 10 ;
 			}
 			r = 10*r;
 			r = Math.max(r, 1);
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
            .attr("x", function(d) { return d.x-10; })
            .attr("y", function(d) { return d.y-10; })
            .text( function (d) { return d.id; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black")
            .attr("fill-opacity", .7);
 	}
	if (time!=0 && !paused) {
		setTimeout(pulse, time);
	}
}

/* Update Client Positions */
function updateClientPositions() {
	$.get("/clients", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject.clients;

		draw(clients);
		saved_clients = clients;

		// update volume
		updateVolumeOfPeers();
	});
}

/* create server on click of create */
$("#server-create").click(function(event) {
	if (!socket) {
		// start the socket server
		$.post("/startServer", {}, function(responseJSON) {
			var responseObject = JSON.parse(responseJSON);
			if (!responseObject.error) {
				$("#server-create").text("Server Created");
				// $.post("/getIP", {}, function(responseJSON) {
				// 	var ipResponse = JSON.parse(responseJSON);
				// 	if (ipResponse.success) {
						// var address = ipResponse.address;
				//set earlier for twitter
				if (address != null)  {
					$("#server-title").text("Server IP: " + address);
				}
					// }
				// });
				// get the socket io url and port for the socket connection
				socket_url = responseObject.socket_url;
				socket_port = responseObject.socket_port;

				// set up the socket io connection
				setupSocketConnection(socket_url, socket_port);
			
				var updateClientPositionsTimer = setInterval(updateClientPositions, 3000);
			}
		});
	} else {
		if (audio_stream) {
			// skip to next song (FOR TESTING)
			skipSong();
		}
	}
});

/* everything below is used for playing music as it is streamed from the server*/
function setupSocketConnection(url, port) {
	socket = io('http://' + url + ':' + port);
	socket.on('connect', function() {
 		console.log("SocketIO Connection Established");

 		// get peer.js key (wait 1 second first)
 		setTimeout(function() {
 			socket.emit('peer_key', 'server');
 		}, 1000);
	});

	socket.on('disconnect', function() {
		console.log("SocketIO Connection Disconnected");
	});

	socket.on('data', function(data) {
		var response = JSON.parse(data);
		var song_bytes = response.song;
		var song_id = response.track_id;

		stream(song_bytes, song_id);
	});

	socket.on("peer_key", function(data) {
		console.log("Peer Created");
		peer_key = data;
		createPeer();
		createSelfPeer();
	});
}

var source = null;
/* function used to stream the song to the peer connections */
function stream(bytes, song_id) {
	var array_buffer = new ArrayBuffer(bytes.length);
	var buffered = new Uint8Array(array_buffer);

	for (var i = 0; i < bytes.length; i++) {
		buffered[i] = bytes[i];
	}
	
	context.decodeAudioData(array_buffer, function(buffer) {
		audio_tracks[song_id] = buffer;
		audio_track_ids.push(song_id);

		console.log("decoded");
		if (!audio_stream) { // start right away
			console.log("no audio stream");

			source = context.createBufferSource();
			source.buffer = buffer;
			source.start();

			var remote = context.createMediaStreamDestination();
			source.connect(remote);

			// pass the stream to the peer
			audio_stream = remote.stream;
			current_song_id = song_id;

			streamToPeers(audio_stream);
		} else { // queue
			console.log("audio stream exists");
		}
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
		socket.emit("server_id", peer_id);
	});

	peer.on('connection', function(conn) {
		// peer connections not really working right now
		peer_connections[conn.peer] = conn;
		if (!(peer_client_ids.indexOf(conn.peer) > -1)) {
			peer_client_ids.push(conn.peer);
		
			console.log("connected");
			if (stream_started) {
				console.log("call sent");
				peer.call(conn.peer, audio_stream);
			}
		}
	});
}


/* function used to stream the song to the peer connections */
function streamToPeers(stream) {
	console.log("streaming");
	stream_started = true;
	for (var i = 0; i < peer_client_ids.length; i++) {
		var id = peer_client_ids[i];
		console.log("call sent");
		var call = peer.call(id, stream);
	}
}

/* function used to update the volume of all of the clients */
function updateVolumeOfPeers() {
	for (var i = 0; i < peer_client_ids.length; i++) {
		var id = peer_client_ids[i];
		
		var curr_conn = peer_connections[id];
		//curr_conn.send(JSON.stringify(saved_clients));
	}
}

/* method used to pause the song playing */
function pauseAudio() {
	audio_stream.getAudioTracks()[0].enabled = !(audio_stream.getAudioTracks()[0].enabled);
}

/* function used to skip to the next song (if there is one) */
function skipSong() {
	if (audio_stream) {
		if (audio_track_ids.length > 1) {
			var curr_track = audio_tracks[current_song_id];
			var next_track = audio_tracks[current_song_id + 1];

			source = context.createBufferSource();
			source.buffer = next_track;
			source.start();

			var remote = context.createMediaStreamDestination();
			source.connect(remote);
			
			audio_stream = remote.stream;
			streamToPeers(audio_stream); 

			current_song_id++;
		} else {
			audio_stream.getAudioTracks()[0].enabled = false;
			current_song_id = -1;
			audio_stream = null;
		}
	}
	
	//tracks[0].stop();
}

/* everything here is needed to play song on server as if it were a client */
function createSelfPeer() {
	setupPlayer();

	self_peer = new Peer({
		key: peer_key, 
		config: {'iceServers': [
    		{url: "stun:stun.l.google.com:19302"},
			{url:"turn:numb.viagenie.ca", credential: "password123"}]}
    });

    self_peer.on('open', function(id) {
		socket.emit("client_id", id);

		// connect to peer, but wait for split second
		setTimeout(function() {
 			self_peer.connect(peer_id);
 		}, 1000);
		
	});

	self_peer.on('call', function(call) {
		console.log("call received");
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

$.post("/chooseMusicDirectory", {dir : current_dir}, function(responseJSON) {
	songsdiv.remove();
	songsdiv = $("<div id='songs-div' style='margin-top: 10px;'></div>");

	var songs = JSON.parse(responseJSON);
	songs.forEach(function(elem) {
		var _path = elem.filePath;
		var _title = elem.title;
		var _album = elem.album;
		var _artist = elem.artist;

		$.get("http://ws.audioscrobbler.com/2.0/", {method : "album.getinfo", artist : _artist, album : _album, api_key : API_KEY, format : "json"})
	    .done(function(responseJSONSong) {
	    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");

	    	if (typeof responseJSONSong.error == 'undefined') {
				var albumart = responseJSONSong.album.image[1]["#text"];
				var albumarthighres = responseJSONSong.album.image[3]["#text"];
				
				if (typeof albumart != "undefined") {
					song = $("<div class='song'><img src='" + albumart + "' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
				} else {
					if (typeof _title == 'undefined') {
						song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown </p></div>");
					} else {
						song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
					}
				}
			}

			if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
				song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div>");
			}

			song.on('click', function(e) {
				alert("Playing " + _title + " by " + _artist + ".");
				if (typeof albumarthighres != "undefined") {
				 	$("#current-song").css("background-image", "url('" + albumarthighres + "')");
				 } else {
				 	$("#current-song").css("background-image", "url('../images/placeholder.png')");
				 }
				$.post("/playSong", {songPath : _path}, function(responseJSON) {
				
				});
			});

			songsdiv.append(song);
		})
	    .fail(function(xhr, textStatus, errorThrown) {
	    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
			
			if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
				song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div>");
			}

			song.on('click', function(e) {
				alert("Playing " + _title + " by " + _artist + ".");
				
				$.post("/playSong", {songPath : _path}, function(responseJSON) {
				
				});
			});

			songsdiv.append(song);
	    });
	});

	$("#songs-bound-div-2").append(songsdiv);
});

$("#search-clear").click(function(){
    $("#song-search").val('');
});
