const app = {
	answered: ["intro"], // Tracks which Qs we've answered (for back navigation)
	suspects: [], // Holds Suspect objects (max of 5)
	count: 0, // Keeps count of which Suspect object we're on
// JSON basic structure:
	tip: {
		timestamp: "", 
		category: "",
		when: "",
		where: "",
		details: "",
		suspect_1: "",
		suspect_2: "",
		suspect_3: "",
		suspect_4: "",
		suspect_5: "",
	}
}

class Suspect {
	// gender: "",
	// weapons: "",
	// name: "",
	// aliases: "",
	// age: "",
	// skin: "",
	// height: "",
	// weight: "",
	// hair_length: "",
	// hair_type: "",
	// hair_color: "",
	// facial_hair: "",
	// marks: "",
	// eyes: "",
	// glasses: "",
	// location: "",
	// location_time: "",
	// children: "",
	// dogs: "",
	// gang: "",
	// drug_activity: "",
	// drug_type: "",
	// vehicle_make: "",
	// vehicle_model: "",
	// vehicle_type: "",
	// vehicle_color: "",
	// vehicle_age: "",
	// vehicle_marks: "",
	// vehicle_tag: ""
}

// Clear text field (if any) if question has been answered before
function resetTextAreas(q) {
	if (q.querySelector("textarea")) {
		q.querySelector("textarea").value = ""
	}
}

// Listen for clicks on all buttons EXCEPT "Submit" buttons
function addButtonListeners() {
	const buttons = document.querySelectorAll("button:not(.submit)")
	for (let i = 0, l = buttons.length; i < l; i++) { // For each button...
		buttons[i].addEventListener("click", e => { // if the button is clicked, do this:
			if (e.target.id == "back") previousQuestion() // if it's the "Back" button, go back
			else { // All other buttons
				e.preventDefault
				const q = e.target.parentNode
				handleSelection(e.target.value, q.id) // Send the answer choice to router.js
			}
		})
	}
}

// Listen for clicks on "Submit" buttons
function addSubmitListeners() {
	const buttons = document.querySelectorAll(".submit")
	for (let i = 0, l = buttons.length; i < l; i++) {
		buttons[i].addEventListener("click", e => {
			e.preventDefault
			const q = e.target.parentNode
			const textarea = q.querySelector("textarea")
			handleSelection(textarea.value.replace("\n", ""), q.id)
		})
	}
}

// Listen for user input in text areas
function addTextareaListeners() {
	const textareas = document.querySelectorAll("textarea")
	for (let i = 0, l = textareas.length; i < l; i++) {
		textareas[i].addEventListener("keyup", (e) => {
			const textarea = e.target
			const q = textarea.parentNode
			// Warn users when they're typing too much
			const max = textarea.getAttribute("maxlength")
			if (textarea.value.length > max - 3) textarea.style.color = "red"
			else textarea.style.color = "inherit"
			// Submit when user hits "Enter"
			if (e.key == "Enter") {
				handleSelection(textarea.value.replace("\n", ""), q.id)
			}
		})
	}
}

function toggleBackButton() {
	const back = document.querySelector("#back")
	// If we've answered more than one Q and we haven't submitted our tip yet:
	if (app.answered.length > 1 && app.answered[app.answered.length - 1] != "end") {
		back.classList.remove("hidden") // Show the Back button
	} else {
		back.classList.add("hidden")
	}
}

function nextQuestion(id) {
	// Slight delay between Qs to make it feel like the app is "thinking" (also lets user see which button they pressed)
	setTimeout(() => {
		const q = document.querySelector("#" + id) // Find next Q by id
		q.classList.remove("hidden") // Show it
		// If this question asks for user input:
		if (q.querySelector("textarea")) {
			const textarea = q.querySelector("textarea")
			textarea.focus() // Put cursor inside text field
		}
		document.querySelector("#" +app. answered[app.answered.length - 1]).classList.add("hidden")
		app.answered.push(id)
		resetTextAreas(q)
		toggleBackButton()
	}, 250) // quarter-second delay
}

function previousQuestion() {
	// If user adds a new suspect, but then goes back:
	if (
		( // If the person just answered one of these questions...
			app.answered[app.answered.length - 2] == "another_suspect" || app.answered[app.answered.length - 2] == "who" ||
			app.answered[app.answered.length - 2] == "tip"
			// and goes "back" from here:
		) && app.answered[app.answered.length - 1] == "gender" 
	) {
		app.suspects.pop() // then delete the most recently created Suspect object
		if (app.count > 0 ) app.count -= 1 // and lower the count
	}
	setTimeout(() => {
		document.querySelector("#" + app.answered.pop()).classList.add("hidden")
		const q = document.querySelector("#" + app. answered[app.answered.length - 1])
		q.classList.remove("hidden")
		toggleBackButton()
	}, 250)
}

function setGenderPronouns(gender) {
	const pronouns = {
		male: ["he", "his", "him"],
		female: ["she", "her", "her"],
		unknown: ["this suspect", "this suspect's", "this suspect"] // unknown
	}
	const pronouns_subject = document.querySelectorAll(".pronoun-subject")
	const pronouns_possessive = document.querySelectorAll(".pronoun-possessive")
	const pronouns_object = document.querySelectorAll(".pronoun-object")
	for (i = 0, l = pronouns_subject.length; i < l; i++) {
		pronouns_subject[i].innerText = pronouns[gender][0]
	}
	for (i = 0, l = pronouns_possessive.length; i < l; i++) {
		pronouns_possessive[i].innerText = pronouns[gender][1]
	}
	for (i = 0, l = pronouns_object.length; i < l; i++) {
		pronouns_object[i].innerText = pronouns[gender][2]
	}
}

function setSuspectOrdinal() {
	const ordinals = {
		1: "second",
		2: "third",
		3: "fourth",
		4: "fifth"
	}
	document.querySelector("#suspect-ordinal").innerText = ordinals[app.suspects.length]
}

// Update DOM to show ${possessive} name
function setName(name) {
	const names = document.querySelectorAll(".suspect-name")
	for (i = 0, l = names.length; i < l; i++) {
		names[i].innerText = name
	}
}



// Non-AJAX form submission
function submitForm(tip) {
	// construct an HTTP request
	var xhr = new XMLHttpRequest()
	xhr.open("POST", "http://127.0.0.1:5000/tip") // Dev only
	// xhr.open("POST", "./tip") // Production
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
	// send the collected data as JSON
	xhr.send(JSON.stringify(tip))
	xhr.onloadend = () => {
		console.log("Sent!")
	}
}

// Initialize
addButtonListeners()
addSubmitListeners()
addTextareaListeners()

window.onbeforeunload = e => {
	var dialogText = "Are you sure? Your answers will be lost. (Use the 'Back' button to return to a previous question.)"
	e.returnValue = dialogText;
	return dialogText;
}