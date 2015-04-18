$(".form-group #directory-select").change(function() {
	var soundFiles = findSoundFiles($( ".form-group #directory-select" )[0].files);

	console.log(soundFiles);

	soundFiles.forEach(function(elem) {
		ID3.loadTags(elem.webkitRelativePath, function() {
			var tags = ID3.getAllTags(elem.webkitRelativePath);
			console.log(tags);
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

//- send post request that has the path to the song
//http://www.sauronsoftware.it/projects/jave/manual.php?PHPSESSID=r6ctdckspp5nusoo4c3v9e42b6#10