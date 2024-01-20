import pandas as pd
import nfl_data_py as nfl

# Load the teams data
teams = nfl.import_team_desc()

# Print the first few rows
print(teams.head())

print(teams.columns)

# columns to keep
cols = ['team_id', 'team_name', 'team_abbr', 'team_nick', 'team_conf', 'team_division', 'team_color', 'team_color2', 'team_color3', 'team_color4', 'team_logo_wikipedia', 'team_logo_squared']

teams = teams[cols]

from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

# insert statement
insert_statement = text(f"""
    INSERT INTO teams (id, name, char_id, short_display_name, conference, division, color1, color2, color3, color4, team_logo_wikipedia, team_logo_squared, slug)
    VALUES (:team_id, :team_name, :team_abbr, :team_nick, :team_conf, :team_division, :team_color, :team_color2, :team_color3, :team_color4, :team_logo_wikipedia, :team_logo_squared, :slug)
""")

# update statement
update_statement = text(f"""
    UPDATE teams
    SET name = :team_name, char_id = :team_abbr, short_display_name = :team_nick, conference = :team_conf, division = :team_division, color1 = :team_color, color2 = :team_color2, color3 = :team_color3, color4 = :team_color4, team_logo_wikipedia = :team_logo_wikipedia, team_logo_squared = :team_logo_squared, slug = :slug
    WHERE id = :team_id
""")

# Insert the data into the database
for index, row in teams.iterrows():
    # replace any nan values with None
    row = row.where(pd.notnull(row), None)
    
    # add slug to row as lower case team name with spaces replaced with dashes
    row['slug'] = row['team_name'].lower().replace(' ', '-')
    
    team_id = row['team_id']
    # Check if the team already exists in the database
    query = text("SELECT id FROM teams WHERE id = :team_id")
    result = conn.connection.execute(query, {'team_id': team_id})
    if result.fetchone() is None:
        print(f"Inserting team {row['team_abbr']} into the database")
        conn.connection.execute(insert_statement, row.to_dict())
    else:
        print(f"Updating team {row['team_abbr']} in the database")
        
        # drop team_id from row and move to end of row
        row = row.drop('team_id')
        row['team_id'] = team_id
        conn.connection.execute(update_statement, row.to_dict())

conn.connection.commit()
conn.close()