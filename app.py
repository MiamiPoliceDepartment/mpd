# Dependencies ------------------------
from flask import Flask # Import the Flask class
# from flask_cors import CORS, cross_origin # Allow cross-site requests on localhost (dev only!)
from flask import render_template
from flask import request # Enable "request" object (params, etc.)
import sqlite3
import json
import os

# Config ------------------------------
app = Flask(__name__) #  Create an instance of the Flask class. The first argument is the name of the application’s module or package.
# CORS(app) # Allow cross-site requests on localhost (dev only)

wsgi_app = app.wsgi_app # define for IIS module registration
if __name__ == '__main__': 
    app.run()

# Routes ------------------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/tip", methods=["POST", "GET"])
def tipAPI():
    if (request.method == "POST"):
        try:
            params = request.get_json() # Build a dict from params
            conn = sqlite3.connect("database.db") # Connect to the database
            cursor = conn.cursor() # Instantiate cursor object
            # Create table if it doesn't exist:
            create_table = """
                CREATE TABLE IF NOT EXISTS tips (
                    id INTEGER PRIMARY KEY, 
                    time_stamp, 
                    category, 
                    when_crime, 
                    where_crime, 
                    details, 
                    suspect_1, 
                    suspect_2, 
                    suspect_3, 
                    suspect_4, 
                    suspect_5 )
            """
            cursor.execute(create_table)

            # Add params to db using ? placeholders to prevent SQL injection
            insert_data = "INSERT INTO tips (time_stamp, category, when_crime, where_crime, details, suspect_1, suspect_2, suspect_3, suspect_4, suspect_5 ) VALUES (?,?,?,?,?,?,?,?,?,?)"

            placeholder_data = (params["timestamp"], params["category"], params["when"], params["where"], params["details"], params["suspect_1"], params["suspect_2"], params["suspect_3"], params["suspect_4"], params["suspect_5"])

            cursor.execute(insert_data, placeholder_data)
    
            cursor.close() # Close the cursor
            conn.commit() # Save it
            print("Saved!")
        except:
            conn.rollback()
            print("Exception: Failed to POST data!")
        finally:
            conn.close() # Disconnect from the database

    # elif (request.method == "GET" and request.headers.get("Authorization") == "123abc"): # Dev only!   
    elif (request.method == "GET" and request.headers.get("Authorization") == os.environ["AUTH"]): # Production
        try:
            conn = sqlite3.connect("database.db") # Connect to the database
            conn.row_factory = sqlite3.Row # Treat rows as objects
            cursor = conn.cursor()
            rows = cursor.execute("SELECT * FROM tips").fetchall() # Get all rows (tips)

            # Create a dictionary for all tips
            results = {}
            for idx, r in enumerate(rows):
                results[idx] = {"timestamp": dict(r)["time_stamp"], "category": dict(r)["category"], "when": dict(r)["when_crime"], "where": dict(r)["where_crime"], "details": dict(r)["details"], "suspect_1": dict(r)["suspect_1"], "suspect_2":dict(r)["suspect_2"], "suspect_3": dict(r)["suspect_3"], "suspect_4": dict(r)["suspect_4"], "suspect_5": dict(r)["suspect_5"]}
            
            return json.dumps(dict(results)) # Convert dictionary to a JSON string

        except:
            print("Failed to GET data!")
        finally:
            conn.close() # Disconnect from the database
    else:
        print("Wrong key!")
    return "Done"

@app.route("/drop")
def dropTip():
    # if (request.headers.get("Authorization") == "123abc"): # Dev only!
    if (request.headers.get("Authorization") == os.environ["AUTH"]): # Production
        try:
            conn = sqlite3.connect("database.db") # Connect to the database
            cursor = conn.cursor() # Instantiate cursor object
            cursor.execute("DROP TABLE IF EXISTS tips") 
            cursor.close() # Close the cursor
            conn.commit() # Save it
            print("Dropped!")
        except:
            conn.rollback()
            print("Failed to drop!")
        finally:
            conn.close() # Disconnect from the database
    else:
        print("Wrong key!")
    return "Done"