import pandas as pd
import nfl_data_py as nfl

# Load the players data
years = list(range(2010, 2024))
players = nfl.import_seasonal_rosters(years)

# keep only the latest season entry for each player
players = players.sort_values(by='season')
players = players.drop_duplicates(subset=['player_id'], keep='last')

# Print the first few rows
print(players.columns)

# columns to keep
cols = [
    'team', 'player_id', 'position', 'depth_chart_position', 'jersey_number', 'status', 'player_name', 'first_name', 'last_name', 'birth_date', 'height', 'weight', 'college', 'espn_id',
    'headshot_url', 'rookie_year', 'draft_club', 'draft_number', 'season', 'years_exp'
]

players = players[cols]

# first_player = players.iloc[0]

# for col in players.columns:
#     print(f"{col}: {first_player[col]}")

from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

# insert statement
insert_statement = text(f"""
    INSERT INTO players (id, position, jersey_number, active, full_name, first_name, last_name, date_of_birth, height, weight, college, espn_id, headshot_url, rookie_year, draft_club, draft_number, experience)
    VALUES (:player_id, :position, :jersey_number, :active, :player_name, :first_name, :last_name, :birth_date, :height, :weight, :college, :espn_id, :headshot_url, :rookie_year, :draft_club, :draft_number, :years_exp)
""")

# update statement
update_statement = text(f"""
    UPDATE players
    SET position = :position, jersey_number = :jersey_number, active = :active, full_name = :player_name, first_name = :first_name, last_name = :last_name, date_of_birth = :birth_date, height = :height, weight = :weight, college = :college, espn_id = :espn_id, headshot_url = :headshot_url, rookie_year = :rookie_year, draft_club = :draft_club, draft_number = :draft_number, experience = :years_exp
    WHERE id = :player_id
""")

# Insert the data into the database
for index, row in players.iterrows():
    # replace any nan values with None
    row = row.where(pd.notnull(row), None)
    
    if row['player_name'] is None:
        continue # probably not an important player
    
    # if season = 2023 then player is active
    row['active'] = row['season'] == 2023
    row.drop(['season', 'status'], inplace=True)
    
    row['player_id'] = row['player_id'][3:] # drop 00- preceeding
    player_id = row['player_id']
    # Check if the player already exists in the database
    query = text("SELECT id FROM players WHERE id = :player_id")
    result = conn.connection.execute(query, {'player_id': player_id})
    if result.fetchone() is None:
        print(f"Inserting player {row['player_name']} into the database")
        conn.connection.execute(insert_statement, row.to_dict())
    else:
        print(f"Updating player {row['player_name']} in the database")
        
        # drop player_id from row and move to end of row
        row = row.drop('player_id')
        row['player_id'] = player_id
        conn.connection.execute(update_statement, row.to_dict())

conn.connection.commit()
conn.close()