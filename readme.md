# City of Miami Police Department - 'Project Tipster'

This was an FDLE-grant funded project to develop an anonymous tip reporting portal for the MPD website. The goal was to develop a UI that gathers important information as efficiently as possible, and then automatically routes that information to the appropriate personnel.

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

Once the app is done asking questions, it `POST`s the tip to the backend, where the tip is temporarily stored in a SQLite database for later retrieval via a RESTful API.

An automated Sharepoint workflow periodically pings the API. If there are any recently submitted tips, the API returns them as a JSON. The workflow parses the JSON, adds each tip to a List, and notifies the appropriate personnel. The workflow then tells the app to erase its database contents. No tip data is permanently stored online.

### Frontend

The frontend consists of a single HTML page, stylesheet, and minified JS file.

#### HTML

The HTML contains several dozen fieldsets, each of which poses a question (inside `<legend>` tag) and a series of answer choices (inside `<button>` tags), e.g.:

```
    <fieldset id='tip' class='hidden'>
        <legend>OK. What's this tip about?</legend>
        <button value='drugs'>Drug activity</button>
        <button value='crime'>Some other crime</button>
        <button value='fugitive'>A fugitive (someone hiding from the police)</button>
    </fieldset>
```

When the page loads, the only question visible is `id='intro'`. All the others are hidden (`class='hidden'`) by default. Only one question should be visible at any time.

References to "the suspect" are inside `<span>` tags. Each of these spans has a class of `"pronoun-subject"`, `"pronoun-possessive"`, or `"pronoun-object"` according to its grammatical role. If the user identifies the suspect's gender, then the inner text of each tag will be replaced with the appropriate pronoun (e.g. "he", "his", "him"). *See* `setGenderPronouns()`.

#### JavaScript

The JS was written in vanilla ES6, then converted to es2015 via Babel and minified. How it works:
 
* The app listens for the user to click on an answer choice (see `addButtonListener`) or enter information in a `<textarea>` (see `addSubmitListener` and `addTextareaListener`).
* When the user clicks a button or submits an answer, its `value` and parent (fieldset) `id` are passed into `handleSelection()`.
* `handleSelection` is an object that takes the place of a long switch statement. Each of its keys corresponds to a fieldset `id`. Keys contain anonymous functions. When a function is triggered, it takes `value` as an argument and determines whether to save the answer choice, which question to ask next, etc.
* All data is saved in a single global object named `app`.
* Certain answers trigger updates to the DOM. For example, if the user identifies a suspect as male, the suspect will thereafter be referred to as "he", "his" or "him." *See* `setGenderPronouns()`.
* When the user reports a new suspect, an instance of `Suspect()` is created and added to an array (`app.suspects`). Each Suspect has a number of keys/values. The key/value pairs for each Suspect are later parsed into a plain English paragraph and stored in `app.tip` as a single string (see `parseSuspects`).
* When the user submits the tip, `app.tip` is sent to the backend as a JSON string.

### Backend

The backend does the following:
1. Serve up the index page. See `home()`.
2. Receive tips from the frontend and save each one as a row in a SQLite database named `database.db`. See `tipAPI()`.
3. Respond to RESTful API requests and return database contents as a JSON. See `tipAPI()`.
4. Clear database contents. See `dropTip()`

Note that `tipAPI` and `dropTip` require an authorization key. The key must be sent in the HTTP request header as `authorization` and must match the config variable `[AUTH]` (Azure > Dashboard > Application Settings).

## Sharepoint Integration

