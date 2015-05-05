<#assign content>
<div id="client-gui">
	<h2 id="client-title" class="title">Client</h2>
	<div id="client-prefs">
		<div class="form-group">
			<label for="server">Server Address</label>
			<input type="text" id="server-url" class="form-control" placeholder="127.0.0.1:4567"></input>
		</div>
		<div class="form-group">
			<label for="clientname">Client Name</label>
			<input type="text" id="client-name" class="form-control" placeholder="Dave's Room"></input>
		</div>
		<div class="form-group">
    		<label for="maxvolume">Max Volume</label>
			<div class="well">
			    <input type="range" id="client-volume" min="0" max="10" value="10"></input>
		    </div>
		</div>
		<button class="btn btn-default btn-block btn-primary" id="client-connect">Connect</button>
	</div>
	<div id="client-canvas">
		<label for="=clientpositions">Click and drag your sound source</label></br>
		<canvas id="clients-canvas">
			
		</canvas>
		<form class="form-inline">
		<p id="song-title">
			Song by Artist
		</p>
		<p id="song-length">
			1:00/4:00
		</p>
		</form>
	</div>
	</br>
	<div style="clear: both; position: fixed; min-width: 1100px; width: 80%; bottom: 0; left: 10%; float: left;">
		<div id="song-controls">
			<div id='current-song' style='float:left;width:70px;height:70px;'></div>
			<p id="current-time" style="float: left; margin-left: 75px;">0:00</p>
			<div id="progressbar">
  				<div></div>
			</div>
			<p id="song-time" style="float: left;">0:00</p>
			</br>
			<p id="song-info" style="color: rgba(165, 208, 254, 0.8); clear: both; text-align: center; vertical-align: middle; margin-top: -27px; width: 50%; margin-left: 26%; float: left;">No Song Playing</p>
		</div>
	</div>
</div>
</#assign>

<#assign pagescripts>
	<script src="js/socket.io.js"></script>
	<script src="js/client.js"></script>
	<script src="http://cdn.peerjs.com/0.3/peer.js"></script>
</#assign>
<#include "main.ftl">