//Drawing
var CANVAS_SIZE = 400;

var clientsCanvas = $("#clients-canvas");

var running = false;
var focus_x = -1;
var focus_y = -1;
var saved_clients = null;

$("#clients-canvas").click(function(event){
	if (running) {
		var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
		var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
		alert("x:" + xPos + " y:" + yPos);
		focus_x = xPos;
		focus_y = yPos;

		draw(saved_clients);
		$.post("/changeFocus", {x : xPos, y : yPos}, function(responseJSON) {
			
		});
	}
});

$("#clear-focus").click(function(event) {
	if (running) {
		focus_x = -1;
		focus_y = -1;

		draw(saved_clients);
		$.post("/changeFocus", {x : focus_x, y : focus_y}, function(responseJSON) {
			
		});
	}
});

function draw(clients) {
	// Get the canvas
	var canvas = $("#clients-canvas")[0];
	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;

	//Get 2D context for canvas drawing
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	ctx.beginPath();
	ctx.arc(focus_x, focus_y, 10, 0, 2 * Math.PI);
	ctx.fillStyle = "black";
	ctx.fill();

	for (client in clients) {
		if (client.x == -1 || client.y == -1) {
			ctx.font = "18px serif";
	  		ctx.fillText(client.id, client.x - 10, client.y - 10);

			ctx.beginPath();
			ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
			ctx.stroke();
		}
	}
}

/* Update Client Positions */
function updateClientPositions() {
	$.get("/clients", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		console.log("Updated clients");
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject;
		
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