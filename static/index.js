let answered = ["intro"] // Holds breadcrumbs for back navigation

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
	hair_length: "",
	hair_type: "",
	hair_color: "",
	facial_hair: "",
	marks: "",
	eyes: "",
	glasses: "",
	location: "",
	location_time: "",
	children: "",
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

// Listen for clicks on all buttons except "Submit" buttons
function addButtonListeners() {
	const buttons = document.querySelectorAll("button:not(.submit)")
	for (let i = 0, l = buttons.length; i < l; i++) {
		buttons[i].addEventListener("click", e => {
			if (e.target.id == "back") previousQuestion() // "Back" has special behavior
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
	if (answered.length > 1 && answered[answered.length - 1] != "end") {
		back.classList.remove("hidden")
	} else {
		back.classList.add("hidden")
	}
}

function nextQuestion(id) {
	setTimeout(() => {
		const q = document.querySelector("#" + id)
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
	setTimeout(() => {
		document.querySelector("#" + answered.pop()).classList.add("hidden")
		const q = document.querySelector("#" + answered[answered.length - 1])
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
	document.querySelector("#suspect-ordinal").innerText = ordinals[suspect.count]
}

// Update DOM to show ${possessive} name
function setName(name) {
	const names = document.querySelectorAll(".suspect-name")
	for (i = 0, l = names.length; i < l; i++) {
		names[i].innerText = name
	}
}

// Concatenate raw suspect data into complete sentences
function parseSuspect(s) {
	console.log("Works!")
	let pronoun = "Suspect" 
	let possessive = "Suspect's" 
	if (s.gender == "male") { 
		pronoun = "He" 
		possessive = "His" 
	} else if (s.gender == "female") { 
		pronoun = "She" 
		possessive = "Her" 
	}
	let summary = ""
	if (s.skin || s.age || s.gender || s.ethnicity) {
		summary += "Suspect is a"
		if (s.skin) summary += ` ${s.skin}-skinned` // e.g. light-skinned
		if (s.age) summary += ` ${s.age}` // e.g. adult
		if (s.gender != "unknown") { summary += ` ${s.gender}` } else { summary += " individual (gender unknown)" } // eg. male
		if (s.ethnicity) summary += ` of ${s.ethnicity} descent` // e.g. of Asian descent
		summary += "." // End first sentence
	}
	if (s.height || s.weight) { 
		summary += ` ${pronoun} is`
		if (s.height) {
			if (s.height != "average") { summary += ` ${s.height}` } else { summary += " average height" } // e.g. short
		}
		if (s.height && s.weight) summary += " and" // and
		if (s.weight) {
			if (s.weight != "average") { summary += ` ${s.weight}` } else { summary += " average weight"} // e.g. thin
		}
		summary += "."
	}
	if (s.hair_length) { 
		if (s.hair_length == "shaved or bald") summary += ` ${possessive} head is shaved or bald.`
		else summary += ` ${pronoun} has ${s.hair_length}, ${s.hair_type}, ${s.hair_color} hair.`
	}
	if (s.facial_hair) { 
		if (s.facial_hair == "clean-shaven") summary += ` ${possessive} face is ${s.facial_hair}.`
		else summary += ` ${pronoun} has ${s.facial_hair}.`
	}
	if (s.name) summary += ` ${possessive} legal name is: ${s.name}.`
	if (s.aliases) summary += ` ${pronoun} uses the following alias(es): ${s.aliases}.`
	if (s.gang == "unknown") summary += ` ${pronoun} is a gang member.`
	else if (s.gang) summary += ` ${possessive} gang affiliation is: ${s.gang}.`
	if (s.weapons) summary += ` ${pronoun} is armed with a ${s.weapons}.`
	if (s.eyes || s.glasses) {
		summary += ` ${pronoun}`
		if (s.eyes) summary += ` has ${s.eyes} eyes`
		if (s.eyes && s.glasses) summary += " and" // and
		if (s.glasses) summary += " wears glasses" 
		summary += "."
	}
	if (s.marks) summary += ` ${pronoun} has the following identifying marks: ${s.marks}.` 
	if (s.location) {
		summary += ` ${pronoun} may be found at: ${s.location}.`
		if (s.location_time) summary += ` ${pronoun} is usually there between ${s.location_time}.`
		if (s.children && s.dogs) summary += " There are children and dogs at this location."
		else if (s.children) summary += " There are children at this location."
		else if (s.dogs) summary += " There are dogs at this location."
	}
	if (s.vehicle_make || s.vehicle_type) {
		summary += `  ${pronoun} drives a`
		if (s.vehicle_color) summary += ` ${s.vehicle_color}` // e.g. white
		if (s.vehicle_age) summary += ` ${s.vehicle_age}` // e.g. late-model
		if (s.vehicle_make) summary += ` ${s.vehicle_make}` // Ford
		if (s.vehicle_model) summary += ` ${s.vehicle_model}` // Mustang
		if (s.vehicle_type) summary += ` ${s.vehicle_type}` // coupe
		summary += "."
		if (s.vehicle_marks) summary += ` The vehicle has the following identifying marks: ${s.vehicle_marks}.`
		if (s.vehicle_tag) summary += ` Its tag number is: ${s.vehicle_tag}.`
	}
	// Clean up grammar
	summary = summary.replace(" a a", " an a").replace(" a e", " an e").replace(" a i", " an i").replace(" a o", " an o").replace(" a u", " a(n) u")
	summary = summary.replace(" a A", " an A").replace(" a E", " an E").replace(" a I", " an I").replace(" a O", " an O").replace(" a U", " a(n) U")
	// Save to appropriate key
	if (suspect.count == 1)	tip.suspect_1 = summary
	else if (suspect.count == 2) tip.suspect_2 = summary
	else if (suspect.count == 3) tip.suspect_3 = summary
	else if (suspect.count == 4) tip.suspect_4 = summary
	else tip.suspect_5 = summary
}

// Non-AJAX form submission
function submitForm(tip) {
	// construct an HTTP request
	var xhr = new XMLHttpRequest()
	// xhr.open("POST", "http://127.0.0.1:5000/tip") // Dev only
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