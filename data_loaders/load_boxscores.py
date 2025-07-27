from data_api import LocalhostAPI
from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

season = 2025
week = 18

# find all games for 2025
find_games_query = text(f"""
    SELECT id
    FROM schedules
    WHERE season = {season} and week = {week}
""")

games = conn.connection.execute(find_games_query).fetchall()

# delete all player_game_stats for the box scores
delete_player_game_stats_query = text(f"""
    DELETE FROM player_game_stats
    WHERE boxscore_id IN (SELECT id FROM box_scores WHERE schedule_id IN (SELECT id FROM schedules WHERE season = {season} and week = {week}))
""")

# delete box scores for games
delete_boxscore_query = text(f"""
    DELETE FROM box_scores
    WHERE schedule_id IN (SELECT id FROM schedules WHERE season = {season} and week = {week})
""")

try:
    conn.connection.execute(delete_player_game_stats_query)
    conn.connection.execute(delete_boxscore_query)
    conn.connection.commit()
except Exception as e:
    print(e)

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