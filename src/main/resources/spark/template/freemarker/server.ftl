<#assign content>
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">
<script src="http://code.jquery.com/jquery-1.11.2.min.js"></script>
<script src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>

<div id="server-gui">
	<div>
		<div id="tweetBtn" style='float:left; margin-top:5px;'>
			<script>
				window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};return t;}(document,"script","twitter-wjs"));
			</script>
		</div></br>
		<h4 id="server-title" class="title" style="margin-top:-10px;">Server</h2>
		<div id='songs-wrapper'>
			<label>Click to add songs to the queue</label></br>
			<div class="btn-group" style="width: 100%;">
				<input type="search" id="song-search" class="form-control" placeholder="Search by song, album, or artist"></input>
				<span id="search-clear" class="glyphicon glyphicon-remove-circle"></span>
			</div>
			<div id="songs-bound-div-2">
			
			</div>
		</div>
		<div id="queue-wrapper">
			<label>Queue</label></br>
			<div id="songs-bound-div-3">
				<div id='queue-div'></div>
			</div>
		</div>
		<div id="server-canvas">
			<label for="clientpositions">Client Positions</label></br>
			<div data-role="main" class="ui-content" style="float: right; width: 100px; height: 100px;">
				<a href="#myPopup" data-rel="popup" class="ui-btn ui-btn-inline ui-corner-all">Show Popup</a>

				<div data-role="popup" id="myPopup" class="ui-content">
					<h3>Welcome!</h3>
					<p>The "ui-content" class is especially useful when you have a popup with <span style="font-size:55px;">styled text</span>, and want the edges and corners to look extra clean and sleek. <strong>Note:</strong> The text will wrap to multiple lines if needed.</p>
				</div>
			</div>
			<div id="clients-canvas">
			</div>
			</br>
			<div class="btn-group" role="btn-group-justified">
				<button class="btn btn-default" id="clear-focus">Clear Focus</button>
				<button class="btn btn-default" id="mute">Mute</button>
				<a class="btn btn-default" href="/songs" role="button" target="_blank">Change Directory</a>
			</div>
		</div>
	</div>
	</br>
	<div style="clear: both; position: fixed; min-width: 1100px; width: 80%; bottom: 0; left: 10%; float: left;">
		<div id="song-controls">
			<div id='current-song' style='float:left;width:70px;height:70px;'></div>
			<button id="pause-play"></button>
			<p id="current-time" style="float: left;">0:00</p>
			<div id="progressbar">
  				<div></div>
			</div>
			<p id="song-time" style="float: left;">0:00</p>
			<button id="skip"></button>
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