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
var peer_client_ids = [];
var peer_connections = {};
var muted = false;
var current_dir = "src/main/resources/static/testdirectory";
var songsdiv = $("<div></div>");
var queuediv = $("#queue-div");
var API_KEY = "0d73a4465bd208188cc852a95b011b22";

// variable needed for queueing the stream
var audio_stream = null;
var stream_started = false;
var source = null;

// variable used to represent the song queue
var song_queue = {};
var song_ids = [];
var queue = [];

// variable used to represent location in song (in time)
var current_song_time = 0;
var current_song_total_time = 0;
var song_timer = null;
var paused_stream = false;

var address;
var localAddress;
var value;
getIP();


function getIP() {
	try {
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
			        .attr('data-text', "Join the Party! | " + value);
			    $('#tweetBtn').append(tweetBtn);
			    twttr.widgets;	
				}
			})
	} catch (e) {
		console.log("Allow twitter cross-platform access");
	} 
	setUpServer();
}



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
var foci = [];
var nowPause = true;
var saved_clients = null;
var paused = false;

var xPos = 0;
var yPos = 0;
var quick = false;
$("#clients-canvas").on('mousedown', function(event){

	var isRightMB;
    var e = e || window.event;
    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 

   	if (isRightMB) {
   		updateServerPosition(event);
   		return;
   	}

   	if (event.shiftKey) {
   		addFocusPoint(event);
   		return;
   	}
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


function addFocusPoint(event) {
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;

	focus = focusGroup.append("circle")
 		.attr("cx", focus_x)
		.attr("cy", focus_y)
		.attr("r", 10)
		.attr("stroke-width", 1)
		.attr("stroke", "black")
		.attr("fill", "none");
	focusDec = true;
	time = .01;
}




function updateServerPosition(event) {
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
	$.post("http://" + server_url + "/updatePosition", {id : 0, x : xPos, y : yPos}, function(responseJSON) {
	});
}




var pulseTime = 3000;
var timer;
var down = false;

function pulse() {
	if (paused) {
		return;
	}
	// console.log("nowPause: " + nowPause);
	// console.log("focusDec: " + focusDec);
	// console.log("pause: " + paused);
	// console.log("focus_x: " + focus_x);
	// console.log("focus_y: " + focus_x);


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
		var tempClients = [];
		point1 = [];
		point2 = [];
		point1[x] = -5;
		point1[y] = -10;
		point2[x] = 5;
		point2[y] = 10;
		$.post("/changeFocus", {noFocus: pause, focusPoints: tempClients}, function(responseJSON) {});
	}
});

$("#mute").click(function(event) {
	if (running) {
		$.post("/mute", {}, function(responseJSON) {
			muted = !muted;
			if (muted) {
				$("#mute").text("Unmute");
			} else {
				$("#mute").text("Mute");
			}
		});
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
			.attr("fill", "none");
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
            .text( function (d) { 
            	if (d.id === "1")
            		return "Host";
            	return d.id; })
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
function setUpServer() {
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
	}

}

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

/* function used to stream the song to the peer connections */
function stream(bytes, song_id) {
	var array_buffer = new ArrayBuffer(bytes.length);
	var buffered = new Uint8Array(array_buffer);

	for (var i = 0; i < bytes.length; i++) {
		buffered[i] = bytes[i];
	}
	
	context.decodeAudioData(array_buffer, function(buffer) {
		song_ids.push(song_id);
		song_queue[song_id] = buffer;

		if (!audio_stream) {
			current_song_id = song_id;
			
			// enabled play and next buttons
			$("#pause-play").prop('disabled', false);
			$("#skip").prop('disabled', false);
		}
	});
}

/* function used to play the stream to peers who are listening */
function playStream() {
	paused_stream = false;

	if (!audio_stream) { // create a new audio_stream to play
		stream_started = true;

		source = context.createBufferSource();
		source.buffer = song_queue[current_song_id];

		current_song_total_time = song_queue[current_song_id].duration;

		current_song_time = 0;
		source.start(0);
		song_timer = setInterval(count_song_time, 1000);

		source.onended = nextSong;

		var remote = context.createMediaStreamDestination();
		source.connect(remote);

		// keep hold of stream in case a connection comes part way through song
		audio_stream = remote.stream;

		nowPlaying(queue[current_song_id]);
		removeFromGUIQueue(current_song_id);

		// pass the stream to the peer
		streamToPeers(remote.stream);
	} else { // play stream after being paused
		source = context.createBufferSource();
		source.buffer = song_queue[current_song_id];

		source.start(0, current_song_time);
		song_timer = setInterval(count_song_time, 1000);

		source.onended = nextSong;

		var remote = context.createMediaStreamDestination();
		source.connect(remote);

		// keep hold of stream in case a connection comes part way through song
		audio_stream = remote.stream;

		// pass the stream to the peer
		streamToPeers(remote.stream);
	}
}

/* function used to count the time the song has been playing */
function count_song_time() {
	if (current_song_time == 0) {
		update_total_time();
	}
	update_current_time();
	current_song_time++;
}

/* functions used to update the time shown on gui */
function update_total_time() {
	var total_time = get_mins_from_seconds(current_song_total_time);

	// Show total time of song here:

}

function update_current_time() {
	var current_time = get_mins_from_seconds(current_song_time);

	// Show current time of song here:
	
}

function update_progress(percentage) {
	//update the gui progress bar
}

/* function used to convert from seconds to mins/seconds */
function get_mins_from_seconds(seconds) {
	var m = Math.floor(seconds / 60);
	var s = seconds - 60 * m;

	var time = {
		min: m,
		sec: s
	};

	return time;
}

function pauseStream() {
	if (audio_stream) {
		clearInterval(song_timer);
		paused_stream = true;
		source.stop();
	}
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

			if (stream_started) {
				peer.call(conn.peer, audio_stream);
			}
		}
	});
}

