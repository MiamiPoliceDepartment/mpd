let answered = ["intro"] // Holds breadcrumbs for back navigation
// let suspect.count = 1

// JSON basic structure:
let tip = {
	timestamp: "", 
	category: "",
	when: "",
	where: "",
	misc: "",
	suspect_1: "",
	suspect_2: "",
	suspect_3: "",
	suspect_4: "",
	suspect_5: "",
}

let suspect = {
	count: 1,
	gender: "",
	weapons: "",
	name: "",
	aliases: "",
	age: "",
	skin: "",
	height: "",
	weight: "",
	build: "",
	hair_length: "",
	hair_type: "",
	hair_color: "",
	facial_hair: "",
	marks: "",
	eyes: "",
	glasses: "",
	location: "",
	dogs: "",
	gang: "",
	vehicle_make: "",
	vehicle_model: "",
	vehicle_type: "",
	vehicle_color: "",
	vehicle_age: "",
	vehicle_marks: "",
	vehicle_tag: ""
}

// Clear and hide open text areas
function resetTextAreas(q) {
	if (q.querySelector("textarea")) {
		q.querySelector("textarea").value = ""
	}
}
// Reset any pressed buttons
function resetSelections(q) {
	if (q.querySelector("button.pressed") != null) {
		q.querySelector("button.pressed").classList.remove("pressed")
	}
}
// Add event listeners to buttons
function addButtonListeners() {
	const buttons = document.querySelectorAll("button")
	for (let i = 0, l = buttons.length; i < l; i++) {
		buttons[i].addEventListener("click", e => {
			if (e.target.id == "back") previousQuestion() // "Back" has special behavior
			else { // All other buttons
				e.preventDefault
				const q = e.target.parentNode
				e.target.classList.add("pressed") // Add "pressed" class to current selection
				console.log(e.target.value)
				handleSelection(e.target.value, q.id) // Send the answer choice to router.js
			}
		})
	}
}

function addTextareaListeners() {
	const textareas = document.querySelectorAll("textarea")
	for (let i = 0, l = textareas.length; i < l; i++) {
		textareas[i].addEventListener("keyup", (e) => {
			// Warn users when they're typing too much
			const textarea = e.target
			const max = textarea.getAttribute("maxlength")
			if (textarea.value.length > max - 3) textarea.style.color = "red"
			else textarea.style.color = "inherit"
			// Submit when user hits "Enter"
			if (e.key == "Enter") {
				const q = textarea.parentNode
				handleSelection(textarea.value.replace("\n", ""), q.id)
			}
		})
	}
}

function toggleBackButton() {
	const back = document.querySelector("#back")
	if (answered.length > 1) {
		back.classList.remove("hidden")
	} else {
		back.classList.add("hidden")
	}
}

function nextQuestion(id) {
	// console.log(id)
	setTimeout(() => {
		const q = document.querySelector("#" + id)
		resetSelections(q) // Remove any buttons previously pressed
		q.classList.remove("hidden")
		if (q.querySelector("textarea")) {
			const textarea = q.querySelector("textarea")
			textarea.focus()
		}
		document.querySelector("#" + answered[answered.length - 1]).classList.add("hidden")
		answered.push(id)
		resetTextAreas(q)
		toggleBackButton()
	}, 250) // Slight delay for better UX
}

function previousQuestion() {
	// Adjust suspect.count if user goes back to previous suspect
	if (
		answered[answered.length - 2] == "another_suspect" &&
		answered[answered.length - 1] == "gender" && 
		suspect.count > 1
	) {
		suspect.count -= 1
	}
	// console.log(answered, suspect.count)
	setTimeout(() => {
		document.querySelector("#" + answered.pop()).classList.add("hidden")
		const q = document.querySelector("#" + answered[answered.length - 1])
		q.classList.remove("hidden")
		resetSelections(q)
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
	document.querySelector("#suspect-ordinal").innerText = ordinals[suspect.count]
}

// Update DOM to show suspect's name
function setName(name) {
	const names = document.querySelectorAll(".suspect-name")
	for (i = 0, l = names.length; i < l; i++) {
		names[i].innerText = name
	}
}

// Concatenate raw suspect data into complete sentences
function parseSuspect(s) {
	let summary = "Suspect is a"
	if (s.skin) { summary += ` ${s.skin}-skinned` } // light/medium/dark-skinned
	if (s.age) { summary += ` ${s.age}` }
	if (s.gender) { summary += ` ${s.gender}` } else { summary += " individual of unknown gender" }  // male/female/person
	if (s.height || s.weight) { 
		summary += " of" // of
		if (s.height) { summary += ` ${s.height} height` } // below-avg/avg/above-avg height
		if (s.height && s.weight) { summary += " and" } // and
		if (s.weight) { summary += ` ${s.weight} weight` } // below-avg/avg/above-avg weight
	}
	summary += "."
	if (s.hair_length) { 
		if (s.hair_length == "shaved or bald") {
			summary += ` Suspect's head is ${s.alias}.`
		} else {
			summary += ` Suspect has ${s.hair_length}, ${s.hair_type}, ${s.hair_color} hair.`
		}
	}
	if (s.facial_hair) { 
		if(s.facial_hair == "clean-shaven") {
			summary += ` Suspect's face is ${s.facial_hair}.`
		} else {
			summary += ` Suspect's has ${s.facial_hair}.`
		}
	}
	if (s.name) { summary += ` Suspect's legal name is believed to be: ${s.name}.`}
	if (s.aliases) { summary += ` Suspect uses the following alias(es): ${s.alias}.`}
	if (s.weapons) { summary += ` Suspect is armed with a ${s.weapons}.`}
	if (s.glasses) { summary += " Suspect wears glasses." }
	if (s.marks) { summary += ` Suspect has the following identifying marks: ${s.marks}.` }
	if (s.location) {
		summary += ` Suspect may be located at: ${s.location}.`
		if (s.dogs) { summary += " There are dogs at this location." }
	}
	// Save to appropriate key
	if (suspect.count == 1)	{
		tip["suspect_1"] = summary
	} else if (suspect.count == 2) {
		tip["suspect_2"] = summary
	} else if (suspect.count == 3) {
		tip["suspect_3"] = summary
	} else if (suspect.count == 4) {
		tip["suspect_4"] = summary
	} else {
		tip["suspect_5"] = summary
	}
}

// Non-AJAX form submission
function submitForm(tip) {
	// construct an HTTP request
	var xhr = new XMLHttpRequest()
	// xhr.open("POST", "http://127.0.0.1:5000/tip") // Dev only
	xhr.open("POST", "./tip") // Production
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")

	// send the collected data as JSON
	xhr.send(JSON.stringify(tip))

	xhr.onloadend = () => {
		console.log("Sent!")
	}
}

// Initialize
addButtonListeners()
addTextareaListeners()

window.onbeforeunload = e => {
	var dialogText = "Are you sure? Your answers will be lost. (Use the arrow button to return to a previous question.)"
	e.returnValue = dialogText;
	return dialogText;
}