# MPD Anonymous Tip-reporting Portal

## Description

A lightweight, low-level chatbot that asks multiple-choice questions to gather anonymous crime data, which it then parses into a report. Built in vanilla HTML/CSS/JavaScript (ES6) on a Python 3 (Flask) backend with RESTful API endpoint.

## Wiki

Documentation available [here](https://github.com/MiamiPoliceDepartment/tips/wiki).

## Installation

1. [Install Python 3.6+](https://www.python.org/downloads/)
2. Clone (or download and extract) the application files
3. From the command line, navigate into the app's root directory
4. Install Flask: 

    `pip install flask`

4. Configure Flask to run the application:

    `export FLASK_APP=app.py`

5. Enable debug mode (optional but recommended):

    `FLASK_DEBUG=1`

6. Start the local server (runs on http://127.0.0.1:5000/ by default):

    `python -m flask run`
    
## Usage

As a security measure, this application is intended for standalone deployment. It should be paired with a workflow or cron process that calls the API every hour to retrieve new tips. A successful API call clears the database.

Note that this prototype uses SQLite, which hosts like Azure and Heroku will periodically reset to the most recent pushed state (thus erasing any data). It is recommended that the database be upgraded to PostgreSQL for production.

<!-- ## Contributing -->

## Credits

[David James Knight](https://github.com/davidjamesknight)

<!-- ## License -->