/* function used to stream the song to the peer connections */
function streamToPeers(stream) {
	for (var i = 0; i < peer_client_ids.length; i++) {
		var id = peer_client_ids[i];
		if (id != peer_id) {
			var call = peer.call(id, stream);
		}
	}
}

/* function used to play song locally */
function play(song) {
	var player = new Audio();
	player.src = URL.createObjectURL(song);
	player.play();
}

/* function used to update the volume of all of the clients */
function updateVolumeOfPeers() {
	for (var i = 0; i < peer_client_ids.length; i++) {
		var id = peer_client_ids[i];
		if (id != peer_id) {
			var curr_conn = peer_connections[id];
			//curr_conn.send(JSON.stringify(saved_clients));
		}
	}
}

/* stuff needed to play song on server as if it were a client */
function createSelfPeer() {
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
		call.answer();

		call.on('stream', function(stream) {
			play(stream);
		});
	});
}

// begin skip button as disabled
$("#skip").prop('disabled', true);

/* define function used to skip to next song */
$("#skip").on('click', function(event){
	nextSong();
});

/* function used to get to the next song in the queue */
function nextSong() {
	// if something is being streamed and its not currently paused
	if ((audio_stream) && (!paused_stream)) {
		// remove current song from queue
		delete song_queue[current_song_id];
		var index = song_ids.indexOf(current_song_id);
		removeFromGUIQueue(current_song_id);

		if (index > -1) {
			song_ids.splice(index, 1);
		}

		if (song_ids.length > 0) {
			var next_id = song_ids[index];
			var next_song = song_queue[next_id];
			current_song_id = next_id;
			
			// stop source and reset it to next song
			source.stop();
			source = context.createBufferSource();
			source.buffer = next_song;
			source.start();

			//source.connect(context.destination);
			var remote = context.createMediaStreamDestination();
			source.connect(remote);

			// keep hold of stream in case a connection comes part way through song
			audio_stream = remote.stream;

			nowPlaying(queue[current_song_id]);
			removeFromGUIQueue(current_song_id);

			// pass the stream to the peer
			streamToPeers(remote.stream);
		} else { // no more songs in the queue
			source.stop();
			source = null;
			audio_stream = null;

			// disable play and next buttons
			$("#pause-play").prop('disabled', true);
			$("#skip").prop('disabled', true);

			// make sure the play button is shown and that it is paused
			song_is_paused = true;
			$("#pause-play").css("background-image", "url('../images/play.png')");
		}
	}
}

/* enqueue this song */
function enqueue(song_ele) {
	var path = song_ele.filePath;
	$.post("/playSong", {songPath : path}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		var id = responseObject.song_id;
		queue[id] = song_ele;
	});
}

/* get the next id for the song*/
function nextId() {
	var index = song_ids.indexOf(current_song_id);
	return song_ids[index];
}

/* remove a song_element from the queue */
function removeFromQueue(id) {
	//Called by GUI

	// remove it from list of song_elements
}

function removeFirstFromGUIQueue() {
	//removeFromGUI
	//Called by queue
}

