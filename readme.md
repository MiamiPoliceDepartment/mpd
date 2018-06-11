# City of Miami Police Department - Project "Tipster"

This was an FDLE-grant funded project to prototype an anonymous tip reporting portal. The project consists of both a public-facing and an internal component:

* Public: Standalone web app for reporting tips via a conversational form/simple chatbot UI
* Internal: O365/Sharepoint workflow to retrieve data from the app's API and route it to appropriate MPD personnel

## Web Application

## Workflow

The Sharepoint workflow was developed using "Nintex Workflow for Sharepoint 2013", a workflow automation tool integrated into our O365 account.

The workflow consists of the following steps:

1. We use the "Build Dictionary" action to create an "auth_key" variable to hold the API's authorization key. The key is a password-strength string of random 64 alpha-numeric characters (see https://www.grc.com/passwords.html). Its purpose is to prevent the public from using the API. *Note: The key must match the "AUTH" global variable we set in our Azure environment. If AUTH changes, then the workflow must be updated.*

2. We use the "Call HTTP Web Service" action to send a GET request to the API (again, this request *must* include the authorization key). A successful request returns a JSON, which we store in the variable "json". Unfortunately, Nintex does not currently offer native JSON support, so we must store the API response as an ordinary string. The string will always look something like this:

    ```
    {'0': {'timestamp': '2018-4-26 19:39:2', 'category': 'homicide', 'when': '2018-04-26', 'where': '' 'details': '', 'suspect_1': '', 'suspect_2': '', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''},'1': {'timestamp': '2018-4-26 19:47:23', 'category': 'fugitive', 'when': '', 'where': '', 'details': '' ,'suspect_1': 'Suspect is a dark-skinned middle-aged female. Her legal name is: Jane Doe. She is armed with a firearm. She wears glasses. She may be located at: 123 SW 4 St. There are dogs at that location.', 'suspect_2': 'Suspect is a light-skinned adult male. His face is clean-shaven. He is armed with a knife.', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''}}
    ```

3. We use the "Regular Expression" action to extract all tips from the string. Each tip consists of ten key/value pairs: timestamp, category, when, where, details, suspect_1, suspect_2, suspect_3, suspect_4, and suspect_5. The regex pattern selects every instance of the substring "timestamp", and then continues selecting characters until it hits a closing curly brace (which marks the end of that tip). Each string found in this manner is added to an array (aka "collection) named "tips". Using the previous example, the contents of "tips" would look like this (note: I use single quotes here for readability, but they may appear as escaped double quotes in Nintex):

    ```
    ["'timestamp': '2018-4-26 19:39:2', 'category': 'homicide', 'drug_or_gang_related': 'gang', 'drug': '', 'when': '2018-04-26', 'where': '', 'details': '', 'suspect_1': '', 'suspect_2': '', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''","'timestamp': '2018-4-26 19:47:23', 'category': 'fugitive', 'drug_or_gang_related': '', 'drug': '', 'when': '', 'where': '', 'details': '', 'suspect_1': 'Suspect is a dark-skinned middle-aged female. Her legal name is believed to be: Jane Doe. She is armed with a firearm. She wears glasses. She may be located at: 123 SW 4 St. There are dogs at this location.', 'suspect_2': 'Suspect is a light-skinned adult male. His face is clean-shaven. He is armed with a knife.', 'suspect_3': '', 'suspect_4': '', 'suspect_5': ''"]
    ```

4. We use the "For Each" action to iterate through every tip, as follows:

5. For each tip, we use the "Regular Expression" action to replace empty values ('') with hyphens ('-'). This is necessary in order to distinguish the quotes within a tip from the quotes that surround each tip for the purposes of the next step.

6. We use the "Regular Expression" action to extract 
