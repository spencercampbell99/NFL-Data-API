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

years = list(range(2010, 2024))
data = pd.DataFrame()
for year in years:
    year_data = api_client.call_endpoint('games', params={'year': year, 'seasonType': 'regular'}, verbose=True)
    data = pd.concat([data, pd.DataFrame(year_data)], ignore_index=True)
    
# cols to keep
cols = [
    'id', 'season', 'week', 'season_type', 'start_date', 'completed', 'neutral_site', 'conference_game', 'attendance', 'home_id', 'away_id',
    'home_points', 'away_points', 'home_pregame_elo', 'away_pregame_elo', 'excitement_index',
]

data = data[cols]

# insert query
insert_query = text("INSERT INTO schedules (id, season, week, season_type, game_date, game_time, completed, neutral_site, conference_game, attendance, home_team_id, away_team_id, home_points, away_points, home_pregame_elo, away_pregame_elo, excitement_index) VALUES (:id, :season, :week, :season_type, :start_date, :start_time, :completed, :neutral_site, :conference_game, :attendance, :home_id, :away_id, :home_points, :away_points, :home_pregame_elo, :away_pregame_elo, :excitement_index)")

# update query
update_query = text("UPDATE schedules SET season=:season, week=:week, season_type=:season_type, game_date=:start_date, game_time=:start_time, completed=:completed, neutral_site=:neutral_site, conference_game=:conference_game, attendance=:attendance, home_team_id=:home_id, away_team_id=:away_id, home_points=:home_points, away_points=:away_points, home_pregame_elo=:home_pregame_elo, away_pregame_elo=:away_pregame_elo, excitement_index=:excitement_index WHERE id=:id")

# check exists query
check_exists_query = text("SELECT * FROM schedules WHERE id=:id")

# check if both team exists
check_team_exists_query = text("SELECT count(id) FROM teams WHERE id=:home_id or id=:away_id")

# create an instance of the MySQLConnection
conn = MySQLConnection()
mysql = conn.connection

total = len(data)
skipped = 0

for index, row in data.iterrows():
    # print every 100 rows with percentage
    if index % 100 == 0:
        print(f"{index}/{total} ({round((index/total)*100, 2)}%)")
    
    # convert NaN to None
    row = row.where(pd.notna(row), None)
    
    # cast ids to ints
    row['id'] = int(row['id'])
    row['home_id'] = int(row['home_id'])
    row['away_id'] = int(row['away_id'])
    
    # check if home team exists
    teams_exist = mysql.execute(check_team_exists_query, {'home_id': row['home_id'], 'away_id': row['away_id']}).fetchone()
    if not teams_exist[0] == 2:
        # print(f"Error: Team with id {row['home_id']} or {row['away_id']} does not exist")
        skipped += 1
        continue
    
    # break datetime stamp into start_time and start_date
    start_date = row['start_date'].split('T')[0]
    start_time = row['start_date'].split('T')[1]
    row['start_date'] = start_date
    row['start_time'] = start_time.split('Z')[0]
    
    # check existance of row
    exists = mysql.execute(check_exists_query, {'id': row['id']}).fetchone()
    if exists:
        mysql.execute(update_query, row.to_dict())
    else:
        mysql.execute(insert_query, row.to_dict())

print(f"{total}/{total} (100%)")
print(f"Skipped {skipped} rows due to irrelavant teams")

mysql.commit()
conn.close()