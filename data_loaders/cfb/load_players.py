import pandas as pd
from CfbSQLConnector import MySQLConnection
from CollegeFootballDataApi import APIClient
from sqlalchemy import text

print("\n\n\nWARNING: Teams must be loaded before players. Run load_teams.py first. \n\n\n")

# create mysql conncetion and load teams
mysql = MySQLConnection()
teams = mysql.connection.execute(text("SELECT * FROM teams")).fetchall()
teams = pd.DataFrame(teams)

# create an instance of the APIClient with your API key
try:
    api_client = APIClient()
except FileNotFoundError:
    print("Error: cfb_api_key.txt file not found. Create the file in /cfb with your API key and try again.")
    exit()
    
# player insert query
insert_query = text(f"""
    INSERT INTO players
        (id, team_id, first_name, last_name, full_name, position, number, weight, height)
    VALUES
        (:id, :team_id, :firstName, :lastName, :name, :position, :jersey, :weight, :height)
""")

# update query
update_query = text(f"""
    UPDATE players
    SET team_id=:team_id, first_name=:firstName, last_name=:lastName, full_name=:name, position=:position, number=:jersey, weight=:weight, height=:height
    WHERE id=:id
""")

# check exists query
check_exists_query = text("SELECT * FROM players WHERE id=:id")

for index, team in teams.iterrows():
    print(f"Loading players for {team['short_display_name']} ({index+1}/{len(teams)})")
    
    # call the 'roster' endpoint to get a list of all players for the team
    roster = api_client.call_endpoint('player/search', params={'searchTerm': ' ', 'team': team['short_display_name']})
    roster = pd.DataFrame(roster)
    
    for index, player in roster.iterrows():
        # create a dictionary from the row using the col_mapping
        player['team_id'] = team['id']
        
        # convert nan to None
        player = player.where(pd.notna(player), None)
        
        # drop extra columns
        player = player.drop(['hometown', 'teamColor', 'teamColorSecondary', 'team'])
        
        # check if team exists
        player_exists = mysql.connection.execute(check_exists_query, {'id': player['id']}).fetchone()
        if player_exists:
            mysql.connection.execute(update_query, player.to_dict())
        else:
            mysql.connection.execute(insert_query, player.to_dict())
    
    # commit
    mysql.connection.commit()
    
print("Done.")
mysql.close()