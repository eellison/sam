//Drawing
var CANVAS_SIZE = 400;

// var canvas = d3.select("#chart")
//     .append("svg:svg")
//       .attr("width", 300)//canvasWidth)
//       .attr("height", 300)


// var clientsCanvas = $("#clients-canvas");

var svg = d3.select("#clients-canvas")
   .append("svg:svg")
   .attr("width", CANVAS_SIZE)
   .attr("height", CANVAS_SIZE);
var focusGroup = svg.append("svg:g");
var focus = focusGroup.select("circle").append("circle");

var circleGroupH = svg.append("svg:g");
var circleGroup; 
var running = false;
var focus_x = -1;
var focus_y = -1;
var saved_clients = null;

// $("#clients-canvas").click(function(event){
// 	if (running) {
// 		var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
// 		var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
// 		alert("x:" + xPos + " y:" + yPos);
// 		focus_x = xPos;
// 		focus_y = yPos;

// 		draw(saved_clients);
// 		$.post("/changeFocus", {x : xPos, y : yPos}, function(responseJSON) {
			
// 		});
// 	}
// });

var xPos = 0;
var yPos = 0;
var quick = false;
$("#clients-canvas").on('mousedown', function(event){
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
	// alert("x:" + xPos + " y:" + yPos);
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
			// alert("x:" + xPos + " y:" + yPos);
			focus_x = xPos;
			focus_y = yPos;
			quick = true;
			draw(saved_clients);
			$.post("/changeFocus", {x : xPos, y : yPos, quick:quick}, function(responseJSON) {
			});
		} else {
			var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
			var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
			// alert("x:" + xPos + " y:" + yPos);
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
	if (focusDec) {
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
var focus;
var focusDec = false;
running = true;
var paused = false;
function draw(clients) {

	if (!running) {
		alert("Server not created!");
		return;
	}

	// Get the canvas
	// var canvas = $("#clients-canvas")[0];
	// canvas.width = CANVAS_SIZE;
	// canvas.height = CANVAS_SIZE;

	//Get 2D context for canvas drawing
	// var ctx = canvas.getContext("2d");
	// ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	// ctx.beginPath();
	// ctx.arc(focus_x, focus_y, 10, 0, 2 * Math.PI);
	// ctx.fillStyle = "black";
	// ctx.fill();

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
 	circleEnter.attr("fill", "none");
 	circleEnter.append("text")
 	 	.attr("fill-opacity", .7)
 		.text(function(client) {
 			if (client.name === undefined || client.name === null) {
 				return client.name
 			}
 			return ("Untitled" + untitled);
 		});
 	}



	// ngroup.append("circle")
	// 	.attr("cx", xscale(point.lat))
	// 	.attr("cy", yscale(point.lng))
	// 	.attr("r", 3)
	// 	.style("fill", "black");
	// clickedPoints[numClickedPoints] = point;
 	// clientGroup = svg.selectAll("circle").data(clients);
 	// var circleEnter = circle.enter().append("circle");

 	// circleEnter.attr("cx", function(d) { 
 	// 	if (client.x == -1) {
 	// 		return -50;
 	// 	}
 	// 	return client.x});
 	// circleEnter.attr("cy", function(d) { 
 	// 	if (client.y == -1) {
 	// 		return -50;
 	// 	}
 	// 	return client.y});
 	// circleEnter.attr("r", 10);
 	// circleEnter.append("text")
 	// 	.attr("dx", 11)
 	// 	.attr("dy", 11)
 	// 	.attr("fill-opacity", .7)
 	// 	.text(function(d) {
 	// 		if (client.name === undefined || client.name === null) {
 	// 			return client.name
 	// 		}
 	// 		return ("Untitled" + untitled);
 	// 	});
	// for (var i in clients) {
	// 	var client = clients[i];

	// 	if (client.x != -1 || client.y != -1) {
	// 		ctx.font = "18px serif";
	//   		ctx.fillText(client.id, client.x - 10, client.y - 10);

	// 		ctx.beginPath();
	// 		ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
	// 		ctx.stroke();
	// 	}
	// }
	if (time!=0 && !paused) {
		setTimeout(pulse, time);
	}
	// pulse();

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
	var updateClientPositionsTimer = setInterval(updateClientPositions, 5000);
});
