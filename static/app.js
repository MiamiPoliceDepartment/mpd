"use strict";

var app = {
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
    suspect_5: ""
  }
};

function Suspect() {
  this.gender = "";
  this.weapons = "";
  this.name = "";
  this.aliases = "";
  this.age = "";
  this.skin = "";
  this.height = "";
  this.weight = "";
  this.hair_length = "";
  this.hair_type = "";
  this.hair_color = "";
  this.facial_hair = "";
  this.marks = "";
  this.eyes = "";
  this.glasses = "";
  this.location = "";
  this.location_time = "";
  this.children = "";
  this.dogs = "";
  this.gang = "";
  this.social_media = "";
  this.drug_activity = "";
  this.drug_type = "";
  this.vehicle_make = "";
  this.vehicle_model = "";
  this.vehicle_type = "";
  this.vehicle_color = "";
  this.vehicle_age = "";
  this.vehicle_marks = "";
  this.vehicle_tag = "";
}

// Clear text field (if any) if question has been answered before
function resetTextAreas(q) {
  if (q.querySelector("textarea")) {
    q.querySelector("textarea").value = "";
  }
}

// Listen for clicks on all buttons EXCEPT "Submit" buttons
function addButtonListeners() {
  var buttons = document.querySelectorAll("button:not(.submit)");
  for (var _i = 0, _l = buttons.length; _i < _l; _i++) {
    // For each button...
    buttons[_i].addEventListener("click", function(e) {
      // if the button is clicked, do this:
      if (e.target.id == "back") previousQuestion();
      else {
        // if it's the "Back" button, go back
        // All other buttons
        e.preventDefault;
        var q = e.target.parentNode;
        handleSelection(e.target.value, q.id); // Send the answer choice to router.js
      }
    });
  }
}

// Listen for clicks on "Submit" buttons
function addSubmitListeners() {
  var buttons = document.querySelectorAll(".submit");
  for (var _i2 = 0, _l2 = buttons.length; _i2 < _l2; _i2++) {
    buttons[_i2].addEventListener("click", function(e) {
      e.preventDefault;
      var q = e.target.parentNode;
      var textarea = q.querySelector("textarea");
      handleSelection(scrubText(textarea.value), q.id);
    });
  }
}

// Listen for user input in text areas
function addTextareaListeners() {
  var textareas = document.querySelectorAll("textarea");
  for (var _i3 = 0, _l3 = textareas.length; _i3 < _l3; _i3++) {
    textareas[_i3].addEventListener("keyup", function(e) {
      var textarea = e.target;
      var q = textarea.parentNode;
      // Warn users when they're typing too much
      var max = textarea.getAttribute("maxlength");
      if (textarea.value.length > max - 3) textarea.style.color = "red";
      else textarea.style.color = "inherit";
      // Submit when user hits "Enter"
      if (e.key == "Enter") {
        handleSelection(scrubText(textarea.value), q.id);
      }
    });
  }
}

