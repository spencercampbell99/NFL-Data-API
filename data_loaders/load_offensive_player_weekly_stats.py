import pandas as pd
import nfl_data_py as nfl

# load weekly data
years = list(range(2024, 2025))
data = nfl.import_weekly_data(years)

# columns to keep
cols = [
    'season', 'week', 'season_type', 'player_id', 'recent_team', 'position', 'position_group', # metadata
    'completions', 'attempts', 'passing_yards', 'passing_tds', 'interceptions', 'sacks', 'sack_yards', # passing
    'sack_fumbles_lost', 'passing_air_yards', 'passing_yards_after_catch', 'passing_first_downs', 'passing_epa', 'passing_2pt_conversions', # passing
    'pacr', 'dakota', # passing
    'carries', 'rushing_yards', 'rushing_tds', 'rushing_first_downs', 'rushing_epa', 'rushing_2pt_conversions', 'rushing_fumbles_lost', # rushing
    'receptions', 'targets', 'receiving_yards', 'receiving_tds', 'receiving_first_downs', 'receiving_epa', 'receiving_2pt_conversions', 'receiving_air_yards', 'receiving_yards_after_catch', 'receiving_fumbles_lost', # receiving
    'racr', 'target_share', 'wopr', 'air_yards_share' # receiving
]

data = data[cols]

from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

# find team query
find_team_query = text(f"""
    SELECT id FROM teams WHERE char_id = :team
""")

# insert query
insert_statement = text(f"""
    INSERT INTO player_game_stats (game_id, season, week, player_id, team_id, position, position_group, passing_completions, passing_attempts, passing_yards, passing_touchdowns, passing_interceptions, passing_sacks, passing_sack_yards, passing_sack_fumbles_lost, passing_air_yards, passing_yards_after_catch, passing_first_downs, passing_epa, passing_2pt_conversions, pacr, dakota, rushing_attempts, rushing_yards, rushing_touchdowns, rushing_first_downs, rushing_epa, rushing_2pt_conversions, rushing_fumbles_lost, receptions, targets, receiving_yards, receiving_touchdowns, receiving_first_downs, receiving_epa, receiving_2pt_conversions, receiving_air_yards, receiving_yards_after_catch, receiving_fumbles_lost, racr, target_share, wopr, air_yards_share)
    VALUES (:game_id, :season, :week, :player_id, :recent_team, :position, :position_group, :completions, :attempts, :passing_yards, :passing_tds, :interceptions, :sacks, :sack_yards, :sack_fumbles_lost, :passing_air_yards, :passing_yards_after_catch, :passing_first_downs, :passing_epa, :passing_2pt_conversions, :pacr, :dakota, :carries, :rushing_yards, :rushing_tds, :rushing_first_downs, :rushing_epa, :rushing_2pt_conversions, :rushing_fumbles_lost, :receptions, :targets, :receiving_yards, :receiving_tds, :receiving_first_downs, :receiving_epa, :receiving_2pt_conversions, :receiving_air_yards, :receiving_yards_after_catch, :receiving_fumbles_lost, :racr, :target_share, :wopr, :air_yards_share)
""")

