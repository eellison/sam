//Drawing
var CANVAS_SIZE = 400;


var svg = d3.select("#clients-canvas")
   .append("svg:svg")
   .attr("width", CANVAS_SIZE)
   .attr("height", CANVAS_SIZE);


svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white")
    .attr("style", "outline: thin solid black;")

var focusGroup = svg.append("svg:g");
var focus = focusGroup.select("circle").append("circle");

var circleGroupH = svg.append("svg:g");
var circleGroup; 
var running = false;
var focus_x = -1;
var focus_y = -1;
var saved_clients = null;


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
	$.post("/changeFocus", {x : xPos, y : yPos, quick:quick}, function(responseJSON) {
	});
	$("#clients-canvas").on('mouseup mousemove', function handler(event) {
		if (event.type == 'mousemove') {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
			
			focus_x = xPos;
			focus_y = yPos;
			quick = true;
			draw(saved_clients);
			$.post("/changeFocus", {x : xPos, y : yPos, quick:quick}, function(responseJSON) {
			});
		} else {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
			
			focus_x = xPos;
			focus_y = yPos;
			quick = false;
			draw(saved_clients);
			$("#clients-canvas").off('mouseup mousemove', handler);
			$.post("/changeFocus", {x : xPos, y : yPos, quick:quick}, function(responseJSON) {
			});
		}
	});
});
var pulseTime = 3000;
var timer;
var down = false;
function pulse() {
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
		focus_x = -1;
		focus_y = -1;

		draw(saved_clients);
		$.post("/changeFocus", {x : focus_x, y : focus_y}, function(responseJSON) {
			
		});
	}
});
function getTime(zone, success) {
    var url = 'http://json-time.appspot.com/time.json?tz=' + zone,
        ud = 'json' + (+new Date());
    window[ud]= function(o){
        success && success(new Date(o.datetime), o);
    };
    document.getElementsByTagName('head')[0].appendChild((function(){
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = url + '&callback=' + ud;
        return s;
    })());
}
var offset = 0;
var accurTime;
var accurTime1;
var localTime = new Date().getTime();

for (var i=0; i<4; i++) {
	getTime('GMT', function(time){
	accurTime = new Date(time).getTime();
	offset = offset + accurTime - new Date().getTime();
	});
	offset = offset/5;
}

// setInterval(getTime, 1000000);

var focus;
var focusDec = false;
running = true;
var paused = false;
function draw(clients) {

	if (!running) {
		alert("Server not created!");
		return;
	}
	date = new Date().getTime();
	console.log(date);

	if (paused) {
		focus.attr("r", 10);
		timer = setInterval(pulse, pulseTime/2);
	}

 	var time = 0;
 	if (focus_x == -1) {
 		paused = true;
 		clearInterval(timer);
 		focus
 			.transition()
 			.transition()
 			.duration(200)
 			.attr("r", 0);

 	} else if (!focusDec) {
 		timer = setInterval(pulse, pulseTime/2);
 		console.log("undefined");
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
 	// clearInterval(timer);
 	// timer = setInterval(pulse, pulseTime);
 	
 	if (saved_clients != null ){
 		circleGroupH.selectAll("circle").remove();
 		 circleGroup = circleGroupH.selectAll("circle").data(saved_clients);
	var circleEnter = circleGroup.enter().append("circle");
	circleEnter.attr("cx", function(client) { 
 		if (client.x == -1) {
 			return -50;
 		}
 		return client.x});
 	circleEnter.attr("cy", function(client) { 
 		if (client.y == -1) {
 			return -50;
 		}
 		return client.y});
 	circleEnter.attr("r", 10);
 	circleEnter.attr("fill", "black");
 	circleEnter.append("text")
 	 .attr("fill-opacity", .7)
 	.text(function(client) {
		if (client.id === undefined || client.name === null) {
			return client.id
		}
		return ("Untitled" + untitled);
 		});
 	}
	if (time!=0 && !paused) {
		setTimeout(pulse, time);
	}

}

/* Update Client Positions */
function updateClientPositions() {
	$.get("/clients", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		console.log("Updated clients");
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject.clients;
		
		console.log(clients);
		draw(clients);
		saved_clients = clients;
	});
}

$("#server-create").click(function(event) {
	$.post("/startServer", {}, function(responseJSON) {
		running = true;
	});

	alert("Started server");
	var updateClientPositionsTimer = setInterval(updateClientPositions, 1000);
});
