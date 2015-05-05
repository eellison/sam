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
var current_dir = "";
var songsdiv = $("#songs-div");
var queuediv = $("#queue-div");
var API_KEY = "0d73a4465bd208188cc852a95b011b22";

// variable needed for queueing the stream
var audio_stream = null;
var stream_started = false;
var source = null;

// variable used to represent the song queue
var song_queue = {};
var song_ids = [];
var queue = {};

// variable used to represent location in song (in time)
var current_song_time = 0;
var current_song_total_time = 0;
var song_timer = null;
var paused_stream = false;
var current_song_info = "";
var current_albumarthighres = "";
var current_percentage = 0;

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
    .attr("style", "outline: thin solid black;");

svg.selectAll("rect").on("contextmenu", function (d, i) {
            d3.event.preventDefault();
           // react on right-clicking
});

var focusGroup = svg.append("svg:g");
var circleGroupH = svg.append("svg:g");
var circleGroup; 
var foci = [];
var nowPause = false;
var saved_clients = [];

var initialHost =[];
initialHost["id"] = "0";
initialHost["name"] =  "";
initialHost["volume"] = 1;
initialHost["x"] = CANVAS_SIZE/2;
initialHost["y"] = CANVAS_SIZE/2;

saved_clients.push(initialHost);

var paused = false;

var xPos = CANVAS_SIZE/2;
var yPos = CANVAS_SIZE/2;
var quick = false;

function inCircle(pX, pY, cX, cY, r) {
	var distancesquared = (pX - cX) * (pX - cX) + (pY - cY) * (pY - cY);
  	return distancesquared <= r * r;
}
var deciSeconds = new Date().getTime() / 100;

var selectedFocus;
$("#clients-canvas").on('mousedown', function(event){
	var isRightMB;
    var e = e || window.event;
    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 
    var shiftDown = event.shiftKey;
    var altDown = event.altKey;
    var commandDown = event.metaKey;
    if (shiftDown && !altDown) {
    	addFocusPoint(event);
    	return;
    }
    if (commandDown) {
   		muteClient(event);
   	}

   	if (isRightMB) {
   		event.stopPropagation();
   		updateServerPosition(event);
   		return;
   	}
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
	var clicked = false;
	var i = fociArray.length-1;
	while(clicked==false & i >= 0) {
		var focusI = fociArray[i];
		clicked = inCircle(xPos, yPos, focusI.attr("cx"), focusI.attr("cy"), focusI.attr("r"));
		i--;
	}
	if (!clicked) {
		return;
	}
	if (altDown) {
		deleteFoc(focusI);
	}
	draw(saved_clients);
	quick = false;

	focusI.attr("fill", "gray")
	    .attr("fill-opacity", .5);

	$("clients-canvas").on('keydown', deleteFoc(event));
	selectedFocus = focusI;
	$("#clients-canvas").on('mouseup mousemove', function handler(event) {
		if (event.type == 'mousemove') {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
			focusI.attr("cx", xPos)
				.attr("cy", yPos)
			quick = false;
			draw(saved_clients);
			var newdeciSeconds = new Date().getTime() / 100;
			if ((newdeciSeconds - deciSeconds) > 1) {
				updateVariablesPost();
			}
			deciSeconds = newdeciSeconds;
		} else {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
			focusI.attr("fill", "none");
			quick = false;
			draw(saved_clients);
			selectedFocus = false;
			$("#clients-canvas").off('mouseup mousemove', handler);
			$("clients-canvas").off('keydown', deleteFoc(event));

			updateVariablesPost();
		}
	});
});

fociArray = new Array();

function deleteFoc(focusP) {
	var index = fociArray.indexOf(focusP);
	if (index != -1) {
		fociArray.splice(index, 1);
		focusP
 			.transition()
 			.transition()
 			.duration(200)
 			.attr("r", 0);
	}
}
var muteArray = {};
var muteArrayKeys = [];

