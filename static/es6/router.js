function handleSelection(ans, question) {

	// Record the selected answer choice and route to the next question
	const router = {
		
		intro: ans => {
			if (ans == "emergency") nextQuestion("emergency")
			else nextQuestion("tip")
		},

		emergency: ans => {
			if (ans) window.location.href="tel:911" // Call 911 (this option only appears on mobile)
		},

		// Are you reporting drugs, some other crime, or a fugitive?
		tip: ans => {
			if (ans == "fugitive") {
				app.tip.category = "Fugitive"
				app.suspects[app.count] = new Suspect // create new Suspect object
				nextQuestion("gender") // Skip crime questions
			} 
			else if (ans == "drugs") {
				app.tip.category = "Narcotics"
				nextQuestion("who")
			}
			else nextQuestion("violent_crime")
		},


		// TYPE OF CRIME ------------------------

		// Was this a violent crime?
		violent_crime: ans => {
			if (ans == "assault") nextQuestion("robbery")
			else if (ans == "homicide") {
				app.tip.category = "Homicide"
				nextQuestion("when")
			}
			else nextQuestion("property_crime")
		},

		// Was property taken by force?
		robbery: ans => {
			if (ans) {
				app.tip.category = ans
				nextQuestion("when")
			}
			else nextQuestion("domestic_violence")
		},

		// Domestic violence?
		domestic_violence: ans => {
			app.tip.category = ans
			nextQuestion("when")
		},

		// Property crime?
		property_crime: ans => {
			if (ans == "stolen") nextQuestion("burglary")
			else if (ans == "damaged") nextQuestion("arson")
			else nextQuestion("economic_crime")
		},

		burglary: ans => {
			app.tip.category = ans
			nextQuestion("when")
		},

		arson: ans => {
			app.tip.category = ans
			nextQuestion("when")
		},

		// Was this an economic crime?
		economic_crime: ans => {
			if (ans) {
				app.tip.category = ans
				nextQuestion("when")
			} 
			else nextQuestion("sex_crime")
		},

		// Sex offense?
		sex_crime: ans => {
			if (ans) {
				app.tip.category = ans
				nextQuestion("when")
			} 
			else nextQuestion("hit_and_run")
		},

		// Hit and run?
		hit_and_run: ans => {
			if (ans) nextQuestion("fatalities") // and ask about DUI
			else nextQuestion("when")
		},

		// Fatalities?
		fatalities: ans => {
			if (ans) app.tip.category = "fatal hit and run"
			else app.tip.category = "hit and run"
			nextQuestion("dui") // Ask if driver was drinking
		},

		// Driver drunk or on drugs?
		dui: ans => {
			if (ans) app.tip.category = `${app.tip.crime.category} (DUI)`
			nextQuestion("when")
		},

		// When did the crime occur?
		when: ans => {
			if (ans)
				if (ans == "prompt") nextQuestion("when_prompt")
				else {
					ans = new Date().toISOString().slice(0, 10)
					app.tip.when = ans
				}
			nextQuestion("where")
		},

		when_prompt: ans => {
			if (ans) app.tip.when = ans
			nextQuestion("where")
		},

		// Where?
		where: ans => {
			if (ans) nextQuestion("where_prompt")
			else nextQuestion("who")
		},

		where_prompt: ans => {
			if (ans) app.tip.where = ans
			nextQuestion("who")
		},

		// Any other details?
		misc: ans => {
			if (ans) nextQuestion("misc_prompt")
			else nextQuestion("submit")
		},

		misc_prompt: ans => {
			if (ans) app.tip.details = ans
			nextQuestion("submit")
		},

// SUSPECT DETAILS ----------------------

		// Do you have any info about the suspect?
		who: ans => {
			if (ans) { // If yes:
				app.suspects[app.count] = new Suspect // create new Suspect object
				nextQuestion("gender") // ask about gender
			}
			else nextQuestion("misc") // Skip to misc details
		},

		// Male or female?
		gender: ans => {
			app.suspects[app.count].gender = ans
			setGenderPronouns(ans)
			setSuspectOrdinal() // "First suspect", "Second suspect", etc.
			if (app.tip.category == "Narcotics") nextQuestion("drug_activity")
			else nextQuestion("name")
		},

		// Narcotics suspects only
		drug_activity: ans => {
			app.suspects[app.count].drug_activity = ans
			nextQuestion("drug_type")
		},

		drug_type: ans => {
			if (ans == "prompt") nextQuestion("drug_type_prompt")
			else {
				app.suspects[app.count].drug_type = ans
				nextQuestion("name")
			}
		},

		drug_type_prompt: ans => {
			if (ans) {
				app.suspects[app.count].drug_type = ans
				nextQuestion("name")
			}
		},
		
		// Do you know suspect's name?
		name: ans => {
			if (ans) nextQuestion("name_prompt")
			else nextQuestion("alias") 
		},

		name_prompt: ans => {
			app.suspects[app.count].name = ans
			if (ans) setName(ans)
			nextQuestion("alias")
		},

		// Alias?
		alias: ans => {
			if (ans) nextQuestion("alias_prompt")
			else nextQuestion("age")
		},

		alias_prompt: ans => {
			app.suspects[app.count].aliases = ans
			nextQuestion("age")
		},

		// Age?
		age: ans => {
			app.suspects[app.count].age = ans
			nextQuestion("ethnicity")
		},

		
		// PHYSICAL APPEARANCE ------------------

		
		// Ethnicity?
		ethnicity: ans => {
			if (ans == "other") nextQuestion("ethnicity_other")
			else {
				app.suspects[app.count].ethnicity = ans
				nextQuestion("skin")
			}
		},

		ethnicity_other: ans => {
			if (ans == "prompt") nextQuestion("ethnicity_prompt")
			else {
				app.suspects[app.count].ethnicity = ans
				nextQuestion("skin")
			}
		},

		ethnicity_prompt: ans => {
			app.suspects[app.count].ethnicity = ans
			nextQuestion("skin")
		},

		// Skin tone?
		skin: ans => {
			app.suspects[app.count].skin = ans
			nextQuestion("height")
		},

		// Height?
		height: ans => {
			app.suspects[app.count].height = ans
			nextQuestion("weight")
		},

		// Weight?
		weight: ans => {
			app.suspects[app.count].weight = ans
			nextQuestion("hair")
		},

		// Hair?
		hair: ans => {
			if (ans == "yes") nextQuestion("hair_length")
			else if (ans == "no") {
				app.suspects[app.count].hair = "shaved or bald"
				if (app.suspects[app.count].gender == "male") nextQuestion("facial_hair")
				else nextQuestion("marks")
			}
			else nextQuestion("marks")
		},

		// Hair length?
		hair_length: ans => {
			app.suspects[app.count].hair = ans
			nextQuestion("hair_color")
		},

		// Hair color?
		hair_color: ans => {
			if (ans == "prompt") nextQuestion("hair_color_prompt")
			else {
				app.suspects[app.count].hair_color = ans
				nextQuestion("hair_type")
			}
		},

		hair_color_prompt: ans => {
			app.suspects[app.count].hair_color = ans
			nextQuestion("hair_type")
		},

		// Is the hair curly?
		hair_type: ans => {
			app.suspects[app.count].hair_type = ans
			if (app.suspects[app.count].gender == "male") nextQuestion("facial_hair")
			else nextQuestion("marks")
		},

		// Facial hair?
		facial_hair: ans => {
			app.suspects[app.count].facial_hair = ans
			nextQuestion("eyes")
		},

		// Eye color?
		eyes: ans => {
			if (ans == "other") nextQuestion("eyes_other")
			else {
				app.suspects[app.count].eyes = ans
				nextQuestion("glasses")
			}
		},
		eyes_other: ans => {
			app.suspects[app.count].eyes = ans
			nextQuestion("glasses")
		},

		// Glasses?
		glasses: ans => {
			app.suspects[app.count].glasses = ans
			nextQuestion("marks")
		},

		// Visible marks?
		marks: ans => {
			if (ans == "prompt") nextQuestion("marks_prompt")
			else nextQuestion("armed")
		},

		marks_prompt: ans => {
			app.suspects[app.count].marks = ans
			nextQuestion("armed")
		},

		// MISC PERSONAL DETAILS

		// Is suspect armed?
		armed: ans => {
			app.suspects[app.count].weapons = ans
			nextQuestion("gang_member")
		},

		// Gang member?
		gang_member: ans => {
			if (ans) nextQuestion("gang_name")
			else nextQuestion("suspect_location")
		},

		gang_name: ans => {
			if (ans == "prompt") nextQuestion("gang_name_prompt")
			else {
				app.suspects[app.count].gang = "unknown"
				nextQuestion("suspect_location")
			}
		},

		gang_name_prompt: ans => {
			app.suspects[app.count].gang = ans
			nextQuestion("suspect_location")
		},

		// Address?
		suspect_location: ans => {
			if (ans == "prompt") nextQuestion("suspect_location_prompt")
			else nextQuestion("social_media")
		},

		suspect_location_prompt: ans => {
			app.suspects[app.count].location = ans
			nextQuestion("suspect_location_time") // ask about dogs
		},

		// When is suspect usually there?
		suspect_location_time: ans => {
			app.suspects[app.count].location_time = ans
			nextQuestion("children")
		},
		
		// Dogs at this location?
		children: ans => {
			app.suspects[app.count].dogs = ans
			nextQuestion("dogs")
		},
		// Dogs at this location?
		dogs: ans => {
			app.suspects[app.count].dogs = ans
			nextQuestion("social_media")
		},

		// Social media?
		social_media: ans => {
			if (ans == "prompt") nextQuestion("social_media_prompt")
			else nextQuestion("vehicle")
		},

		social_media_prompt: ans => {
			app.suspects[app.count].social_media = ans
			nextQuestion("vehicle")
		},

		// Suspect's vehicle --------------------

		// Know anything about it?
		vehicle: ans => {
			if (ans) nextQuestion("vehicle_make")
			else nextQuestion("another_suspect")
		},

		// Make?
		vehicle_make: ans => {
			if (ans == "prompt") nextQuestion("vehicle_make_select")
			else nextQuestion("vehicle_type")
		},

		// Drill down to select a make
		vehicle_make_select: ans => {
			if (ans == "prompt") nextQuestion("vehicle_make_prompt")
			else nextQuestion(ans)
		},

		// Select make from submenu
		vehicle_make_1: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_2: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_3: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_4: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_5: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_6: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},

		// Old or rare make?
		vehicle_make_prompt: ans => {
			app.suspects[app.count].vehicle_make = ans
			nextQuestion("vehicle_model")
		},

		// Model?
		vehicle_model: ans => {
			if (ans == "prompt") nextQuestion("vehicle_model_prompt")
			else nextQuestion("vehicle_type")
		},
		vehicle_model_prompt: ans => {
			app.suspects[app.count].vehicle_model = ans
			nextQuestion("vehicle_age")
		},

		// Type?
		vehicle_type: ans => {
			app.suspects[app.count].vehicle_type = ans
			nextQuestion("vehicle_age")
		},

		// Vehicle age?
		vehicle_age: ans => {
			app.suspects[app.count].vehicle_age = ans
			nextQuestion("vehicle_color")
		},

		// Color?
		vehicle_color: ans => {
			if (ans == "other") nextQuestion("vehicle_color_other")
			else {
				app.suspects[app.count].vehicle_color = ans
				nextQuestion("vehicle_marks")
			} 
		},
		vehicle_color_other: ans => {
			if (ans == "prompt") nextQuestion("vehicle_color_prompt")
			else {
				app.suspects[app.count].vehicle_color = ans
				nextQuestion("vehicle_marks")
			}
		},
		vehicle_color_prompt: ans => {
			app.suspects[app.count].vehicle_color = ans
			nextQuestion("vehicle_marks")
		},

		// Vehicle marks?
		vehicle_marks: ans => {
			if (ans == "prompt") nextQuestion("vehicle_marks_prompt")
			else nextQuestion("vehicle_tag")
		},
		vehicle_marks_prompt: ans => {
			app.suspects[app.count].vehicle_marks = ans
			nextQuestion("vehicle_tag")
		},
		
		// Vehicle tag?
		vehicle_tag: ans => {
			if (ans == "prompt") nextQuestion("vehicle_tag_prompt")
			else nextQuestion("another_suspect")
		},
		vehicle_tag_prompt: ans => {
			app.suspects[app.count].vehicle_tag = ans
			// If user has reported less than 5 suspects, ask if there are more
			if (app.suspects.length < 5) nextQuestion("another_suspect")
			else nextQuestion("misc")
		},

		// Is there another suspect?
		another_suspect: ans => {
			if (app.suspects.length > 0) parseSuspect(app.suspects[app.count]) // Parse object into readable paragraph
			if (ans) {
				app.count += 1
				app.suspects[app.count] = new Suspect // create new Suspect object
				nextQuestion("gender")
			} 
			else nextQuestion("misc")
		},

		// Ready to submit?
		submit: ans => {
			if (ans) {
				const today = new Date()
				const date =
					today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
				const time =
					today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
				const timestamp = date + " " + time
				app.tip.timestamp = timestamp
				console.log(app.tip)
				submitForm(app.tip) // Send data to backend
				nextQuestion("end")
			}
		},

		// Done. Now what?
		end: ans => {
			if (ans == "new") {
				// Reset app object
				app = { answered: ["end"], suspects: [], count: 0, tip: { timestamp: "", category: "", when: "", where: "", details: "", suspect_1: "", suspect_2: "", suspect_3: "",suspect_4: "", suspect_5: "" }}
				nextQuestion("tip")
			}
			else window.location.href="http://www.miami-police.org"
		}
	}

	// console.log("Question: " + question + ". Answer: " + ans)
	return router[question](ans)
}