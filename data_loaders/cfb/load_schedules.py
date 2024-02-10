import json
import pandas as pd
from SQLConnector import MySQLConnection
from CollegeFootballDataApi import APIClient
from sqlalchemy import text

# create an instance of the APIClient with your API key
try:
    api_client = APIClient()
except FileNotFoundError:
    print("Error: cfb_api_key.txt file not found. Create the file in /cfb with your API key and try again.")
    exit()