function nowPlaying(song_ele) {
	//update album artwork
	var albumarthighres = song_ele.albumarthighres;
	if (typeof albumarthighres != "undefined") {
		$("current-song").css("background", "url('" + albumarthighres + "')");
	} else {
		$("current-song").css("background", "url('../images/placeholder.png')");
	}
}

// variable used to define if the song is paused or not
// on start-up: assume it is paused and the button is disabled
var song_is_paused = true;
$("#pause-play").prop('disabled', true);

/* define what happens when user pauses */
$("#pause-play").on('click', function(event){
	if (!empty_song_queue()) {
		if (song_is_paused) {
			// show pause button
			$("#pause-play").css("background-image", "url('../images/pause.png')");

			playStream();
			song_is_paused = false;
		} else {
			// show play button
			$("#pause-play").css("background-image", "url('../images/play.png')");

			pauseStream();
			song_is_paused = true;
		}
	}
});

/* returns whether there is an empty song queue */
function empty_song_queue() {
	if (song_ids.length <= 0) {
		return true;
	}
	return false;
}

$("#song-search").on("change", function(event) {
$.post("/search", {line : $("song-search").val()}, function(responseJSON) {
	songsdiv.remove();
	songsdiv = $("<div id='songs-div'></div>");

	var songs = JSON.parse(responseJSON);
	songs.forEach(function(elem) {
		var _path = elem.filePath;
		var _title = elem.title;
		var _album = elem.album;
		var _artist = elem.artist;
		var playbutton = $("<button>Queue</button>");
		playbutton.on("click", function(e) {

		});

		$.get("http://ws.audioscrobbler.com/2.0/", {method : "album.getinfo", artist : _artist, album : _album, api_key : API_KEY, format : "json"})
	    .done(function(responseJSONSong) {
	    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");

	    	if (typeof responseJSONSong.error == 'undefined') {
				var albumart = responseJSONSong.album.image[1]["#text"];
				var albumarthighres = responseJSONSong.album.image[3]["#text"];
				elem.albumart = albumart;
				elem.albumarthighres = albumarthighres;
				
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
				addSongToGUIQueue(elem);
			});

			song.append(playbutton);
			songsdiv.append(song);
		})
	    .fail(function(xhr, textStatus, errorThrown) {
	    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
			
			if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
				song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div>");
			}

			song.on('click', function(e) {
				addSongToGUIQueue(elem);
			});

			song.append(playbutton);
			songsdiv.append(song);
	    });
	});

	$("#songs-bound-div-2").append(songsdiv);
});
});

function addSongToGUIQueue(song_element) {
	var albumart = song_element.albumart;
	var _title = song_element.title;
	var _artist = song_element.artist;

	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown </p></div>");
	if (typeof albumart != "undefined") {
		song = $("<div class='song'><img src='" + albumart + "' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
	} else {
		if (typeof _title != 'undefined' && typeof _artist != 'undefined') {
			song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
		}
	}

	song.on('click', function(e) {
		addSongToGUIQueue(elem);
	});

	queuediv.append(song);
	enqueue(song_element);
}

$("#search-clear").click(function(){
    $("#song-search").val('');
});

$.post("/chooseMusicDirectory", {dir : current_dir}, function(responseJSON) {
	songsdiv.remove();
	songsdiv = $("<div id='songs-div'></div>");

	var songs = JSON.parse(responseJSON);
	songs.forEach(function(elem) {
		var _path = elem.filePath;
		var _title = elem.title;
		var _album = elem.album;
		var _artist = elem.artist;
		var playbutton = $("<button>Queue</button>");
		playbutton.on("click", function(e) {

		});

		$.get("http://ws.audioscrobbler.com/2.0/", {method : "album.getinfo", artist : _artist, album : _album, api_key : API_KEY, format : "json"})
	    .done(function(responseJSONSong) {
	    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");

	    	if (typeof responseJSONSong.error == 'undefined') {
				var albumart = responseJSONSong.album.image[1]["#text"];
				var albumarthighres = responseJSONSong.album.image[3]["#text"];
				elem.albumart = albumart;
				elem.albumarthighres = albumarthighres;
				
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
				addSongToGUIQueue(elem);
			});

			song.append(playbutton);
			songsdiv.append(song);
		})
	    .fail(function(xhr, textStatus, errorThrown) {
	    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + " by " + _artist + "</p></div>");
			
			if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
				song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div>");
			}

			song.on('click', function(e) {
				addSongToGUIQueue(elem);
			});

			song.append(playbutton);
			songsdiv.append(song);
	    });
	});

	$("#songs-bound-div-2").append(songsdiv);
});
