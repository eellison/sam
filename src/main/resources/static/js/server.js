var clientsCanvas = $("#clients-canvas");

$("#clients-canvas").click(function(event){
	var xPos = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var yPos = event.pageY - $("#clients-canvas")[0].offsetTop;
	alert("x:" + xPos + " y:" + yPos);
	draw_focus(xPos, yPos);
	
	$.post("http://" + server_url + "/changeFocus", {x : xPos, y : yPos}, function(responseJSON) {
		
	});
});

function draw_focus(x, y) {
	// Get the canvas
	var canvas = $("#clients-canvas")[0];
	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;

	//Get 2D context for canvas drawing
	var ctx = canvas.getContext("2d");
	ctx.clearRect(CANVAS_SIZE, CANVAS_SIZE);

	ctx.beginPath();
	ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
	ctx.fillStyle = "black";
	ctx.fill();
}

/* Update Client Positions */
function updateClientPositions() {
	$.get("http://" + server_url + "/clientPositions", {width : CANVAS_SIZE, height : CANVAS_SIZE}, function(responseJSON) {
		console.log("Updated clients");
		var responseObject = JSON.parse(responseJSON);
		var clients = responseObject;
		
		console.log(clients)
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
	ctx.clearRect(CANVAS_SIZE, CANVAS_SIZE);

	for (client in clients) {
		ctx.beginPath();
		ctx.arc(client.x, client.y, 10, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

$("#server-create").click(function(event) {
	$.post("/startServer", {}, function(responseJSON) {});
	alert("Started server");
	var updateClientPositions = setInterval(updateClientPositions, 1000);
});