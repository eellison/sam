<#assign content>
<div id="server-gui">
	<h2 id="server-title" class="title">Server</h2>
	<div id="server-prefs">
		<div class="form-group">
			<label for="roomname">Room Name</label>
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
	<div id='songs-wrapper'>
		<label>Songs</label></br>
		<div id="songs-bound-div-2">
		
		</div>
	</div>
	<div id="server-canvas">
		<label for="clientpositions">Client Positions</label></br>
		<div id="clients-canvas">
		</div>
		</br>
		<div class="btn-group" role="btn-group-justified">
			<button class="btn btn-default" id="clear-focus">Clear Focus</button>
			<button class="btn btn-default" id="mute">Mute</button>
			<a class="btn btn-default" href="/songs" role="button" target="_blank">Select Directory</a>
		</div>
	</div>
</div>
</#assign>

<#assign pagescripts>

	<script src="js/socket.io.js"></script>
	<script src="js/d3.js"></script>
	<script src="js/server.js"></script>
	<script src="http://cdn.peerjs.com/0.3/peer.js"></script>
</#assign>
<#include "main.ftl">