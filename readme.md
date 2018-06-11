# City of Miami Police Department - Project "Tipster"

This was an FDLE-grant funded project to develop an anonymous tip reporting portal for the MPD website. The goal was to develop a UI that gathers important information as efficiently as possible. 

The developed prototype has two components:

* Public: Standalone web app for reporting tips via a conversational form/simple chatbot UI
* Internal: O365/Sharepoint workflow to retrieve data from the app's API and route it to appropriate MPD personnel

## Web Application

The web app is designed to be extremely lightweight with minimal dependencies. It is built on the following stack:

* HTML/CSS
* JavaScript (vanilla ES6 + Babel)
* Python 3.6 on Flask
* SQLite

### Overview

The UI asks simple, non-legalistic questions to determine the nature of the crime (robbery, burglary, etc.). It then asks questions about each suspect (up to five). Most questions prompt the user to choose from a set of answer choices; a few ask the user to enter a short description.

Once the app is done asking questions, it `POST`s the tip to the backend, where it is temporarily stored in a SQLite database for later retrieval via a RESTful API.

Every hour, an automated Sharepoint workflow pings the API. If there are any recently submitted tips, the API returns them as a JSON. The workflow parses the JSON, adds each tip to a List, and notifies the appropriate personnel. The workflow then tells the app to erase its database contents.

### Frontend

The frontend consists of a single HTML page, stylesheet, and minified JS file.

The HTML contains several dozen fieldsets, each of which poses a question (inside `<legend>` tag) and a series of answer choices (inside `<button>` tags), e.g.:

```
    <fieldset id="tip" class="hidden">
        <legend>OK. What's this tip about?</legend>
        <button value="drugs">Drug activity</button>
        <button value="crime">Some other crime</button>
        <button value="fugitive">A fugitive (someone hiding from the police)</button>
    </fieldset>
```

When the page loads, the only question visible is `id="intro"`. All the others are hidden (`class="hidden"`) by default. Only one question should be visible at any time.

The JS is written in vanilla ES6, then converted to ES5 and minified via Babel. How it works:
 
* The app listens for the user to click on an answer choice (see `addButtonListener`) or enter information in a `<textarea>` (see `addSubmitListener` and `addTextareaListener`).
* When the user clicks a button or submits an answer, its `value` and parent (fieldset) `id` are passed into `handleSelection()`.
* `handleSelection` is an object that takes the place of a long switch statement. Each of its keys corresponds to a fieldset `id`. Keys contain anonymous functions. When a function is triggered, it takes `value` as an argument and determines whether to save the answer choice, which question to ask next, etc.
* All data is saved in a single global object named `app`.
* When the user reports a new suspect, an instance of `Suspect()` is created and added to an array (`app.suspects`). Each Suspect has a number of keys/values. The key/value pairs for each Suspect are later parsed into a plain English paragraph and stored in `app.tip` as a single string (see `parseSuspects`).
* When the user submits the tip, `app.tip` is sent to the backend as a JSON string.

### Backend

The backend does the following:
1. Serve up the index page. See `home()`.
2. Receive tips in JSON format from the frontend and save each one as a row in a SQLite database named `database.db`. See `tipAPI()`.
3. Return database contents as a JSON via API. See `tipAPI()`.
4. Clear database contents. See `dropTip()`

Note that `tipAPI` and `dropTip` require a authorization key. The key must be sent in the request header as `authorization` and must match the config variable `[AUTH]`.

## Workflow

The Sharepoint workflow was developed using "Nintex Workflow for Sharepoint 2013", a workflow automation tool integrated into our O365 account.

The workflow consists of the following steps:

1. We use the "Build Dictionary" action to create an "auth_key" variable to hold the API's authorization key. The key is a password-strength string of random 64 alpha-numeric characters (generated at https://www.grc.com/passwords.html). Its purpose is to prevent the public from using the API. *Note: The key must match the "AUTH" global variable we set in our Azure environment. If AUTH changes, then the workflow must be updated.*

2. We use the "Call HTTP Web Service" action to send a GET request to the API (again, this request *must* include the authorization key). A successful request returns a JSON, which we store in the variable "json". Unfortunately, Nintex does not currently offer native JSON support, so we must store the API response as an ordinary string. The string will always look something like this:

    ```
    {'0': {'timestamp': '2018-4-26 19:39:2', 'category': 'homicide', 'when': '2018-04-26', 'where': '' 'details': '', 'suspect_1': '', 'suspect_2': '', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''},'1': {'timestamp': '2018-4-26 19:47:23', 'category': 'fugitive', 'when': '', 'where': '', 'details': '' ,'suspect_1': 'Suspect is a dark-skinned middle-aged female. Her legal name is: Jane Doe. She is armed with a firearm. She wears glasses. She may be located at: 123 SW 4 St. There are dogs at that location.', 'suspect_2': 'Suspect is a light-skinned adult male. His face is clean-shaven. He is armed with a knife.', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''}}
    ```

3. We use the "Regular Expression" action to extract all tips from the string. Each tip consists of ten key/value pairs: timestamp, category, when, where, details, suspect_1, suspect_2, suspect_3, suspect_4, and suspect_5. The regex pattern selects every instance of the substring "timestamp", and then continues selecting characters until it hits a closing curly brace (which marks the end of that tip). Each string found in this manner is added to an array (aka "collection) named "tips". Using the previous example, the contents of "tips" would look like this (note: I use single quotes here for readability, but they may appear as escaped double quotes in Nintex):

    ```
    ["'timestamp': '2018-4-26 19:39:2', 'category': 'homicide', 'when': '2018-04-26', 'where': '', 'details': '', 'suspect_1': '', 'suspect_2': '', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''","'timestamp': '2018-4-26 19:47:23', 'category': 'fugitive', 'drug_or_gang_related': '', 'drug': '', 'when': '', 'where': '', 'details': '', 'suspect_1': 'Suspect is a dark-skinned middle-aged female. Her legal name is believed to be: Jane Doe. She is armed with a firearm. She wears glasses. She may be located at: 123 SW 4 St. There are dogs at this location.', 'suspect_2': 'Suspect is a light-skinned adult male. His face is clean-shaven. He is armed with a knife.', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''"]
    ```

4. We use the "For Each" action to loop through the collection, as follows:

5. For `each_tip`, we use the "Regular Expression" action to replace empty values (`''`) with hyphens (`'-'`). This is necessary in order to distinguish the quotes within a tip from the quotes that surround each tip for the purposes of the next step.

6. The `each_tip` string always contains ten key/value pairs. We use the "Regular Expression" action to extract each value and add it to the `values` collection.

7. Because `values` always contains ten items, we get each value from the collection by its index and assign it to a variable, e.g.: `values[0]` is saved to `timestamp`.

8. 
