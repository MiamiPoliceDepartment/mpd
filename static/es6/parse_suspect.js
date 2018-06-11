// Concatenate raw suspect data into complete sentences
function parseSuspect(s) { // s = suspect object 
    let summary = ""
	let he_or_she = "Suspect" 
	let his_or_her = "Suspect's" 
	if (s.gender == "male") { 
		he_or_she = "He" 
		his_or_her = "His" 
	} else if (s.gender == "female") { 
		he_or_she = "She" 
		his_or_her = "Her" 
	}
	// If this is a drug-related tip:
	if (s.drug_activity) {
		summary += "Suspect is allegedly involved in"  
		if (s.drug_type) summary += ` ${s.drug_type}` // e.g. cocaine
		else summary += " drug"
		summary += ` ${s.drug_activity}. ` // e.g. possession, sales, trafficking
	}
	 // If we have any basic details about suspect's appearance:
	if (s.skin || s.age || s.gender || s.ethnicity) {
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
	if (s.height || s.weight) {
        summary += ` ${he_or_she} is`
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
	// If we know about the suspect's hair:
	if (s.hair_length) {
		if (s.hair_length == "shaved or bald") summary += ` ${his_or_her} head is shaved or bald.`
		else summary += ` ${he_or_she} has ${s.hair_length}, ${s.hair_type}, ${s.hair_color} hair.`
	}
	// If we know about suspect's facial hair (men only):
	if (s.facial_hair) { 
		if (s.facial_hair == "clean-shaven") summary += ` ${his_or_her} face is ${s.facial_hair}.`
		else summary += ` ${he_or_she} has ${s.facial_hair}.`
	}
	// If we have info about suspect's eyes:
	if (s.eyes || s.glasses) {
		summary += ` ${he_or_she}`
		if (s.eyes) summary += ` has ${s.eyes} eyes`
		if (s.eyes && s.glasses) summary += " and" // and
		if (s.glasses) summary += " wears glasses" 
		summary += "."
	}
	if (s.marks) summary += ` ${he_or_she} has the following identifying marks: ${s.marks}.` 
	// If we know about suspect's legal name:
	if (s.name) summary += ` ${his_or_her} legal name is: ${s.name}.`
	// If suspect has aliases:
	if (s.aliases) summary += ` ${he_or_she} uses the following alias(es): ${s.aliases}.`
	// If suspect is a gang member:
	if (s.gang == "unknown") summary += ` ${he_or_she} is a gang member.`
	else if (s.gang) summary += ` ${his_or_her} gang affiliation is: ${s.gang}.`
	// If suspect is armed:
	if (s.weapons) summary += ` ${he_or_she} is armed with a ${s.weapons}.`
	if (s.location) {
		summary += ` ${he_or_she} may be found at: ${s.location}.`
		if (s.location_time) summary += ` ${he_or_she} is usually there between ${s.location_time}.`
		if (s.children && s.dogs) summary += " There are children and dogs at this location."
		else if (s.children) summary += " There are children at this location."
		else if (s.dogs) summary += " There are dogs at this location."
	}
	if (s.social_media) summary += ` ${his_or_her} social media info is: ${s.social_media}.`	
	if (s.vehicle_make || s.vehicle_type) {
		summary += `  ${he_or_she} drives a`
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
	summary = summary.replace(" a a", " an a").replace(" a e", " an e").replace(" a i", " an i").replace(" a o", " an o").replace(" a u", " a(n) u").replace(" a A", " an A").replace(" a E", " an E").replace(" a I", " an I").replace(" a O", " an O").replace(" a U", " a(n) U").replace("..", ".")
	// Save to appropriate key
	if (app.count == 0) app.tip.suspect_1 = summary
	else if (app.count == 1) app.tip.suspect_2 = summary
	else if (app.count == 2) app.tip.suspect_3 = summary
	else if (app.count == 3) app.tip.suspect_4 = summary
	else app.tip.suspect_5 = summary
}