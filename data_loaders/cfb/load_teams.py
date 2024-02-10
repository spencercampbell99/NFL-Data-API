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

# call the 'teams' endpoint to get a list of all teams
teams = api_client.call_endpoint('teams/fbs')

# convert the list of teams to a DataFrame
teams_df = pd.DataFrame(teams)

# drop twitter and location columns
teams_df = teams_df.drop(columns=['twitter', 'location', 'alt_name1', 'alt_name2', 'alt_name3'])

# convert the logos column to be a string with first index
teams_df['logos'] = teams_df['logos'].apply(lambda x: x[0])

print(teams_df.columns)

# col mapping
col_mapping = {
    'id': 'id',
    'school': 'short_display_name',
    'abbreviation': 'char_id',
    'conference': 'conference',
    'division': 'division',
    'color': 'color1',
    'alt_color': 'color2',
    'logos': 'logo'
}

# sql insert query
insert_query = text("INSERT INTO teams (id, short_display_name, name, char_id, conference, division, color1, color2, logo) VALUES (:id, :short_display_name, :name, :char_id, :conference, :division, :color1, :color2, :logo)")

# update query
update_query = text("UPDATE teams SET short_display_name=:short_display_name, name=:name, char_id=:char_id, conference=:conference, division=:division, color1=:color1, color2=:color2, logo=:logo WHERE id=:id")

# check exists query
check_exists_query = text("SELECT * FROM teams WHERE id=:id")

# create an instance of the MySQLConnection
mysql = MySQLConnection()

for index, row in teams_df.iterrows():
    # create a dictionary from the row using the col_mapping
    row = row.rename(col_mapping)
    row['name'] = row['short_display_name'] + ' ' + row['mascot']
    
    # drop extra columns
    row = row.drop(['mascot'])
    
    print(row.to_dict())
    
    # check if team exists
    team_exists = mysql.connection.execute(check_exists_query, {'id': row['id']}).fetchone()
    if team_exists:
        # update team
        mysql.connection.execute(update_query, row.to_dict())
    else:
        # insert team
        mysql.connection.execute(insert_query, row.to_dict())

mysql.connection.commit()

# close the connection
mysql.close()