function scrubText(text) {
  // Remove everything alphanumeric characters, special characters, and reserved characters used for query URLs
  return text.replace(/\\n|[^\w\s.,!?;:\/@=&$%\-+*'()]/gi, "");
}

function toggleBackButton() {
  var back = document.querySelector("#back");
  // If we've answered more than one Q and we haven't submitted our tip yet:
  if (
    app.answered.length > 1 &&
    app.answered[app.answered.length - 1] != "end"
  ) {
    back.classList.remove("hidden"); // Show the Back button
  } else {
    back.classList.add("hidden");
  }
}

function nextQuestion(id) {
  // Slight delay between Qs to make it feel like the app is "thinking" (also lets user see which button they pressed)
  setTimeout(function() {
    var q = document.querySelector("#" + id); // Find next Q by id
    q.classList.remove("hidden"); // Show it
    // If this question asks for user input:
    if (q.querySelector("textarea")) {
      var textarea = q.querySelector("textarea");
      textarea.focus(); // Put cursor inside text field
    }
    document
      .querySelector("#" + app.answered[app.answered.length - 1])
      .classList.add("hidden");
    app.answered.push(id); // Add this Q to list of answered Qs
    resetTextAreas(q);
    toggleBackButton();
  }, 250); // quarter-second delay
}

function previousQuestion() {
  // If user adds a new suspect, but then goes back:
  if (
    // If the person just answered one of these questions...
    (app.answered[app.answered.length - 2] == "another_suspect" ||
      app.answered[app.answered.length - 2] == "who" ||
      app.answered[app.answered.length - 2] == "tip") &&
    // and goes "back" from here:
    app.answered[app.answered.length - 1] == "gender"
  ) {
    app.suspects.pop(); // then delete the most recently created Suspect object
    if (app.count > 0) app.count -= 1; // and lower the count
  }
  setTimeout(function() {
    document.querySelector("#" + app.answered.pop()).classList.add("hidden");
    var q = document.querySelector("#" + app.answered[app.answered.length - 1]);
    q.classList.remove("hidden");
    toggleBackButton();
  }, 250);
}

function setGenderPronouns(gender) {
  var pronouns = {
    male: ["he", "his", "him"],
    female: ["she", "her", "her"],
    unknown: ["this suspect", "this suspect's", "this suspect"] // unknown
  };
  var pronouns_subject = document.querySelectorAll(".pronoun-subject");
  var pronouns_possessive = document.querySelectorAll(".pronoun-possessive");
  var pronouns_object = document.querySelectorAll(".pronoun-object");
  for (var i = 0, l = pronouns_subject.length; i < l; i++) {
    pronouns_subject[i].innerText = pronouns[gender][0];
  }
  for (var i = 0, l = pronouns_possessive.length; i < l; i++) {
    pronouns_possessive[i].innerText = pronouns[gender][1];
  }
  for (var i = 0, l = pronouns_object.length; i < l; i++) {
    pronouns_object[i].innerText = pronouns[gender][2];
  }
}

function setSuspectOrdinal() {
  var ordinals = {
    1: "second",
    2: "third",
    3: "fourth",
    4: "fifth"
  };
  document.querySelector("#suspect-ordinal").innerText =
    ordinals[app.suspects.length];
}

// Update DOM to show suspect's name where applicable
function setName(name) {
  var names = document.querySelectorAll(".suspect-name");
  for (var i = 0, l = names.length; i < l; i++) {
    names[i].innerText = name; // Note: innerHTML is vulnerable to XSS!
  }
}

function handleSelection(ans, question) {
  // Record the selected answer choice and route to the next question
  var router = {
    intro: function intro(ans) {
      if (ans == "emergency") nextQuestion("emergency");
      else nextQuestion("tip");
    },

    emergency: function emergency(ans) {
      if (ans) window.location.href = "tel:911"; // Call 911 (this option only appears on mobile)
    },

    // Are you reporting drugs, some other crime, or a fugitive?
    tip: function tip(ans) {
      if (ans == "fugitive") {
        app.tip.category = "Fugitive";
        app.suspects[app.count] = new Suspect(); // create new Suspect object
        nextQuestion("gender"); // Skip crime questions
      } else if (ans == "drugs") {
        app.tip.category = "Narcotics";
        nextQuestion("who");
      } else nextQuestion("violent_crime");
    },

    // TYPE OF CRIME ------------------------

    // Was this a violent crime?
    violent_crime: function violent_crime(ans) {
      if (ans == "assault") nextQuestion("robbery");
      else if (ans) {
        if (ans == "homicide") app.tip.category = "Homicide";
        else app.tip.category = "Sexual Assault";
        nextQuestion("when");
      } else nextQuestion("property_crime");
    },

    // Was property taken by force?
    robbery: function robbery(ans) {
      if (ans) {
        app.tip.category = ans;
        nextQuestion("when");
      } else nextQuestion("domestic_violence");
    },

    // Domestic violence?
    domestic_violence: function domestic_violence(ans) {
      app.tip.category = ans;
      nextQuestion("when");
    },

    // Property crime?
    property_crime: function property_crime(ans) {
      if (ans == "stolen") nextQuestion("burglary");
      else if (ans == "damaged") nextQuestion("arson");
      else nextQuestion("economic_crime");
    },

    burglary: function burglary(ans) {
      app.tip.category = ans;
      nextQuestion("when");
    },

    arson: function arson(ans) {
      app.tip.category = ans;
      nextQuestion("when");
    },

    // Was this an economic crime?
    economic_crime: function economic_crime(ans) {
      if (ans) {
        app.tip.category = ans;
        nextQuestion("when");
      } else nextQuestion("sex_crime");
    },

    // Sex offense?
    sex_crime: function sex_crime(ans) {
      if (ans) {
        app.tip.category = ans;
        nextQuestion("when");
      } else nextQuestion("hit_and_run");
    },

    // Hit and run?
    hit_and_run: function hit_and_run(ans) {
      if (ans)
        nextQuestion("fatalities"); // and ask about DUI
      else nextQuestion("when");
    },

    // Fatalities?
    fatalities: function fatalities(ans) {
      if (ans) app.tip.category = "fatal hit and run";
      else app.tip.category = "hit and run";
      nextQuestion("dui"); // Ask if driver was drinking
    },

    // Driver drunk or on drugs?
    dui: function dui(ans) {
      if (ans) app.tip.category = app.tip.crime.category + " (DUI)";
      nextQuestion("when");
    },

    // When did the crime occur?
    when: function when(ans) {
      if (ans)
        if (ans == "prompt") nextQuestion("when_prompt");
        else {
          ans = new Date().toISOString().slice(0, 10);
          app.tip.when = ans;
          nextQuestion("where");
        }
      else nextQuestion("where");
    },

    when_prompt: function when_prompt(ans) {
      if (ans) app.tip.when = ans;
      nextQuestion("where");
    },

    // Where?
    where: function where(ans) {
      if (ans) nextQuestion("where_prompt");
      else nextQuestion("who");
    },

    where_prompt: function where_prompt(ans) {
      if (ans) app.tip.where = ans;
      nextQuestion("who");
    },

    // Any other details?
    misc: function misc(ans) {
      if (ans) nextQuestion("misc_prompt");
      else nextQuestion("submit");
    },

    misc_prompt: function misc_prompt(ans) {
      if (ans) app.tip.details = ans;
      nextQuestion("submit");
    },

    // SUSPECT DETAILS ----------------------

    // Do you have any info about the suspect?
    who: function who(ans) {
      if (ans) {
        // If yes:
        app.suspects[app.count] = new Suspect(); // create new Suspect object
        nextQuestion("gender"); // ask about gender
      } else nextQuestion("misc"); // Skip to misc details
    },

    // Male or female?
    gender: function gender(ans) {
      app.suspects[app.count].gender = ans;
      setGenderPronouns(ans);
      setSuspectOrdinal(); // "First suspect", "Second suspect", etc.
      if (app.tip.category == "Narcotics") nextQuestion("drug_activity");
      else nextQuestion("name");
    },

    // Narcotics suspects only
    drug_activity: function drug_activity(ans) {
      app.suspects[app.count].drug_activity = ans;
      nextQuestion("drug_type");
    },

    drug_type: function drug_type(ans) {
      if (ans == "prompt") nextQuestion("drug_type_prompt");
      else {
        app.suspects[app.count].drug_type = ans;
        nextQuestion("name");
      }
    },

    drug_type_prompt: function drug_type_prompt(ans) {
      if (ans) {
        app.suspects[app.count].drug_type = ans;
        nextQuestion("name");
      }
    },

    // Do you know suspect's name?
    name: function name(ans) {
      if (ans) nextQuestion("name_prompt");
      else nextQuestion("alias");
    },

    name_prompt: function name_prompt(ans) {
      app.suspects[app.count].name = ans;
      if (ans) setName(ans);
      nextQuestion("alias");
    },

    // Alias?
    alias: function alias(ans) {
      if (ans) nextQuestion("alias_prompt");
      else nextQuestion("age");
    },

    alias_prompt: function alias_prompt(ans) {
      app.suspects[app.count].aliases = ans;
      nextQuestion("age");
    },

    // Age?
    age: function age(ans) {
      app.suspects[app.count].age = ans;
      nextQuestion("ethnicity");
    },

    // PHYSICAL APPEARANCE ------------------

    // Ethnicity?
    ethnicity: function ethnicity(ans) {
      if (ans == "other") nextQuestion("ethnicity_other");
      else {
        app.suspects[app.count].ethnicity = ans;
        nextQuestion("skin");
      }
    },

    ethnicity_other: function ethnicity_other(ans) {
      if (ans == "prompt") nextQuestion("ethnicity_prompt");
      else {
        app.suspects[app.count].ethnicity = ans;
        nextQuestion("skin");
      }
    },

    ethnicity_prompt: function ethnicity_prompt(ans) {
      app.suspects[app.count].ethnicity = ans;
      nextQuestion("skin");
    },

    // Skin tone?
    skin: function skin(ans) {
      app.suspects[app.count].skin = ans;
      nextQuestion("height");
    },

    // Height?
    height: function height(ans) {
      app.suspects[app.count].height = ans;
      nextQuestion("weight");
    },

    // Weight?
    weight: function weight(ans) {
      app.suspects[app.count].weight = ans;
      nextQuestion("hair");
    },

    // Hair?
    hair: function hair(ans) {
      if (ans == "yes") nextQuestion("hair_length");
      else if (ans == "no") {
        app.suspects[app.count].hair = "shaved or bald";
        if (app.suspects[app.count].gender == "male")
          nextQuestion("facial_hair");
        else nextQuestion("marks");
      } else nextQuestion("marks");
    },

    // Hair length?
    hair_length: function hair_length(ans) {
      app.suspects[app.count].hair = ans;
      nextQuestion("hair_color");
    },

    // Hair color?
    hair_color: function hair_color(ans) {
      if (ans == "prompt") nextQuestion("hair_color_prompt");
      else {
        app.suspects[app.count].hair_color = ans;
        nextQuestion("hair_type");
      }
    },

    hair_color_prompt: function hair_color_prompt(ans) {
      app.suspects[app.count].hair_color = ans;
      nextQuestion("hair_type");
    },

    // Is the hair curly?
    hair_type: function hair_type(ans) {
      app.suspects[app.count].hair_type = ans;
      if (app.suspects[app.count].gender == "male") nextQuestion("facial_hair");
      else nextQuestion("marks");
    },

    // Facial hair?
    facial_hair: function facial_hair(ans) {
      app.suspects[app.count].facial_hair = ans;
      nextQuestion("eyes");
    },

    // Eye color?
    eyes: function eyes(ans) {
      if (ans == "other") nextQuestion("eyes_other");
      else {
        app.suspects[app.count].eyes = ans;
        nextQuestion("glasses");
      }
    },
    eyes_other: function eyes_other(ans) {
      app.suspects[app.count].eyes = ans;
      nextQuestion("glasses");
    },

    // Glasses?
    glasses: function glasses(ans) {
      app.suspects[app.count].glasses = ans;
      nextQuestion("marks");
    },

    // Visible marks?
    marks: function marks(ans) {
      if (ans == "prompt") nextQuestion("marks_prompt");
      else nextQuestion("armed");
    },

    marks_prompt: function marks_prompt(ans) {
      app.suspects[app.count].marks = ans;
      nextQuestion("armed");
    },

    // MISC PERSONAL DETAILS

    // Is suspect armed?
    armed: function armed(ans) {
      app.suspects[app.count].weapons = ans;
      nextQuestion("gang_member");
    },

    // Gang member?
    gang_member: function gang_member(ans) {
      if (ans) nextQuestion("gang_name");
      else nextQuestion("suspect_location");
    },

    gang_name: function gang_name(ans) {
      if (ans == "prompt") nextQuestion("gang_name_prompt");
      else {
        app.suspects[app.count].gang = "unknown";
        nextQuestion("suspect_location");
      }
    },

    gang_name_prompt: function gang_name_prompt(ans) {
      app.suspects[app.count].gang = ans;
      nextQuestion("suspect_location");
    },

    // Address?
    suspect_location: function suspect_location(ans) {
      if (ans == "prompt") nextQuestion("suspect_location_prompt");
      else nextQuestion("social_media");
    },

    suspect_location_prompt: function suspect_location_prompt(ans) {
      app.suspects[app.count].location = ans;
      nextQuestion("suspect_location_time"); // ask about dogs
    },

    // When is suspect usually there?
    suspect_location_time: function suspect_location_time(ans) {
      app.suspects[app.count].location_time = ans;
      nextQuestion("children");
    },

    // Dogs at this location?
    children: function children(ans) {
      app.suspects[app.count].dogs = ans;
      nextQuestion("dogs");
    },
    // Dogs at this location?
    dogs: function dogs(ans) {
      app.suspects[app.count].dogs = ans;
      nextQuestion("social_media");
    },

    // Social media?
    social_media: function social_media(ans) {
      if (ans == "prompt") nextQuestion("social_media_prompt");
      else nextQuestion("vehicle");
    },

    social_media_prompt: function social_media_prompt(ans) {
      app.suspects[app.count].social_media = ans;
      nextQuestion("vehicle");
    },

    // Suspect's vehicle --------------------

    // Know anything about it?
    vehicle: function vehicle(ans) {
      if (ans) nextQuestion("vehicle_make");
      else nextQuestion("another_suspect");
    },

    // Make?
    vehicle_make: function vehicle_make(ans) {
      if (ans == "prompt") nextQuestion("vehicle_make_select");
      else nextQuestion("vehicle_type");
    },

    // Drill down to select a make
    vehicle_make_select: function vehicle_make_select(ans) {
      if (ans == "prompt") nextQuestion("vehicle_make_prompt");
      else nextQuestion(ans);
    },

    // Select make from submenu
    vehicle_make_1: function vehicle_make_1(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },
    vehicle_make_2: function vehicle_make_2(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },
    vehicle_make_3: function vehicle_make_3(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },
    vehicle_make_4: function vehicle_make_4(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },
    vehicle_make_5: function vehicle_make_5(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },
    vehicle_make_6: function vehicle_make_6(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },

    // Old or rare make?
    vehicle_make_prompt: function vehicle_make_prompt(ans) {
      app.suspects[app.count].vehicle_make = ans;
      nextQuestion("vehicle_model");
    },

    // Model?
    vehicle_model: function vehicle_model(ans) {
      if (ans == "prompt") nextQuestion("vehicle_model_prompt");
      else nextQuestion("vehicle_type");
    },
    vehicle_model_prompt: function vehicle_model_prompt(ans) {
      app.suspects[app.count].vehicle_model = ans;
      nextQuestion("vehicle_age");
    },

    // Type?
    vehicle_type: function vehicle_type(ans) {
      app.suspects[app.count].vehicle_type = ans;
      nextQuestion("vehicle_age");
    },

    // Vehicle age?
    vehicle_age: function vehicle_age(ans) {
      app.suspects[app.count].vehicle_age = ans;
      nextQuestion("vehicle_color");
    },

    // Color?
    vehicle_color: function vehicle_color(ans) {
      if (ans == "other") nextQuestion("vehicle_color_other");
      else {
        app.suspects[app.count].vehicle_color = ans;
        nextQuestion("vehicle_marks");
      }
    },
    vehicle_color_other: function vehicle_color_other(ans) {
      if (ans == "prompt") nextQuestion("vehicle_color_prompt");
      else {
        app.suspects[app.count].vehicle_color = ans;
        nextQuestion("vehicle_marks");
      }
    },
    vehicle_color_prompt: function vehicle_color_prompt(ans) {
      app.suspects[app.count].vehicle_color = ans;
      nextQuestion("vehicle_marks");
    },

    // Vehicle marks?
    vehicle_marks: function vehicle_marks(ans) {
      if (ans == "prompt") nextQuestion("vehicle_marks_prompt");
      else nextQuestion("vehicle_tag");
    },
    vehicle_marks_prompt: function vehicle_marks_prompt(ans) {
      app.suspects[app.count].vehicle_marks = ans;
      nextQuestion("vehicle_tag");
    },

    // Vehicle tag?
    vehicle_tag: function vehicle_tag(ans) {
      if (ans == "prompt") nextQuestion("vehicle_tag_prompt");
      else nextQuestion("another_suspect");
    },
    vehicle_tag_prompt: function vehicle_tag_prompt(ans) {
      app.suspects[app.count].vehicle_tag = ans;
      // If user has reported less than 5 suspects, ask if there are more
      if (app.suspects.length < 5) nextQuestion("another_suspect");
      else nextQuestion("misc");
    },

    // Is there another suspect?
    another_suspect: function another_suspect(ans) {
      if (app.suspects.length > 0) parseSuspect(app.suspects[app.count]); // Parse object into readable paragraph
      if (ans) {
        app.count += 1;
        app.suspects[app.count] = new Suspect(); // create new Suspect object
        nextQuestion("gender");
      } else nextQuestion("misc");
    },

    // Ready to submit?
    submit: function submit(ans) {
      if (ans) {
        var today = new Date();
        var date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        var time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        var timestamp = date + " " + time;
        app.tip.timestamp = timestamp;
        console.log(app.tip);
        submitForm(app.tip); // Send data to backend
        nextQuestion("end");
      }
    },

    // Done. Now what?
    end: function end(ans) {
      if (ans == "new") {
        // Reset app object
        app = {
          answered: ["end"],
          suspects: [],
          count: 0,
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
            suspect_5: ""
          }
        };
        nextQuestion("tip");
      } else window.location = "http://www.miami-police.org";
    }

    // console.log("Question: " + question + ". Answer: " + ans)
  };
  return router[question](ans);
}

// Concatenate raw suspect data into complete sentences
function parseSuspect(s) {
  // s = suspect object
  var summary = "";
  var he_or_she = "Suspect";
  var his_or_her = "Suspect's";
  if (s.gender == "male") {
    he_or_she = "He";
    his_or_her = "His";
  } else if (s.gender == "female") {
    he_or_she = "She";
    his_or_her = "Her";
  }
  // If this is a drug-related tip:
  if (s.drug_activity) {
    summary += "Suspect is allegedly involved in";
    if (s.drug_type)
      summary += " " + s.drug_type; // e.g. cocaine
    else summary += " drug";
    summary += " " + s.drug_activity + ". "; // e.g. possession, sales, trafficking
  }
  // If we have any basic details about suspect's appearance:
  if (s.skin || s.age || s.gender || s.ethnicity) {
    summary += "Suspect is a";
    // If we know the skin color:
    if (s.skin) summary += " " + s.skin + "-skinned"; // e.g. light-skinned
    // If we know the age:
    if (s.age) summary += " " + s.age; // e.g. adult
    // If we know the gender:
    if (s.gender != "unknown") {
      summary += " " + s.gender;
    } else {
      // e.g. male
      summary += " individual (gender unknown)";
    }
    // If we know the ethnicity:
    if (s.ethnicity) summary += " of " + s.ethnicity + " descent"; // e.g. of Asian descent
    summary += "."; // End first sentence
  }
  if (s.height || s.weight) {
    summary += " " + he_or_she + " is";
    // If we know the height:
    if (s.height) {
      if (s.height != "average")
        summary += " " + s.height; // e.g. short
      else summary += " average height";
    }
    if (s.height && s.weight) summary += " and"; // and
    // If we know the weight:
    if (s.weight) {
      if (s.weight != "average") summary += " " + s.weight;
      else summary += " average weight"; // e.g. thin
    }
    summary += ".";
  }
  // If we know about the suspect's hair:
  if (s.hair_length) {
    if (s.hair_length == "shaved or bald")
      summary += " " + his_or_her + " head is shaved or bald.";
    else
      summary +=
        " " +
        he_or_she +
        " has " +
        s.hair_length +
        ", " +
        s.hair_type +
        ", " +
        s.hair_color +
        " hair.";
  }
  // If we know about suspect's facial hair (men only):
  if (s.facial_hair) {
    if (s.facial_hair == "clean-shaven")
      summary += " " + his_or_her + " face is " + s.facial_hair + ".";
    else summary += " " + he_or_she + " has " + s.facial_hair + ".";
  }
  // If we have info about suspect's eyes:
  if (s.eyes || s.glasses) {
    summary += " " + he_or_she;
    if (s.eyes) summary += " has " + s.eyes + " eyes";
    if (s.eyes && s.glasses) summary += " and"; // and
    if (s.glasses) summary += " wears glasses";
    summary += ".";
  }
  if (s.marks)
    summary +=
      " " +
      he_or_she +
      " has the following identifying marks: " +
      s.marks +
      ".";
  // If we know about suspect's legal name:
  if (s.name) summary += " " + his_or_her + " legal name is: " + s.name + ".";
  // If suspect has aliases:
  if (s.aliases)
    summary +=
      " " + he_or_she + " uses the following alias(es): " + s.aliases + ".";
  // If suspect is a gang member:
  if (s.gang == "unknown") summary += " " + he_or_she + " is a gang member.";
  else if (s.gang)
    summary += " " + his_or_her + " gang affiliation is: " + s.gang + ".";
  // If suspect is armed:
  if (s.weapons)
    summary += " " + he_or_she + " is armed with a " + s.weapons + ".";
  if (s.location) {
    summary += " " + he_or_she + " may be found at: " + s.location + ".";
    if (s.location_time)
      summary +=
        " " + he_or_she + " is usually there between " + s.location_time + ".";
    if (s.children && s.dogs)
      summary += " There are children and dogs at this location.";
    else if (s.children) summary += " There are children at this location.";
    else if (s.dogs) summary += " There are dogs at this location.";
  }
  if (s.social_media)
    summary +=
      " " + his_or_her + " social media info is: " + s.social_media + ".";
  if (s.vehicle_make || s.vehicle_type) {
    summary += "  " + he_or_she + " drives a";
    if (s.vehicle_color) summary += " " + s.vehicle_color; // e.g. white
    if (s.vehicle_age) summary += " " + s.vehicle_age; // e.g. late-model
    if (s.vehicle_make) summary += " " + s.vehicle_make; // Ford
    if (s.vehicle_model) summary += " " + s.vehicle_model; // Mustang
    if (s.vehicle_type) summary += " " + s.vehicle_type; // coupe
    summary += ".";
    if (s.vehicle_marks)
      summary +=
        " The vehicle has the following features: " + s.vehicle_marks + ".";
    if (s.vehicle_tag) summary += " Its tag number is: " + s.vehicle_tag + ".";
  }
  // Clean up grammar
  summary = summary
    .replace(" a a", " an a")
    .replace(" a e", " an e")
    .replace(" a i", " an i")
    .replace(" a o", " an o")
    .replace(" a u", " a(n) u")
    .replace(" a A", " an A")
    .replace(" a E", " an E")
    .replace(" a I", " an I")
    .replace(" a O", " an O")
    .replace(" a U", " a(n) U")
    .replace("..", ".");
  // Save to appropriate key
  if (app.count == 0) app.tip.suspect_1 = summary;
  else if (app.count == 1) app.tip.suspect_2 = summary;
  else if (app.count == 2) app.tip.suspect_3 = summary;
  else if (app.count == 3) app.tip.suspect_4 = summary;
  else app.tip.suspect_5 = summary;
}

// Non-AJAX form submission
function submitForm(tip) {
  // varruct an HTTP request
  var xhr = new XMLHttpRequest();
  // xhr.open("POST", "http://127.0.0.1:5000/tip"); // Dev only
  xhr.open("POST", "./tip") // Production
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  // send the collected data as JSON
  xhr.send(JSON.stringify(tip));
  xhr.onloadend = function() {
    console.log("Sent!");
  };
}

// Warn before reloading/using browser back button
window.onbeforeunload = function(e) {
  var dialogText =
    "Are you sure? Your answers will be lost. (Use the 'Back' button to return to a previous question.)";
  e.returnValue = dialogText;
  return dialogText;
}

// Initialize listeners
addButtonListeners();
addSubmitListeners();
addTextareaListeners();