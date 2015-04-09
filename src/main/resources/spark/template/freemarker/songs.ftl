<#assign content>
<script src="js/songs.js"></script>
<div id="song-search">
	<input id="song-search" class="form-control" type="text" placeholder="Search songs by name..."></input>
	<ul id="results-list" class="list-group">
		<li class="list-group-item">
			Result by Artist
		</li>
		<li class="list-group-item">
			Result by Artist
		</li>
		<li class="list-group-item">
			Result by Artist
		</li>
		<li class="list-group-item">
			Result by Artist
		</li>
	</ul>
</div>

 <div class="form-group">
    <label for="fileupload">Select Your Music Folder</label>
	<input type="file" id="directory-select" webkitdirectory directory/>
</div>

</#assign>

<#assign pagescripts>
	<script src="js/songs.js"></script>
</#assign>
<#include "main.ftl">