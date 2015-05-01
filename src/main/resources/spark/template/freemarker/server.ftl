<#assign content>
<div id="server-gui">
	<h2 class="title">Server</h2>
	<div id="server-prefs">
		<div class="form-group">
			<label for="=roomname">Room Name</label>
			<input type="text" id="room-name" class="form-control" placeholder="Dave's Room"></input>
		</div>
		<div class="form-group">
    		<label for="volume">Volume</label>
			<div class="well">
			    <input type="range" id="client-volume" min="0" max="10" value="7"></input>
		    </div>
		</div>
		<button class="btn btn-default btn-block btn-primary" id="server-create">Create</button>
	</div>
	<div id="server-canvas">
		<label for="=clientpositions">Client Positions</label></br>
		<div id="clients-canvas">

		</div>

		<!--<svg id="clients-canvas"></svg>-->


		</br>
		<div class="btn-group" role="btn-group-justified">
			<button class="btn btn-default" id="clear-focus">Clear Focus</button>
			<a class="btn btn-default" href="/songs" role="button" target="_blank">Songs</a>
		</div>
	</div>
</div>
</#assign>

<#assign pagescripts>

	<script src="js/socket.io.js"></script>
	<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
	<script src="js/server.js"></script>
	<script src="http://cdn.peerjs.com/0.3/peer.js"></script>
</#assign>
<#include "main.ftl">