# update query
update_statement = text(f"""
    UPDATE player_game_stats
    SET team_id = :recent_team, position = :position, position_group = :position_group, passing_completions = :completions, passing_attempts = :attempts, passing_yards = :passing_yards, passing_touchdowns = :passing_tds, passing_interceptions = :interceptions, passing_sacks = :sacks, passing_sack_yards = :sack_yards, passing_sack_fumbles_lost = :sack_fumbles_lost, passing_air_yards = :passing_air_yards, passing_yards_after_catch = :passing_yards_after_catch, passing_first_downs = :passing_first_downs, passing_epa = :passing_epa, passing_2pt_conversions = :passing_2pt_conversions, pacr = :pacr, dakota = :dakota, rushing_attempts = :carries, rushing_yards = :rushing_yards, rushing_touchdowns = :rushing_tds, rushing_first_downs = :rushing_first_downs, rushing_epa = :rushing_epa, rushing_2pt_conversions = :rushing_2pt_conversions, rushing_fumbles_lost = :rushing_fumbles_lost, receptions = :receptions, targets = :targets, receiving_yards = :receiving_yards, receiving_touchdowns = :receiving_tds, receiving_first_downs = :receiving_first_downs, receiving_epa = :receiving_epa, receiving_2pt_conversions = :receiving_2pt_conversions, receiving_air_yards = :receiving_air_yards, receiving_yards_after_catch = :receiving_yards_after_catch, receiving_fumbles_lost = :receiving_fumbles_lost, racr = :racr, target_share = :target_share, wopr = :wopr, air_yards_share = :air_yards_share
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# update aggregates query (yards/reception, yards/carry, etc.)
update_aggregates_statement = text(f"""
    UPDATE player_game_stats
    SET yards_per_rush_attempt = CASE WHEN rushing_attempts = 0 THEN 0 ELSE rushing_yards / rushing_attempts END, 
        yards_per_reception = CASE WHEN receptions = 0 THEN 0 ELSE receiving_yards / receptions END, 
        yards_per_pass_attempt = CASE WHEN passing_attempts = 0 THEN 0 ELSE passing_yards / passing_attempts END, 
        yards_per_pass_completion = CASE WHEN passing_completions = 0 THEN 0 ELSE passing_yards / passing_completions END
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

check_query = text(f"""
    SELECT season FROM player_game_stats WHERE season = :season AND week = :week AND player_id = :player_id
""")

# find schedule query
find_schedule_query = text(f"""
    SELECT id, espn_id FROM schedules WHERE season = :season AND week = :week AND (home_team_char_id = :team OR away_team_char_id = :team)
""")

espn_game_ids = []

completed = 0
total = len(data)

# insert/update the data into the database
for index, row in data.iterrows():
    # if row week less than 6 then skip
    if row['week'] < 6:
        completed += 1
        continue
    
    # print percent completion if divisible by 100
    if completed % 100 == 0:
        print(f"{completed} / {total} ({completed / total * 100}%)")
    
    # skip preseason
    if row['season_type'] == 'PRE':
        completed += 1
        continue
    
    # replace any nan values with None
    row = row.where(pd.notnull(row), None)
    
    if row['player_id'] is None:
        completed += 1
        continue

    # find the schedule id
    schedule_id = conn.connection.execute(find_schedule_query, {'season': row['season'], 'week': row['week'], 'team': row['recent_team']}).fetchone()
    if schedule_id is None:
        completed += 1
        print(f"Schedule not found for {row['recent_team']} in week {row['week']} of {row['season']}")
        continue
    
    espn_game_ids.append(schedule_id[1])
    
    row['game_id'] = schedule_id[0]

    row['player_id'] = row['player_id'][3:] # drop 00- preceeding
        
    # find team
    team_id = conn.connection.execute(find_team_query, {'team': row['recent_team']}).fetchone()
    
    if team_id is None:
        completed += 1
        continue
    
    row['recent_team'] = team_id[0]
    
    # if season < 2021 then set week equal to 17 + week if season_type = 'POST'
    if row['season'] < 2021 and row['season_type'] == 'POST':
        row['week'] = 17 + row['week']
    elif row['season'] >= 2021 and row['season_type'] == 'POST':
        row['week'] = 18 + row['week']
    
    # Check if the player already exists in the database
    result = conn.connection.execute(check_query, {'season': row['season'], 'week': row['week'], 'player_id': row['player_id']})
    if result.fetchone() is None:
        conn.connection.execute(insert_statement, row.to_dict())
    else:
        conn.connection.execute(update_statement, row.to_dict())
    
    # update aggregates
    conn.connection.execute(update_aggregates_statement, {'season': row['season'], 'week': row['week'], 'player_id': row['player_id']})
    
    completed += 1

conn.connection.commit()
conn.close()

# ask to update extra player stats from api
if input("Update extra player stats? (y/n): ") != 'y':
    conn.connection.commit()
    conn.close()
    exit()

# initaite the api connection
from data_api import LocalhostAPI
api = LocalhostAPI()

# make espn game ids unique
espn_game_ids = list(set(espn_game_ids))

count = len(espn_game_ids)
completed = 0

for game_id in espn_game_ids:
    if completed % 10 == 0:
        print(f"{completed} / {count} ({completed / count * 100}%)")
    
    api.get(f'/api/loaders/playerStats/{game_id}')
    completed += 1