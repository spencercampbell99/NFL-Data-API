import pandas as pd
import nfl_data_py as nfl

from SQLConnector import MySQLConnection
from sqlalchemy import text

data = nfl.import_players()
    
# Create a connection to the database
conn = MySQLConnection()

num_players = len(data)
completed = 0

# update statement
update_statement = text(f"""
    UPDATE players
    SET active = :active,
        height = :height,
        weight = :weight,
        experience = :years_of_experience,
        draft_club = :draft_club,
        draft_number = :draft_number,
        jersey_number = :uniform_number,
        position = :position,
        rookie_year = :rookie_year,
        headshot_url = :headshot,
        team_id = :current_team_id,
        college = :college,
        date_of_birth = :birth_date
    WHERE id = :player_id
""")

def clean_bad_values(row):
    '''
    Takes in a row and cleans out any bad, unparsable values
    '''
    
    # if years_of_experience, uniform_number, or current_team_id are not parsable as int, set to None
    try:
        row['years_of_experience'] = int(row['years_of_experience'])
    except:
        row['years_of_experience'] = None
    
    try:
        row['uniform_number'] = int(row['uniform_number'])
    except:
        row['uniform_number'] = None
    
    try:
        row['current_team_id'] = int(row['current_team_id'])
    except:
        row['current_team_id'] = None

    return row

# Insert the data into the database
for index, row in data.iterrows():
    if completed % 100 == 0:
        print(f"Completed {completed} of {num_players}")
    completed += 1
    
    # replace any nan values with None
    row = row.where(pd.notnull(row), None)
    
    if row['display_name'] is None or row['gsis_id'] is None or row['gsis_id'] == '':
        print(f"Player {row['display_name']} has no gsis_id")
        continue # probably not an important player
    
    player_id = row['gsis_id'][3:]
    
    # cut any preceding 0s and turn to number
    player_id = int(player_id)
    
    row = clean_bad_values(row)
    
    # build insert dict
    insert_dict = {
        'player_id': player_id,
        'position': row['position'],
        'active': row['status'] == 'ACT',
        'birth_date': row['birth_date'],
        'height': row['height'],
        'weight': row['weight'],
        'college': row['college_name'],
        'headshot': row['headshot'],
        'rookie_year': row['rookie_year'],
        'draft_club': row['draft_club'],
        'draft_number': row['draft_number'],
        'years_of_experience': row['years_of_experience'],
        'uniform_number': row['uniform_number'],
        'current_team_id': row['current_team_id'],
    }
    
    # run update
    try:
        conn.connection.execute(update_statement, insert_dict)
    except Exception as e:
        print(f"Error updating player {player_id}: {e}")
        continue

print("Done loading players")

conn.connection.commit()
conn.connection.close()