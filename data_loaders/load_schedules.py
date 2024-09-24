import pandas as pd
import nfl_data_py as nfl

# Load the schedule data
years = list(range(2024, 2025))
schedule = nfl.import_schedules(years)

# print(schedule.head())
# print(schedule.columns)

# get first and print values
# first = schedule.iloc[0]
# for columns in schedule.columns:
#     print(f'{columns}: {first[columns]}')

# columns to keep
cols = [
    'game_id', 'season', 'week', 'game_type', 'gameday', 'weekday', 'gametime', 'away_team', 'home_team',
    'home_score', 'away_score', 'total', 'overtime', 'espn', 'location', 'away_rest', 'home_rest',
    'away_moneyline', 'home_moneyline', 'spread_line', 'total_line', 'div_game', 'roof', 'surface', 'temp', 'wind'
]

from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

find_team_id = text(f"""
    SELECT id
    FROM teams
    WHERE char_id = :team
""")

insert_statement = text(f"""
    INSERT INTO schedules (game_uid, season, week, game_type, date, weekday, time, away_team_id, home_team_id, home_score, away_score, total, espn_id, neutral_site, away_rest, home_rest, away_moneyline, home_moneyline, spread, over_under, division_game, roof, surface, temperature, wind, away_team_char_id, home_team_char_id)
    VALUES (:game_id, :season, :week, :game_type, :gameday, :weekday, :gametime, :away_team_id, :home_team_id, :home_score, :away_score, :total, :espn, :location, :away_rest, :home_rest, :away_moneyline, :home_moneyline, :spread_line, :total_line, :div_game, :roof, :surface, :temp, :wind, :away_team, :home_team)
""")

update_statement = text(f"""
    UPDATE schedules
    SET season = :season, week = :week, game_type = :game_type, date = :gameday, weekday = :weekday, time = :gametime, away_team_id = :away_team_id, home_team_id = :home_team_id, home_score = :home_score, away_score = :away_score, total = :total, espn_id = :espn, neutral_site = :location, away_rest = :away_rest, home_rest = :home_rest, away_moneyline = :away_moneyline, home_moneyline = :home_moneyline, spread = :spread_line, over_under = :total_line, division_game = :div_game, roof = :roof, surface = :surface, temperature = :temp, wind = :wind, away_team_char_id = :away_team, home_team_char_id = :home_team
    WHERE game_uid = :game_id
""")

find_game_query = text(f"""
    SELECT game_uid, id
    FROM schedules
    WHERE game_uid = :game_id
""")

completed = 0
total = len(schedule)

# team conversion dictionary
team_conversion = {
    'OAK': 'LV',
    'SD': 'LAC',
    'STL': 'LA'
}

# Insert the data into the database
for index, row in schedule.iterrows():
    if row['week'] < 4:
        continue
    
    # print % progress every 100 rows
    if completed % 100 == 0:
        print(f'{completed}/{total} ({completed/total*100:.2f}%)')
    
    # replace any nan values with None
    row = row.where(pd.notnull(row), None)
    
    # if either away or home team is in the conversion dictionary, convert it
    if row['away_team'] in team_conversion:
        row['away_team'] = team_conversion[row['away_team']]
    if row['home_team'] in team_conversion:
        row['home_team'] = team_conversion[row['home_team']]
    
    # try to find teams
    away_team = row['away_team']
    home_team = row['home_team']
    away_team_id = conn.connection.execute(find_team_id, {'team': away_team}).fetchone()
    home_team_id = conn.connection.execute(find_team_id, {'team': home_team}).fetchone()
    if away_team_id is None or home_team_id is None:
        print(f'Could not find team {away_team} or {home_team}')
        completed += 1
        continue
    
    if row['location'] == 'Home':
        row['location'] = True
    else:
        row['location'] = False

    # check if game already exists
    game_id = row['game_id']
    game = conn.connection.execute(find_game_query, {'game_id': game_id} ).fetchone()
    if game is None:
        row['away_team_id'] = away_team_id[0]
        row['home_team_id'] = home_team_id[0]
        conn.connection.execute(insert_statement, row.to_dict())
    else:
        # move game_id to the end
        row = row.drop('game_id')
        row['game_id'] = game_id
        
        row['away_team_id'] = away_team_id[0]
        row['home_team_id'] = home_team_id[0]
        conn.connection.execute(update_statement, row.to_dict())
    
    completed += 1
    
print('Done')

conn.connection.commit()
conn.close()