function muteClient(event) {
	var clicked = false;
	var i = saved_clients.length-1;	
	var eventX = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var eventY = event.pageY - $("#clients-canvas")[0].offsetTop;


	while(clicked==false & i >= 0) {
		var clientI = saved_clients[i];
		if (!(clientI === undefined || clientI === null)) {
			var clientX = clientI.x;
			var clientY = clientI.y;
			var r = clientI.volume;
 			if (r === null || r === undefined || paused ===true) {
 				r = 10;
 			} else {
 				r = 10*r;
 			}
 			r = Math.max(r, 4);

			clicked = inCircle(eventX, eventY, clientX, clientY, r)
		}
		i--;
	}
	if (clicked) {
		var nId = (clientI.id);
		console.log(nId);
		console.log(clientI.id);
		if (!(muteArray[nId])) {
			if (muteArrayKeys.indexOf(nId)==-1) {
				muteArrayKeys.push(nId);
			}

			muteArray[nId] = true;
		} else {
			muteArray[nId] = !muteArray[nId];
		}

	}
}


function addFocusPoint(event) {
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;

	if (saved_clients === null || saved_clients == undefined) {
		if (fociArray.length > 1) {
			return; //will be 
		}
	} else {
		if (fociArray.length >= saved_clients.length) {
			return; 
		}
	}
	var newF = focusGroup.append("circle").attr("cx", xPos)
		.attr("cy", yPos)
		.attr("r", 10)
		.attr("stroke-width", 1)
		.attr("stroke", "black")
		.attr("fill", "none");
	time = .01;
	fociArray.push(newF);
	updateVariablesPost();
}

function updateServerPosition(event) {
	xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
	updateVariablesPost();
}

var pulseTime = 3000;
var down = false;
function pulse() {
	if (muted) {
		return;
	}
	down = !down;
	for (var i = 0; i < fociArray.length; i++) {
		var focusI = fociArray[i];
		if (down) {
			focusI
				.transition()
				.duration(pulseTime/2*(focusI.attr("r")-7)/6)
				.attr("stroke-width", 1.5)
				.attr("r", 7)
				.ease('sine')
				.transition()
				.duration(pulseTime/2)
				.attr('stroke-width', 0.5)
				.attr("r", 13)
				.ease('sine')
		} 	else {
			focusI
				.transition()
				.duration(pulseTime/2*(13-focusI.attr("r"))/6)
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
		updateVariablesPost();
	}
});


var secondsTimeout = new Date().getTime() / 1000;

function updateVariablesPost() {
	if ((new Date().getTime()/1000 - secondsTimeout)>5) {
		alert("Disconnected from server");
	}


	var tempFociArray = [];
	var fociString = "";
	var muteMapString = "";
	for (var i = 0; i < fociArray.length; i++) {
		var focusI = fociArray[i];
		var xfoc = focusI.attr("cx");
		fociString = fociString + xfoc + " , ";
		var yfoc = focusI.attr("cy");
		fociString = fociString + yfoc +  " , ";
	} 
	for (var i=0; i<muteArrayKeys.length; i++) {
		var key = muteArrayKeys[i];
		if (!(muteArray[key] === null || muteArray[key] === undefined)) {
			muteMapString += "key: ";
			muteMapString += key + " , " + muteArray[key] + " ";
		}
	} 
	//updates the host position as part of changeFocus
	$.post("/changeFocus", {id: "0", x : xPos, y : yPos, quick: quick, mute: muted, pause: paused, 
		focusPoints: fociString, muteArray: muteMapString}, function(responseJSON) {

	secondsTimeout = new Date().getTime() / 1000;

	var responseObject = JSON.parse(responseJSON);
	var clients = responseObject.clients;
	saved_clients = clients;
	for (var i = 0; i < saved_clients.length; i++) {
		if (saved_clients[i].id === "0") {
			changeVolumeLevel(saved_clients[i].volume);
		}
	}
	updateVolumeOfPeers();
	draw(saved_clients);
	});		
}
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


