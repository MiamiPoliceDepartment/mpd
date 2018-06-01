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
				tip.category = "Fugitive"
				nextQuestion("gender") // Skip crime questions
			} 
			else if (ans == "drugs") {
				tip.category = "Narcotics"
				nextQuestion("who")
			}
			else nextQuestion("violent_crime")
		},


		// TYPE OF CRIME ------------------------

		// Was this a violent crime?
		violent_crime: ans => {
			if (ans == "assault") nextQuestion("robbery")
			else if (ans == "homicide") {
				tip.category = "Homicide"
				nextQuestion("when")
			}
			else nextQuestion("property_crime")
		},

		// Was property taken by force?
		robbery: ans => {
			if (ans) {
				tip.category = ans
				nextQuestion("when")
			}
			else nextQuestion("domestic_violence")
		},

		// Domestic violence?
		domestic_violence: ans => {
			tip.category = ans
			nextQuestion("when")
		},

		// Property crime?
		property_crime: ans => {
			if (ans == "stolen") nextQuestion("burglary")
			else if (ans == "damaged") nextQuestion("arson")
			else nextQuestion("economic_crime")
		},

		burglary: ans => {
			tip.category = ans
			nextQuestion("when")
		},

		arson: ans => {
			tip.category = ans
			nextQuestion("when")
		},

		// Was this an economic crime?
		economic_crime: ans => {
			if (ans) {
				tip.category = ans
				nextQuestion("when")
			} 
			else nextQuestion("sex_crime")
		},

		// Sex offense?
		sex_crime: ans => {
			if (ans) {
				tip.category = ans
				nextQuestion("when")
			} 
			else nextQuestion("hit_and_run")
		},

		// Hit and run?
		hit_and_run: ans => {
			if (ans) nextQuestion("fatalities") // and ask about DUI
			else nextQuestion("narcotics")
		},

		// Fatalities?
		fatalities: ans => {
			if (ans) tip.category = "fatal hit and run"
			else tip.category = "hit and run"
			nextQuestion("dui") // Ask if driver was drinking
		},

		// Driver drunk or on drugs?
		dui: ans => {
			if (ans) tip.category = `${tip.crime.category} (DUI)`
			nextQuestion("when")
		},

		// When did the crime occur?
		when: ans => {
			if (ans)
				if (ans == "prompt") nextQuestion("when_prompt")
				else {
					ans = new Date().toISOString().slice(0, 10)
					tip.when = ans
				}
			nextQuestion("where")
		},

		when_prompt: ans => {
			if (ans) tip.when = ans
			nextQuestion("where")
		},

		// Where?
		where: ans => {
			if (ans) nextQuestion("where_prompt")
			else nextQuestion("who")
		},

		where_prompt: ans => {
			if (ans) tip.where = ans
			nextQuestion("who")
		},

		// Anything else?
		misc: ans => {
			if (ans) nextQuestion("misc_prompt")
			else nextQuestion("submit")
		},

		misc_prompt: ans => {
			if (ans) tip.misc = ans
			nextQuestion("submit")
		},