Every hour, Sharepoint automatically retrieves tips from the API in JSON format via a site-level workflow on the [MPD Tips](https://mia.sharepoint.com/sites/MiamiPD/nintex) subsite. 

The workflow was developed using 'Nintex Workflow for Sharepoint 2013', which is a drag-and-drop tool integrated into our O365 account.

### Editing the workflow

To edit the workflow, go to [MPD Tips](https://mia.sharepoint.com/sites/MiamiPD/nintex) > Site contents > Nintex Workflow for Office 365.

*Note: Due to Nintex's limited JSON support, the workflow relies heavily on Regular Expressions ("regex"). See https://community.nintex.com/thread/4194?commentID=22010#comment-22010. This is effective, but also a hack. If Nintex adds tools to parse JSON objects, then the workflow should be updated.*

### Running the workflow

The workflow is scheduled to automatically run every hour. It can also be manually started from the [Anonymous Tips](https://mia.sharepoint.com/sites/MiamiPD/nintex/Lists/Tipster/AllItems.aspx) list.

### Understanding the workflow

The workflow consists of the following steps:

####1. Define API key

We use the **Build Dictionary** action to create an `auth_key` variable to hold the API's authorization key. The key is a string of 64 random hexadecimal characters generated at https://www.grc.com/passwords.html.

*Note: The key must match the 'AUTH' config variable we set in our Azure environment (Azure > Dashboard > Application Settings). If AUTH changes, then the workflow must be updated.*

####2. GET tips from API

We use the **Call HTTP Web Service** action to send a GET request to the API. This request *must* include the authorization key, or it will fail. A successful request returns a JSON, which we store in the variable `json`. The contents of `json` look like this (*JSON objects are orderless, so the order of the keys may vary*):

    {"0": {"timestamp": "2018-4-26 19:39:2", "category": "homicide", "when": "2018-04-26", "where": "123 SW 4 Street", "details": "Body buried in the backyard", "suspect_1": "", "suspect_2": "", "suspect_3": "", "suspect_4": "", "suspect_5": ""},"1": {"timestamp": "2018-4-26 19:47:23", "category": "fugitive", "when": "", "where": "", "details": " ,"suspect_1": "Suspect is a dark-skinned middle-aged female. Her legal name is: Jane Doe. She is armed with a firearm. She wears glasses. She may be located at: 123 SW 4 St. There are dogs at that location.", "suspect_2": "Suspect is a light-skinned adult male. His face is clean-shaven. He is armed with a knife.", "suspect_3": "", "suspect_4": "", "suspect_5": ""}}

####3. Split API response into a collection

Normally, we would query the JSON directly (e.g., `json["0"]["timestamp"]`), but Nintex does not support JSON-parsing. Instead, it treats the response as an ordinary string object. So, we must use the **Regular Expression** action to *extract* all tips and store them in an array (or "collection" in Nintex terms) named `tips`.

The top level keys in `json` are always numbers (starting at `"0"`), so we need a pattern that selects the substring inside the curly braces that follow each numeric key. 

That pattern looks like this: `(?<=\d\":\s{)(.*?)(?=})`

If we used that pattern to extract tips from the `json` example above, then `tips` would look like this:
    
    ["'timestamp': '2018-4-26 19:39:2', 'category': 'homicide', 'when': '2018-04-26', 'where': '123 SW 4 Street', 'details': 'Body buried in the backyard', 'suspect_1':' ', 'suspect_2': '', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''", "'timestamp': '2018-4-26 19:47:23', 'category': 'fugitive', 'when': '', 'where': '', 'details': '', 'suspect_1': 'Suspect is a dark-skinned middle-aged female. Her legal name is believed to be: Jane Doe. She is armed with a firearm. She wears glasses. She may be located at: 123 SW 4 St. There are dogs at this location.', 'suspect_2': 'Suspect is a light-skinned adult male. His face is clean-shaven. He is armed with a knife.', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''"]

Note: I use single quotes here for readability, but behind the scenes, they are actually escaped double quotes, like this: `"\"timestamp\": \"2018-4-26 19:39:2\"`
    
####4. Query "Tip Recipients" list

In order for the workflow to properly run, the personnel to be notified when new tips arrive must be manually added to the [Tip Recipients](https://mia.sharepoint.com/sites/MiamiPD/nintex/Lists/Tip%20Recipients/AllItems.aspx?viewpath=%2Fsites%2FMiamiPD%2Fnintex%2FLists%2FTip%20Recipients%2FAllItems.aspx) list. That list stores each recipient's O365 profile object in the 'Assigned To' column.

We use the **Query List** action to pull the 'Work Email' property from each recipient's profile. The result is stored in the `recipients` collection. It includes metadata and looks like this:

    [{"Assigned_x0020_To":{"EMail":"01234@miami-police.org"},"FileLeafRef":"1_.000"}, {"Assigned_x0020_To":{"EMail":"56789@miami-police.org"},"FileLeafRef":"1_.000"}]

####5. Extract recipient emails

We use a **Regular Expression** action to *extract* the email addresses from `recipients`.

The regex pattern is: `(?<=EMail\":\")(.*?)(?=\")`

The addresses are saved to `recipients`, which now looks like this:

    ["01234@miami-police.org", "56789@miami-police.org"]


####6. Parse each tip

For `each_tip`, we do the following:

####7. Extract value from each key/value pair

This step consists of ten **Regular Expression** actions running in a **Parallel Block**. It's a bit of a hack. For reasons unknown, Nintex does not provide an operation to save a regex match directly to a variable. We can, however, trim away any substrings we don't want by *replacing* them with empty strings, which leaves only the value we *do* want.

For example, the regex to trim away everything but the value of "timestamp" looks like this:

`^.+?(?=(?<=timestamp\":\s\")(.*?)(?=\"))|(?<=(?<=timestamp\":\s\")(.*?)(?=\")).+$`

This pattern uses regex negative lookbacks and lookaheads to match everything *before* and *after* the "timestamp" key's value (but not the value itself). If the value is undefined, Nintex treats it as an empty string.

The trimmed strings are stored in variables. For example, the output of the above regex is stored in `timestamp`, which looks like this: `2018-4-26 19:39:2`

####8. Add tip to list

We use the **Create List Item** action to add these ten variables to the corresponding columns in the [Anonymous Tips](https://mia.sharepoint.com/sites/MiamiPD/nintex/Lists/Tipster/AllItems.aspx) list on Sharepoint.

####9. Email each recipient

We use the **For Each** action to loop through `recipients`. For `each_recipient`, we use the **Send an Email** action to alert the recipient that a new tip has come in. 

####10. Reset API database

We use the "Call HTTP Web Service" action to send another GET request to the API (again, this request *must* include the authorization key). This request tells the app to clear its contents.