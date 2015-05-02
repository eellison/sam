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
			var file = $("<button class='file-button'></button>");
			
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
				var albumart = responseJSONSong.album.image[1]["#text"];
				var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:48px;height:48px'><h4 style='margin-left: 10px;'>" + _title + " by " + _artist + "</h4></div>");
				
				if (typeof albumart != "undefined") {
					song = $("<div class='song'><img src='" + albumart + "' style='float:left;width:48px;height:48px'><h4 style='margin-left: 10px;'>" + _title + " by " + _artist + "</h4></div>");
				}

				song.on('click', function(e) {
					$.post("/playSong", {songPath : _path}, function(responseJSON) {
						alert("Playing " + _title + " by " + _artist + ".");
					});
				});

				songsdiv.append(song);
			})
		    .fail(function(xhr, textStatus, errorThrown) {
		    	var song = $("<div class='song'><img src='../images/placeholder.png' style='float:left;width:48px;height:48px'><h4 style='margin-left: 10px;'>" + _title + " by " + _artist + "</h4></div>");
				
				song.on('click', function(e) {
					$.post("/playSong", {songPath : _path}, function(responseJSON) {
						alert("Playing " + _title + " by " + _artist + ".");
					});
				});

				songsdiv.append(song);
		    });
		});

		$("#songs-bound-div").append(songsdiv);
	});
});

/*
$( "#submit" ).click(function () {
  var dir = $( "#dir" )[0].value;
  var encode = $( "#encode" )[0].value;
  var postParameters = {
  	dir: dir,
  	encode: encode
  };

  $.post("/musicdirectory", postParameters, function(responseJSON) {
	var songs = JSON.parse(responseJSON);
	console.log(songs);
	songs.forEach(function(elem) {
		var song = document.createElement("li");
		var info = elem.title + " on " + elem.album + " by " + elem.artist;
		song.appendChild(document.createTextNode(info));
		song.addEventListener('click', function(e) {
			var song_info = $(this).text();
		});
		$( "#songs-ul" ).append(song);
	});
  });
});
*/

/*$(".form-group #directory-select").change(function() {
	var soundFiles = findSoundFiles($( ".form-group #directory-select" )[0].files);

	soundFiles.forEach(function(elem) {
		console.log(elem);
		var song = elem;

		if (!isMp3(elem)) {
			var postParameters = {
				filePath: "/home/yk46/course/cs032/projects/sam/src/main/resources/static/testdirectory/song1.wav"
			};

			$.post("/mp3encode", postParameters, function(responseJSON) {
				song = JSON.parse(responseJSON);
				console.log(song);
			});
		}

		var url = elem.webkitRelativePath;

		ID3.loadTags(url, function() { //song.elem.name
			var tags = ID3.getAllTags(url);

			if (tags && tags.TAL && tags.TP1 && tags.TT2 && tags.TYE) {
				var info = tags["TAL"].data + ", "
					+ tags["TP1"].data + ", "
					+ tags["TT2"].data + ", "
					+ tags["TYE"].data;
				var song = document.createElement("li");
				song.appendChild(document.createTextNode(info));
				song.addEventListener('click', function(e) {
					var song_info = $(this).text();
				});
				$( "#songs-ul" ).append(song);
			}
		},
		{tags: ["TAL", "TP1", "TT2", "TYE"]});

	});
});

function findSoundFiles(files) {
	var soundFiles = [];

	for (var i = 0; i < files.length; i++) {
		if (isAudio(files[i])) {
			soundFiles.push(files[i]);
		}
	}

	return soundFiles;
}

function isAudio(file) {
    return file.type.indexOf("audio") !== -1;
}

function isMp3(file) {
	return file.type.indexOf("mp3") !== -1;
}

//- send post request that has the path to the song
//http://www.sauronsoftware.it/projects/jave/manual.php?PHPSESSID=r6ctdckspp5nusoo4c3v9e42b6#10*/