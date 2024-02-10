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

data = api_client.call_endpoint('games/players', params={'year': 2023, 'week': 1, 'seasonType': 'regular'}, verbose=True)

# write to example_player_data.json
with open('cfb/example_data/example_player_data.json', 'w') as file:
    file.write(json.dumps(data, indent=4))

# convert the list of teams to a DataFrame
data = pd.DataFrame(data)

print(data.columns)