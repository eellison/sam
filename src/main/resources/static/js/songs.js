var textInputA = $("#actor1");
var suggestionListA = $("#list1");
var buttonA = $("#button1");
buttonA.text("Hide");

var showSuggestionsA = true;
/*
	Bindings
*/
//When the client updates the text
textInputA.on('input', function(e) {
	$.post("/suggest", {line: textInputA.val()}, function(responseJSON) {
		suggestionListA.empty();

		var responseObject = JSON.parse(responseJSON);
		var suggestions = responseObject.suggestions;
		
		for (var i = 0; i < suggestions.length; i++) {
			var s = document.createElement("li");
			s.appendChild(document.createTextNode(suggestions[i]));
			s.addEventListener('click', function(e) {
				textInputA.val($(this).text());
				textInputA.focus();
			});

  			suggestionListA.append(s);
		}

		if (suggestions.length = 0) {
			buttonA.hide();
		} else {
			buttonA.show();
		}
	});
});

buttonA.on('click', function(e) {
	if (showSuggestionsA) {
		buttonA.text("Show");
		suggestionListA.hide();
	} else {
		buttonA.text("Hide");
		suggestionListA.show();
	}

	showSuggestionsA = !showSuggestionsA;
});

var textInputB = $("#actor2");
var suggestionListB = $("#list2");
var buttonB = $("#button2");
buttonB.text("Hide");

var showSuggestions = true;
/*
	Bindings
*/
//When the client updates the text
textInputB.on('input', function(e) {
	$.post("/suggest", {line: textInputB.val()}, function(responseJSON) {
		suggestionListB.empty();

		var responseObject = JSON.parse(responseJSON);
		var suggestions = responseObject.suggestions;
		
		for (var i = 0; i < suggestions.length; i++) {
			var s = document.createElement("li");
			s.appendChild(document.createTextNode(suggestions[i]));
			s.addEventListener('click', function(e) {
				textInputB.val($(this).text());
				textInputB.focus();
			});

  			suggestionListB.append(s);
		}

		if (suggestions.length = 0) {
			buttonB.hide();
		} else {
			buttonB.show();
		}
	});
});

buttonB.on('click', function(e) {
	if (showSuggestions) {
		buttonB.text("Show");
		suggestionListB.hide();
	} else {
		buttonB.text("Hide");
		suggestionListB.show();
	}

	showSuggestions = !showSuggestions;
});

var buttonC = $("#button3");

buttonC.on('click', function(e) {
	alert("Searching...");
	$.post("/search", {name1: textInputA.val(), name2: textInputB.val()}, function(responseJSON) {
		var responseObject = JSON.parse(responseJSON);

		if (!responseObject.hasOwnProperty("error")) {
			var element = document.getElementById("results");
			while (element.firstChild) {
    			element.removeChild(element.firstChild);
			}

			element.innerHTML = responseObject.html;
		} else {
			alert(responseObject.error);
		}
	});
});


