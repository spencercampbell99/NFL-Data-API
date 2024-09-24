from data_api import LocalhostAPI
from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

# find all games for 2024
find_games_query = text(f"""
    SELECT id
    FROM schedules
    WHERE season = 2024 and week = 3
""")

games = conn.connection.execute(find_games_query).fetchall()

# get the data
api = LocalhostAPI()

total_count = len(games)
completed = 0

for game in games:
    if completed % 100 == 0:
        print(f"{completed} / {total_count} ({completed / total_count * 100}%)")
    
    game_id = game[0]
    data = api.get(f'/api/loaders/boxscores/{game_id}')
    
    completed += 1