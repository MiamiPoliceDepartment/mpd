# Dependencies ------------------------
from flask import Flask # Import the Flask class
from flask_cors import CORS, cross_origin # Allow cross-site requests
from flask import render_template
from flask import request # Enable "request" object (params, etc.)
import sqlite3
import json
import os

# Config ------------------------------
app = Flask(__name__) #  Create an instance of the Flask class. The first argument is the name of the application’s module or package.
CORS(app) # Allow cross-site requests
# app.config.from_object('config') # In development, access config variables via app.config["VAR_NAME"].

# Routes ------------------------------
@app.route("/")
def helloWorld():
    return render_template("index.html")

@app.route("/tip", methods=["POST", "GET"])
def saveTip():
    if (request.method == "POST"):
        try:
            params = request.get_json() # Build a dict from params
            conn = sqlite3.connect("database.db") # Connect to the database
            db = conn.cursor() # Instantiate cursor object
            # Create table if it doesn't exist
            db.execute("CREATE TABLE IF NOT EXISTS tips (id INTEGER PRIMARY KEY, timestamp, category, drug_or_gang_related, drug, when_crime, where_crime, details, suspect_1, suspect_2, suspect_3, suspect_4, suspect_5);")
            # Parameterized command to prevent SQL injection
            db.execute("INSERT INTO tips (timestamp, category, drug_or_gang_related, drug, when_crime, where_crime, details, suspect_1, suspect_2, suspect_3, suspect_4, suspect_5) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);", [params["timestamp"], params["category"], params["drug_or_gang_related"], params["drug"], params["when"], params["where"], params["details"], params["suspect_1"], params["suspect_2"], params["suspect_3"], params["suspect_4"], params["suspect_5"]])
            db.close() # Close the cursor
            conn.commit() # Save it
            print("Saved!")
        except:
            conn.rollback()
            print("Failed to POST data!")
        finally:
            conn.close() # Disconnect from the database

    # elif (request.method == "GET"): # Dev only!
    elif (request.method == "GET" and request.headers.get("Authorization") == os.environ["AUTH"]):
        try:
            conn = sqlite3.connect("database.db") # Connect to the database
            conn.row_factory = sqlite3.Row

            db = conn.cursor()
            rows = db.execute("SELECT * FROM tips").fetchall() # Get all rows (tips)
            # db.execute("DROP TABLE IF EXISTS tips")

            # Create a dictionary for all tips
            results = {}
            for idx, r in enumerate(rows):
                results[idx] = {"timestamp": dict(r)["timestamp"], "category": dict(r)["category"], "drug_or_gang_related": dict(r)["drug_or_gang_related"], "drug": dict(r)["drug"], "when": dict(r)["when_crime"], "where": dict(r)["where_crime"], "details": dict(r)["details"], "suspect_1": dict(r)["suspect_1"], "suspect_2":dict(r)["suspect_2"], "suspect_3": dict(r)["suspect_3"], "suspect_4": dict(r)["suspect_4"], "suspect_5": dict(r)["suspect_5"]}
            
            return json.dumps(dict(results)) # Convert dictionary to a JSON string

        except:
            print("Failed to GET data!")
        finally:
            conn.close() # Disconnect from the database
    else:
        print("Wrong key!")
    return "Done"