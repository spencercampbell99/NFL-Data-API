import pandas as pd
import nfl_data_py as nfl

# load weekly data
years = list(range(2010, 2024))
data = nfl.import_weekly_data(years)

# cols to keep
cols = ['fantasy_points', 'fantasy_points_ppr', 'season', 'week', 'player_id', 'recent_team']

data = data[cols]

from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

# find team query
find_team_query = text(f"""
    SELECT id FROM teams WHERE char_id = :team
""")

# find schedule query
find_schedule_query = text(f"""
    SELECT id FROM schedules WHERE season = :season AND week = :week AND (home_team_char_id = :team OR away_team_char_id = :team)
""")

# insert query
insert_statement = text(f"""
    INSERT INTO fantasy_player_performances (schedule_id, season, week, player_id, team_id, fantasy_points, ppr)
    VALUES (:schedule_id, :season, :week, :player_id, :team_id, :fantasy_points, :fantasy_points_ppr)
""")

# update query
update_statement = text(f"""
    UPDATE fantasy_player_performances
    SET team_id = :team_id, fantasy_points = :fantasy_points, ppr = :fantasy_points_ppr
    WHERE schedule_id = :schedule_id
""")

# check query
check_query = text(f"""
    SELECT schedule_id FROM fantasy_player_performances WHERE player_id = :player_id AND season = :season AND week = :week
""")

completed = 0
total = len(data)

# iterate through the data
for index, row in data.iterrows():
    # print percent completion if divisible by 100
    if completed % 100 == 0:
        print(f"{completed} / {total} ({completed / total * 100}%)")
    
    # skip if player id na
    if pd.isna(row['player_id']):
        completed += 1
        continue
    
    # remove 00- from player id
    row['player_id'] = row['player_id'][3:] # drop 00- preceeding
    
    # get the team id
    team_id = conn.connection.execute(find_team_query, {'team': row['recent_team']}).fetchone()
    if team_id:
        team_id = team_id[0]
    else:
        completed += 1
        continue

    # get the schedule id
    schedule_id = conn.connection.execute(find_schedule_query, {'season': row['season'], 'week': row['week'], 'team': row['recent_team']}).fetchone()
    if schedule_id:
        schedule_id = schedule_id[0]
    else:
        completed += 1
        continue

    # check if the record exists
    exists = conn.connection.execute(check_query, {'player_id': row['player_id'], 'season': row['season'], 'week': row['week']}).fetchone()
    
    row['schedule_id'] = schedule_id
    row['team_id'] = team_id
    row = row.drop(['recent_team'])
    
    if exists:
        # update the record
        conn.connection.execute(update_statement, row.to_dict())
    else:
        # insert the record
        conn.connection.execute(insert_statement, row.to_dict())
    
    completed += 1

print(f"{completed} / {total} ({completed / total * 100}%)")

conn.connection.commit()
conn.close()