// SUSPECT DETAILS ----------------------

		// Do you have any info about the suspect?
		who: ans => {
			if (ans) nextQuestion("gender")
			else nextQuestion("vehicle") // Skip to vehicle questions
		},

		// Male or female?
		gender: ans => {
			suspect.gender = ans
			setGenderPronouns(ans)
			setSuspectOrdinal() // "First suspect", "Second suspect", etc.
			if (tip.category == "Narcotics") nextQuestion("drug_activity")
			else nextQuestion("name")
		},

		// Narcotics suspects only
		drug_activity: ans => {
			suspect.drug_activity = ans
			nextQuestion("drug_type")
		},

		drug_type: ans => {
			if (ans == "prompt") nextQuestion("drug_type_prompt")
			else {
				suspect.drug_type = ans
				nextQuestion("name")
			}
		},

		drug_type_prompt: ans => {
			if (ans) {
				suspect.drug_type = ans
				nextQuestion("name")
			}
		},
		
		// Do you know suspect's name?
		name: ans => {
			if (ans) nextQuestion("name_prompt")
			else nextQuestion("alias") 
		},

		name_prompt: ans => {
			suspect.name += ans
			if (ans) setName(ans)
			nextQuestion("alias")
		},

		// Alias?
		alias: ans => {
			if (ans) nextQuestion("alias_prompt")
			else nextQuestion("age")
		},

		alias_prompt: ans => {
			suspect.aliases = ans
			nextQuestion("age")
		},

		// Age?
		age: ans => {
			suspect.age = ans
			nextQuestion("ethnicity")
		},

		
		// PHYSICAL APPEARANCE ------------------

		
		// Ethnicity?
		ethnicity: ans => {
			if (ans == "other") nextQuestion("ethnicity_other")
			else {
				suspect.ethnicity = ans
				nextQuestion("skin")
			}
		},

		ethnicity_other: ans => {
			if (ans == "prompt") nextQuestion("ethnicity_prompt")
			else {
				suspect.ethnicity = ans
				nextQuestion("skin")
			}
		},

		ethnicity_prompt: ans => {
			suspect.ethnicity = ans
			nextQuestion("skin")
		},

		// Skin tone?
		skin: ans => {
			suspect.skin = ans
			nextQuestion("height")
		},

		// Height?
		height: ans => {
			suspect.height = ans
			nextQuestion("weight")
		},

		// Weight?
		weight: ans => {
			suspect.weight = ans
			nextQuestion("hair")
		},

		// Hair?
		hair: ans => {
			if (ans == "yes") nextQuestion("hair_length")
			else if (ans == "no") {
				suspect.hair = "shaved or bald"
				if (suspect.gender == "male") nextQuestion("facial_hair")
				else nextQuestion("marks")
			}
			else nextQuestion("marks")
		},

		// Hair length?
		hair_length: ans => {
			suspect.hair = ans
			nextQuestion("hair_color")
		},

		// Hair color?
		hair_color: ans => {
			if (ans == "prompt") nextQuestion("hair_color_prompt")
			else {
				suspect.hair_color = ans
				nextQuestion("hair_type")
			}
		},

		hair_color_prompt: ans => {
			suspect.hair_color = ans
			nextQuestion("hair_type")
		},

		// Is the hair curly?
		hair_type: ans => {
			suspect.hair_type = ans
			if (suspect.gender == "male") nextQuestion("facial_hair")
			else nextQuestion("marks")
		},

		// Facial hair?
		facial_hair: ans => {
			suspect.facial_hair = ans
			nextQuestion("eyes")
		},

		// Eye color?
		eyes: ans => {
			if (ans == "other") nextQuestion("eyes_other")
			else {
				suspect.eyes = ans
				nextQuestion("glasses")
			}
		},
		eyes_other: ans => {
			suspect.eyes = ans
			nextQuestion("glasses")
		},

		// Glasses?
		glasses: ans => {
			suspect.glasses = ans
			nextQuestion("marks")
		},

		// Visible marks?
		marks: ans => {
			if (ans == "prompt") nextQuestion("marks_prompt")
			else nextQuestion("armed")
		},

		marks_prompt: ans => {
			suspect.marks = ans
			nextQuestion("armed")
		},

		// MISC PERSONAL DETAILS


		// Is suspect armed?
		armed: ans => {
			suspect.weapons = ans
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
				suspect.gang = "unknown"
				nextQuestion("suspect_location")
			}
		},

		gang_name_prompt: ans => {
			suspect.gang = ans
			nextQuestion("suspect_location")
		},

		// Address?
		suspect_location: ans => {
			suspect.location = ans
			if (ans == "prompt") nextQuestion("suspect_location_prompt")
			else nextQuestion("vehicle")
		},

		suspect_location_prompt: ans => {
			suspect.location = ans
			nextQuestion("suspect_location_time") // ask about dogs
		},

		// When is suspect usually there?
		suspect_location_time: ans => {
			suspect.location_time = ans
			nextQuestion("children")
		},
		
		// Dogs at this location?
		children: ans => {
			suspect.dogs = ans
			nextQuestion("dogs")
		},
		// Dogs at this location?
		dogs: ans => {
			suspect.dogs = ans
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
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_2: ans => {
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_3: ans => {
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_4: ans => {
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_5: ans => {
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},
		vehicle_make_6: ans => {
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},

		// Old or rare make?
		vehicle_make_prompt: ans => {
			suspect.vehicle_make = ans
			nextQuestion("vehicle_model")
		},

		// Model?
		vehicle_model: ans => {
			if (ans == "prompt") nextQuestion("vehicle_model_prompt")
			else nextQuestion("vehicle_type")
		},
		vehicle_model_prompt: ans => {
			suspect.vehicle_model = ans
			nextQuestion("vehicle_age")
		},

		// Type?
		vehicle_type: ans => {
			suspect.vehicle_type = ans
			nextQuestion("vehicle_age")
		},

		// Vehicle age?
		vehicle_age: ans => {
			suspect.vehicle_age = ans
			nextQuestion("vehicle_color")
		},

		// Color?
		vehicle_color: ans => {
			if (ans == "other") nextQuestion("vehicle_color_other")
			else {
				suspect.vehicle_color = ans
				nextQuestion("vehicle_marks")
			} 
		},
		vehicle_color_other: ans => {
			if (ans == "prompt") nextQuestion("vehicle_color_prompt")
			else {
				suspect.vehicle_color = ans
				nextQuestion("vehicle_marks")
			}
		},
		vehicle_color_prompt: ans => {
			suspect.vehicle_color = ans
			nextQuestion("vehicle_marks")
		},

		// Vehicle marks?
		vehicle_marks: ans => {
			if (ans == "prompt") nextQuestion("vehicle_marks_prompt")
			else nextQuestion("vehicle_tag")
		},
		vehicle_marks_prompt: ans => {
			suspect.vehicle_marks = ans
			nextQuestion("vehicle_tag")
		},
		
		// Vehicle tag?
		vehicle_tag: ans => {
			if (ans == "prompt") nextQuestion("vehicle_tag_prompt")
			else nextQuestion("another_suspect")
		},
		vehicle_tag_prompt: ans => {
			suspect.vehicle_tag = ans
			// If user has reported less than 5 suspects, ask if there are more
			if (suspect.count < 5) nextQuestion("another_suspect")
			else nextQuestion("misc")
		},

		// Is there another suspect?
		another_suspect: ans => {
			parseSuspect(suspect)
			if (ans) {
				suspect.count += 1
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
				tip.timestamp = timestamp
				console.log(tip)
				// submitForm(tip) // Send data to backend
				nextQuestion("end")
			}
		}
	}

	// console.log("Question: " + question + ". Answer: " + ans)
	return router[question](ans)
}