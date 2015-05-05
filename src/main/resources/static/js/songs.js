var current_dir = "";
var last_dirs = [];
var DIRECTORY_LABEL_LENGTH = 12;
var FILE_LABEL_LENGTH = 5;
var filesdiv = $("<div></div>");
var songsdiv = $("<div></div>");
var API_KEY = "0d73a4465bd208188cc852a95b011b22";

function queryFilesystem(dir) {
	$.post("/queryFilesystem", {path : dir}, function(responseJSON) {
		filesdiv.remove();
		filesdiv = $("<ul id='files-div'></ul>");

		last_dirs.push(dir);
		current_dir = dir;

		var responseObject = JSON.parse(responseJSON);
		var files = responseObject.files;
		var directories = responseObject.directories;

		directories.forEach(function(elem) {
			var directory = $("<button class='folder-button'><p id='directory-label-text'>" + elem.name + "</p></button>");
			
			directory.on('click', function(e) {
				queryFilesystem(elem.path);
			});
			
			filesdiv.append(directory);
		});

		files.forEach(function(elem) {
			var file = $("<button class='file-button'><p id='file-label-text'>" + elem.name + "</p></button>");
			
			file.on('click', function(e) {
				
			});

			filesdiv.append(file);
		});

		$("#files-bound-div").append(filesdiv);
	});
}

queryFilesystem(current_dir);

$("#back").click(function(event) {
	last_dirs.pop();
	var dir = last_dirs.pop();
	queryFilesystem(dir);
});

$("#use").click(function(event) {
	$.post("/chooseMusicDirectory", {dir : current_dir}, function(responseJSON) {
		songsdiv.remove();
		songsdiv = $("<div id='songs-div'></div>");

		var songs = JSON.parse(responseJSON);
		songs.forEach(function(elem) {
			var _path = elem.filePath;
			var _title = elem.title;
			var _album = elem.album;
			var _artist = elem.artist;

			$.get("http://ws.audioscrobbler.com/2.0/", {method : "album.getinfo", artist : _artist, album : _album, api_key : API_KEY, format : "json"})
		    .done(function(responseJSONSong) {
		    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div>");

		    	if (typeof responseJSONSong.error == 'undefined') {
					var albumart = responseJSONSong.album.image[1]["#text"];
					
					if (typeof albumart != "undefined") {
						song = $("<div class='song'><img src='" + albumart + "' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div>");
					} else {
						if (typeof _title == 'undefined') {
							song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown </p></div>");
						} else {
							song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song'  style='margin-top: 0px;'>by " + _artist + "</p></div>");
						}
					}
				}

				if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
					song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div>");
				}

				song.on('click', function(e) {
					$.post("/playSong", {songPath : _path}, function(responseJSON) {
						alert("Playing " + _title + " by " + _artist + ".");
					});
				});

				songsdiv.append(song);
			})
		    .fail(function(xhr, textStatus, errorThrown) {
		    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>" + _title + "</p></br><p class='song' style='margin-top: 0px;'>by " + _artist + "</p></div>");
				
				if (typeof _title == 'undefined' || typeof _album == 'undefined' || typeof _artist == 'undefined') {
					song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:38px;height:38px;'><p class='song'>Unknown by Unknown</p></div>");
				}

				song.on('click', function(e) {
					alert("Playing " + _title + " by " + _artist + ".");
					$.post("/playSong", {songPath : _path}, function(responseJSON) {
						
					});
				});

				songsdiv.append(song);
		    });
		});

		$("#songs-bound-div").append(songsdiv);
	});
});