running = true;
var text;
var textLabels;
var timer = setInterval(pulse, pulseTime/2);
var postTimer = setInterval(updateVariablesPost, 1000);
draw(saved_clients);
function draw(clients, event) {
	if (!running) {
		alert("Server not created!");
		return;
	}
 	var time = 0;
 	//pause button clicked
 	if (nowPause && !paused) {
 		paused = true;
 		nowPause = false;
 		for (var i = 0; i < fociArray.length; i++) {
			var focusI = fociArray[i];
			focusI
	 			.transition()
	 			.transition()
	 			.duration(200)
	 			.attr("r", 0);
	 	} 
	 	fociArray = [];
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
 			r = Math.max(r, 2);
 			return r;
 		});
 		circleEnter.style("stroke", "black");
 		circleEnter.attr("fill", function(d) {
 			if (d.volume == 0) {
 				return "black";
 			}
 			return "none";});
 		circleEnter.attr("fill-opacity", function(d) {
 			if (muteArray[d.id]) {
 				return .9;
 			}
 			return 0;});

 		circleEnter
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

				//set earlier for twitter
				if (address != null)  {
					$("#server-title").text("Server IP: " + address);
				}

				// get the socket io url and port for the socket connection
				socket_url = responseObject.socket_url;
				socket_port = responseObject.socket_port;

				// set up the socket io connection
				setupSocketConnection(socket_url, socket_port);
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
			$("#pause-play").css("opacity", "1.0");
			$("#skip").prop('disabled', false);
			$("#skip").css("opacity", "1.0");
			$("#pause-play").click();
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
		removeFirstFromGUIQueue();

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

	sendSongInfo();

	current_song_time++;
}

/* function used to send song info to all clients */
function sendSongInfo() {
	var songPackage = {
		current_time: current_song_time,
		total_time: current_song_total_time,
		progress: current_percentage,
		album_art: current_albumarthighres,
		info: current_song_info
	};

	socket.emit('song_info', JSON.stringify(songPackage));
}

/* functions used to update the time shown on gui */
function update_total_time() {
	var total_time = get_mins_from_seconds(current_song_total_time);

	var seconds = total_time.sec;
	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	var stringTime = total_time.min + ":" + seconds;
	$("#song-time").text(stringTime);
}

function update_current_time() {
	var current_time = get_mins_from_seconds(current_song_time);

	current_percentage = current_song_time / current_song_total_time;
	update_progress(current_percentage);

	var seconds = current_time.sec;
	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	var stringTime = current_time.min + ":" + seconds;
	$("#current-time").text(stringTime);
}

function update_progress(percentage) {
	//update the gui progress bar
	var total_width = $("#progressbar").css("width");
	var total = total_width.slice(0, total_width.length - 2);
	var width = total * percentage;
	$("#progressbar > div").css("width", width + "px");
}

