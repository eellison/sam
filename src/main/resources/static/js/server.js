var clientsCanvas = $("#clients-canvas");

$("#clients-canvas").click(function(event){
	var x = event.pageX - $("#clients-canvas")[0].offsetLeft;
	var y = event.pageY - $("#clients-canvas")[0].offsetTop;
	alert("x:" + x + " y:" + y);

	$.post("http://" + server_url + "/changeFocus", {x : xPos, y : yPos}, function(responseJSON) {
			
	});
});

$("#server-create").click(function(event) {
	$.post("/startServer", {}, function(responseJSON) {});
	alert("Started server");
});
