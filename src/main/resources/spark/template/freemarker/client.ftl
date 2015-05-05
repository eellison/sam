<#assign content>
<div id="client-gui">
	<h2 id="client-title" class="title" style="text-align: center;">Client</h2>
	<div id="client-gui">
		<label for="=clientpositions" style="margin-left: auto; margin-right: auto;">Click and drag your sound source</label></br>
		<canvas id="clients-canvas">
			
		</canvas>
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
	<script src="js/d3.js"></script>
	<script src="js/client.js"></script>
	<script src="http://cdn.peerjs.com/0.3/peer.js"></script>
</#assign>
<#include "main.ftl">