function resetTimeAndProgress() {
	clearInterval(song_timer);
	current_song_time = 0;
	current_song_total_time = 0;
	update_current_time();
	update_total_time();
	update_progress(0);
	clearAlbumArt();
	clearSongInfo();
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

var player = null;
/* function used to play song locally */
function play(song) {
	player = new Audio();
	player.src = URL.createObjectURL(song);
	player.play();
}

function changeVolumeLevel(vol) {
	if (!(player === null || player === undefined)) {
		player.volume = vol;
	}
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
$("#skip").css("opacity", "0.3");

$("#skip").on('mouseenter', function() {
	$("#skip").css("opacity", "0.7");
});
$("#skip").on('mouseleave', function() {
	$("#skip").css("opacity", "1.0");
});

/* define function used to skip to next song */
$("#skip").on('click', function(event){
	source.stop();
});

/* function used to get to the next song in the queue */
function nextSong() {
	// if something is being streamed and its not currently paused
	if ((audio_stream) && (!paused_stream)) {
		// remove current song from queue
		var index = song_ids.indexOf(current_song_id);

		removeFromQueue(current_song_id);

		if (song_ids.length > 0) {
			var next_id = song_ids[index];
			var next_song = song_queue[next_id];
			current_song_id = next_id;
			
			// stop source and reset it to next song
			source.stop();
			current_song_time = 0;

			source = context.createBufferSource();
			source.buffer = next_song;
			source.onended = nextSong;
			source.start();

			//source.connect(context.destination);
			var remote = context.createMediaStreamDestination();
			source.connect(remote);

			// keep hold of stream in case a connection comes part way through song
			audio_stream = remote.stream;

			nowPlaying(queue[current_song_id]);
			removeFirstFromGUIQueue();

			// pass the stream to the peer
			streamToPeers(remote.stream);
		} else { // no more songs in the queue
			source.stop();
			source = null;
			audio_stream = null;
			resetTimeAndProgress();

			// disable play and next buttons
			$("#pause-play").prop('disabled', true);
			$("#pause-play").css("opacity", "0.3");
			$("#skip").prop('disabled', true);
			$("#skip").css("opacity", "0.3");

			// make sure the play button is shown and that it is paused
			song_is_paused = true;
			$("#pause-play").css("background-image", "url('../images/play.png')");
		}
	}
}

/* remove a song_element from the queue */
function removeFromQueue(id) {
	//Called by GUI
	// remove it from list of song_elements
	var index = song_ids.indexOf(id); 
	song_ids.splice(index, 1);
	delete song_queue[id];
	delete queue[id];
}

function removeFirstFromGUIQueue() {
	//removeFromGUI
	//Called by queue
	$('#queue-div').find('div').first().remove();
}

function nowPlaying(song_ele) {
	//update album artwork
	current_albumarthighres = song_ele.albumarthighres;
	if (typeof current_albumarthighres != "undefined") {
		$("#current-song").css("background-image", "url('" + current_albumarthighres + "')");
	} else {
		$("#current-song").css("background-image", "url('../images/placeholder.png')");
	}

	// update song info
	var artist_name = song_ele.artist;
	var song_name = song_ele.title;
	current_song_info = song_name + " by " + artist_name;
	$("#song-info").text(current_song_info);
}

function clearAlbumArt() {
	current_albumarthighres = "../images/placeholder.png";
	$("#current-song").css("background-image", "url('../images/placeholder.png')");
}

function clearSongInfo() {
	current_song_info = "No Song Playing";
	$("#song-info").text("No Song Playing");
}

// variable used to define if the song is paused or not
// on start-up: assume it is paused and the button is disabled
var song_is_paused = true;
$("#pause-play").prop('disabled', true);
$("#pause-play").css("opacity", "0.3");

$("#pause-play").on('mouseenter', function() {
	$("#pause-play").css("opacity", "0.7");
});
$("#pause-play").on('mouseleave', function() {
	$("#pause-play").css("opacity", "1.0");
});

/* define what happens when user pauses */
$("#pause-play").on('click', function(event){
	if (!empty_song_queue()) {
		if (song_is_paused) {
			// show pause button
			$("#pause-play").css("background-image", "url('../images/pause.png')");
			
			$("#skip").prop("disabled", false);
			$("#skip").css("opacity", "1.0");


			playStream();
			song_is_paused = false;
		} else {
			// show play button
			$("#pause-play").css("background-image", "url('../images/play.png')");

			$("#skip").prop("disabled", true);
			$("#skip").css("opacity", "0.3");

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

window.onfocus = function() {
  console.log("alert");
}
/*
$.get("/currentDir", function(responseJSON) {
	current_dir = responseJSON;
	$.post("/chooseMusicDirectory", {dir : current_dir}, function(responseJSON) {
		songsdiv.remove();
		songsdiv = $("<div id='songs-div'></div>");
		var songs = JSON.parse(responseJSON);
		
		songs.forEach(function(elem) {
			var _path = elem.filePath;
			var _title = elem.title;
			var _album = elem.album;
			var _artist = elem.artist;
			var id_p = _title + _album;
			var imgid = null;

			var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown </p></div></div>");
			if (typeof _title != 'undefined') {
				imgid = id_p.replace(/\W/g, '');
				song = $("<div><div class='song'><img id='" + imgid + "' src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");
			}

			songsdiv.append(song);
			var playbutton = $("<button id='queue-button'></button>");
			playbutton.on("click", function(e) {
				addSongToGUIQueue(elem);
			});

			song.append(playbutton);

			$.get("http://ws.audioscrobbler.com/2.0/", {method : "album.getinfo", artist : _artist, album : _album, api_key : API_KEY, format : "json"})
		    .done(function(responseJSONSong) {
		    	//var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");

		    	if (typeof responseJSONSong.error == 'undefined') {
					var albumart = responseJSONSong.album.image[0]["#text"];
					var albumarthighres = responseJSONSong.album.image[3]["#text"];
					elem.albumart = albumart;
					elem.albumarthighres = albumarthighres;
					
					if (typeof albumart != "undefined") {
						songsdiv.find("#" + imgid).attr("src", albumart);
					}
				}

				if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
					//song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div></div>");
				}

				song.on('click', function(e) {
				
				});

				song.append(playbutton);
				//songsdiv.append(song);
			})
		    .fail(function(xhr, textStatus, errorThrown) {
		    	//var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");
				
				if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
					//song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div></div>");
				}

				song.on('click', function(e) {
				
				});

				song.append(playbutton);
				//songsdiv.append(song);
		    });
		});

		$("#songs-bound-div-2").append(songsdiv);
	});
});
*/

$('#song-search').on('input', function(e) {
	var search = $("#song-search").val();

    if (search === "") {
    	$("#search-info").show();
    	songsdiv.remove();
    	return;
    }
});

$('#song-search').keydown(function(e){
    if (e.keyCode === 13) {
    songsdiv.remove();  
    var search = $("#song-search").val();

    if (search === "") {
    	$("#search-info").show();
    	return;
    }

	$.post("/search", {line : search}, function(responseJSON) {
		songsdiv.remove();
		songsdiv = $("<div id='songs-div'></div>");
		var songs = JSON.parse(responseJSON);
		$("#search-info").hide();
		songs.forEach(function(elem) {
			var _path = elem.filePath;
			var _title = elem.title;
			var _album = elem.album;
			var _artist = elem.artist;
			var id_p = _title + _album;
			var imgid = null;

			var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown </p></div></div>");
			if (typeof _title != 'undefined') {
				imgid = id_p.replace(/\W/g, '');
				song = $("<div><div class='song'><img id='" + imgid + "' src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");
			}

			songsdiv.append(song);
			var playbutton = $("<button class='queue-button'></button>");
			playbutton.on("click", function(e) {
				addSongToGUIQueue(elem);
			});

			song.append(playbutton);

			$.get("http://ws.audioscrobbler.com/2.0/", {method : "album.getinfo", artist : _artist, album : _album, api_key : API_KEY, format : "json"})
		    .done(function(responseJSONSong) {
		    	//var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");

		    	if (typeof responseJSONSong.error == 'undefined') {
					var albumart = responseJSONSong.album.image[0]["#text"];
					var albumarthighres = responseJSONSong.album.image[3]["#text"];
					elem.albumart = albumart;
					elem.albumarthighres = albumarthighres;
					
					if (typeof albumart != "undefined") {
						songsdiv.find("#" + imgid).attr("src", albumart);
					}
				}

				if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
					//song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div></div>");
				}

				song.on('click', function(e) {
				
				});

				//songsdiv.append(song);
			})
		    .fail(function(xhr, textStatus, errorThrown) {
		    	//var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");
				
				if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
					//song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div></div>");
				}

				song.on('click', function(e) {
				
				});

				//songsdiv.append(song);
		    });
		});

	$("#songs-bound-div-2").append(songsdiv);
	});


    }
});

function addSongToGUIQueue(song_element) {
	// disable the add to queue buttons
	$(".queue-button").prop("disabled", true);
	
	$("#queue-info").remove();

	// add it to gui queue witha album art and name/artist
	var albumart = song_element.albumart;
	var _title = song_element.title;
	var _artist = song_element.artist;

	var song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div></div>");
	if (typeof albumart != "undefined") {
		song = $("<div><div class='song'><img src='" + albumart + "' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");
	} else {
		if (typeof _title != 'undefined' && typeof _artist != 'undefined') {
			song = $("<div><div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div></div>");
		}
	}

	queuediv.append(song);

	var removeButton = $("<button id='remove-button'></button>");
	removeButton.prop("disabled", true);
	removeButton.css("opacity", "0.3");

	$("#skip").prop("disabled", true);
	$("#skip").css("opacity", "0.3");

	song.append(removeButton);

	var path = song_element.filePath;

	$.post("/playSong", {songPath: path}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);
		var id = responseObject.song_id;
		queue[id] = song_element;
		addSongGUIHelper(song_element, id, song, removeButton);
		$(".queue-button").prop("disabled", false);
	});
}

function addSongGUIHelper(song_element, id, song, removeButton) {
	removeButton.prop("disabled", false);
	removeButton.css("opacity", "1.0");

	$("#skip").prop("disabled", false);
	$("#skip").css("opacity", "1.0");


	removeButton.on("click", function(e) {
		removeFromQueue(id);
		song.remove();
	});
}

$("#search-clear").click(function(){
    $("#song-search").val('');
    $("#search-info").show();
    songsdiv.remove();
});
