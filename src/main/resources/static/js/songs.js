$(".form-group #directory-select").change(function() {
	var soundFiles = findSoundFiles($( ".form-group #directory-select" )[0].files);
	
});

function endsWithIgnoreCase(str, suffix) {
    return str.toLowerCase().indexOf(suffix.toLowerCase(), str.length - suffix.length) !== -1;
}

function findSoundFiles(files) {
	var soundFiles = [];
	var acceptedTypes = [".mp3", ".wav"];

	for (var i = 0; i < files.length; i++) {
		for (var j = 0; j < acceptedTypes.length; j++) {
			if (endsWithIgnoreCase(files[i], acceptedTypes[j])) {
				soundFiles.push(files[i]);
				break;
			}
		}
	}

	return soundFiles;
}

