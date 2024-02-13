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

data = api_client.call_endpoint('games/players', params={'year': 2023, 'week': 1, 'seasonType': 'regular'}, verbose=True)

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
}

# init mysql
mysql = MySQLConnection()

def convert_stat_name(stat_name):
    if stat_name in stat_name_conversion:
        return stat_name_conversion[stat_name]
    else:
        return False
    
def load_passing_stats(data):
    """
    Load passing stats into the database.
    
    Args:
        data (pd.DataFrame): The DataFrame containing the passing stats.
    """
    
    # insert query
    insert_query = text("INSERT INTO player_game_passing_stats (schedule_id, player_id, team_id, completions, attempts, yards, touchdowns, interceptions, average_per_attempt, average_per_completion) VALUES (:game_id, :player_id, :team_id, :completions, :attempts, :yards, :touchdowns, :interceptions, :average_per_attempt, :average_per_completion)")
    
    # update query
    update_query = text("UPDATE player_game_passing_stats SET completions = :completions, attempts = :attempts, yards = :yards, touchdowns = :touchdowns, interceptions = :interceptions, average_per_attempt = :average_per_attempt, average_per_completion = :average_per_completion WHERE game_id = :game_id AND player_id = :player_id")
    
    # find team
    team_query = text("SELECT id FROM teams WHERE short_display_name = :school")
    
    # find schedule
    schedule_query = text("SELECT id FROM schedules WHERE id = :game_id")
    
    # check player stat entry exists
    exists_query = text("SELECT id FROM player_game_passing_stats WHERE schedule_id = :game_id AND player_id = :player_id")

    # insert player query
    insert_player_query = text("INSERT INTO players (id) VALUES (:id)")
    
    total = len(data)
    
    for index, row in data.iterrows():
        # print progress at every 100 rows as percent
        if index % 100 == 0:
            print(f"Progress: {index}/{total} ({round(index/total*100, 2)}%)")
        
        game_id = row['id']
        
        # find schedule
        schedule = mysql.connection.execute(schedule_query, {'game_id': game_id}).fetchone()
        if not schedule:
            continue
        
        for team in row['teams']:
            team_id = mysql.connection.execute(team_query, {'school': team['school']}).fetchone()
            
            if not team_id:
                continue
            
            # init empty passing stat object with player id as key
            passing_players_stats = pd.DataFrame(columns=['player_id', 'completions', 'attempts', 'yards', 'touchdowns', 'interceptions', 'average_per_attempt', 'average_per_completion'])
            passing_players_stats.set_index('player_id', inplace=True)
            
            for category in team['categories']:
                if category['name'] == 'passing':
                    for type in category['types']:
                        column_name = convert_stat_name(type['name'])
                        
                        if not column_name and type['name'] != 'C/ATT':
                            print(f"Could not convert stat name: {type['name']}")
                            continue
                        
                        for player in type['athletes']:
                            player_id = player['id']
                            if column_name:
                                passing_players_stats.loc[player_id, column_name] = float(player['stat'])
                            else: # must be C/ATT
                                completions, attempts = player['stat'].split('/')
                                passing_players_stats.loc[player_id, 'completions'] = float(completions)
                                passing_players_stats.loc[player_id, 'attempts'] = float(attempts)
                                

            for player_id, stats in passing_players_stats.iterrows():
                # calculate average per attempt and completion
                stats['average_per_attempt'] = stats['yards'] / stats['attempts']
                stats['average_per_completion'] = stats['yards'] / stats['completions'] if stats['completions'] != 0 else 0
                
                # check if player stat entry exists
                player_stat_exists = mysql.connection.execute(exists_query, {'game_id': game_id, 'player_id': player_id}).fetchone()
                
                stats['game_id'] = game_id
                stats['player_id'] = player_id
                stats['team_id'] = team_id[0]
                if player_stat_exists:
                    # update player stat
                    mysql.connection.execute(update_query, stats.to_dict())
                else:
                    # insert player stat
                    try:
                        mysql.connection.execute(insert_query, stats.to_dict())
                    except:
                        # insert player
                        mysql.connection.execute(insert_player_query, {'id': player_id})
                        # insert player stat
                        mysql.connection.execute(insert_query, stats.to_dict())

    mysql.connection.commit()

load_passing_stats(data)