<#assign content>

<input type="text" placeholder="/your/music/directory" id="dir"><br>
<input type="checkbox" id="encode" value="encode">Encode to MP3<br>
<input type="submit" id="submit">

<div class="songs-div">
	<ul id="songs-ul">
	</ul>
</div>

<button type="button">Back to Server</button>

<!-- <div class="form-group">
    <label for="fileupload">Select Your Music Folder</label>
	<input type="file" id="directory-select" webkitdirectory directory/>
</div> -->

</#assign>

<#assign pagescripts>
	<script src="js/id3Reader/binaryfile.js"></script>
	<script src="js/id3Reader/bufferedbinaryajax.js"></script>
	<script src="js/id3Reader/filereader.js"></script>
	<script src="js/id3Reader/id3.js"></script>
	<script src="js/id3Reader/id3v1.js"></script>
	<script src="js/id3Reader/id3v2.js"></script>
	<script src="js/id3Reader/id3v2frames.js"></script>
	<script src="js/id3Reader/id4.js"></script>
	<script src="js/id3Reader/stringutils.js"></script>
	<script src="js/songs.js"></script>
</#assign>

<#include "main.ftl">