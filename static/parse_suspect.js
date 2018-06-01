// Concatenate raw suspect data into complete sentences
function parseSuspect(s) { // s = suspect object 
    let summary = ""
	let pronoun = "Suspect" 
	let possessive = "Suspect's" 
	if (s.gender == "male") { 
		pronoun = "He" 
		possessive = "His" 
	} else if (s.gender == "female") { 
		pronoun = "She" 
		possessive = "Her" 
	}
	if (s.skin || s.age || s.gender || s.ethnicity) { // If any of these questions were answered...
        summary += "Suspect is a"
        // If we know the skin color:
        if (s.skin) summary += ` ${s.skin}-skinned` // e.g. light-skinned
        // If we know the age:
        if (s.age) summary += ` ${s.age}` // e.g. adult
        // If we know the gender:
        if (s.gender != "unknown") { summary += ` ${s.gender}` }  // e.g. male
        else { summary += " individual (gender unknown)" }
        // If we know the ethnicity:
		if (s.ethnicity) summary += ` of ${s.ethnicity} descent` // e.g. of Asian descent
		summary += "." // End first sentence
	}
	if (s.height || s.weight) { // If any of these questions were answered...
        summary += ` ${pronoun} is`
        // If we know the height:
		if (s.height) {
            if (s.height != "average") summary += ` ${s.height}` // e.g. short
            else summary += " average height" 
		}
        if (s.height && s.weight) summary += " and" // and
        // If we know the weight:
		if (s.weight) {
            if (s.weight != "average") summary += ` ${s.weight}`
            else summary += " average weight" // e.g. thin
		}
		summary += "."
	}
	if (s.hair_length) { // If this questions was answered...
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
		if (s.vehicle_marks) summary += ` The vehicle has the following features: ${s.vehicle_marks}.`
		if (s.vehicle_tag) summary += ` Its tag number is: ${s.vehicle_tag}.`
	}
	// Clean up grammar
	summary = summary.replace(" a a", " an a").replace(" a e", " an e").replace(" a i", " an i").replace(" a o", " an o").replace(" a u", " a(n) u").replace(" a A", " an A").replace(" a E", " an E").replace(" a I", " an I").replace(" a O", " an O").replace(" a U", " a(n) U")
	// Save to appropriate key
	if (suspect.count == 1)	tip.suspect_1 = summary
	else if (suspect.count == 2) tip.suspect_2 = summary
	else if (suspect.count == 3) tip.suspect_3 = summary
	else if (suspect.count == 4) tip.suspect_4 = summary
	else tip.suspect_5 = summary
}