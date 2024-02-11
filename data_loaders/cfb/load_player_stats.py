import json
import pandas as pd
from CfbSQLConnector import MySQLConnection
from CollegeFootballDataApi import APIClient
from sqlalchemy import text

# create an instance of the APIClient with your API key
try:
    api_client = APIClient()
except FileNotFoundError:
    print("Error: cfb_api_key.txt file not found. Create the file in /cfb with your API key and try again.")
    exit()

data = api_client.call_endpoint('games/players', params={'year': 2023, 'week': 1, 'seasonType': 'regular', 'gameId': 401540200}, verbose=True)

# convert the list of teams to a DataFrame
data = pd.DataFrame(data)
                
stat_categories = [
    'punting',
    'kicking',
    'puntReturns',
    'kickReturns',
    'interceptions',
    'fumbles',
    'receving',
    'rushing',
    'passing',
]

# stat name conversions
stat_name_conversion = {
    'LONG': 'long',
    'In 20': 'inside_20',
    'TB': 'touchbacks',
    'AVG': 'avg',
    'YDS': 'yards',
    'NO': 'kicks',
    "PTS": "points",
    "XP": "extra_points",
    "PCT": "pct",
    "FG": "field_goals",
    "TD": "touchdowns",
    "INT": "interceptions",
    "LOST": "fumbles_lost",
    "FUM": "fumbles",
    "CAR": "carries",
    "REC": "receptions",
    "C/ATT": ["completions", "attempts"], # define in loop
}

def convert_stat_name(stat_name):
    if stat_name in stat_name_conversion:
        return stat_name_conversion[stat_name]
    else:
        return stat_name
    
def load_passing_stats(data):
    """
    Load passing stats into the database.
    
    Args:
        data (pd.DataFrame): The DataFrame containing the passing stats.
    """
    
    # insert query
    insert_query = text("INSERT INTO player_game_passing_stats (game_id, player_id, completions, attempts, yards, touchdowns, interceptions, average_per_attempt, average_per_completion) VALUES (:game_id, :player_id, :completions, :attempts, :yards, :touchdowns, :interceptions, :average_per_attempt, :average_per_completion)")