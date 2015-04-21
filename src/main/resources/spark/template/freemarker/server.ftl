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
		<canvas id="clients-canvas">
			
		</canvas>
		<a class="btn btn-default btn-block" href="/songs" role="button" target="_blank">Songs</a>
	</div>
</div>
</#assign>

<#assign pagescripts>
	<script src="js/server.js"></script>
</#assign>
<#include "main.ftl">