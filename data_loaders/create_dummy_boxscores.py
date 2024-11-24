from SQLConnector import MySQLConnection
from sqlalchemy import text

# Create a connection to the database
conn = MySQLConnection()

# find all games for 2024
find_games_query = text(f"""
    SELECT id, home_team_id, away_team_id, home_team_char_id, away_team_char_id
    FROM schedules
    WHERE season = 2024 and week = 12
""")

games = conn.connection.execute(find_games_query).fetchall()

# create boxscore query
create_boxscore_query = text(f"""
    INSERT INTO box_scores
    (schedule_id, team_id, opponent_id, home_team, team_char_id)
    VALUES
    (:game_id, :team_id, :opponent_id, :home_team, :team_char_id)
""")

# find boxscore
find_boxscore_query = text(f"""
    SELECT id
    FROM box_scores
    WHERE schedule_id = :game_id and team_id = :team_id
""")

# loop through games and create dummy box_scores if missing
for game in games:
    game_id = game[0]
    home_team_id = game[1]
    away_team_id = game[2]
    home_team_char_id = game[3]
    away_team_char_id = game[4]
    
    # check if boxscore exists
    home_boxscore = conn.connection.execute(find_boxscore_query, {'game_id': game_id, 'team_id': home_team_id}).fetchone()
    away_boxscore = conn.connection.execute(find_boxscore_query, {'game_id': game_id, 'team_id': away_team_id}).fetchone()

    if home_boxscore is None:
        conn.connection.execute(create_boxscore_query, {
            'game_id': game_id,
            'team_id': home_team_id,
            'opponent_id': away_team_id,
            'home_team': 1,
            'team_char_id': home_team_char_id
        })
        print(f"Created boxscore for game {game_id} and team {home_team_char_id}")

    if away_boxscore is None:
        conn.connection.execute(create_boxscore_query, {
            'game_id': game_id,
            'team_id': away_team_id,
            'opponent_id': home_team_id,
            'home_team': 0,
            'team_char_id': away_team_char_id
        })
        print(f"Created boxscore for game {game_id} and team {away_team_char_id}")
    
conn.connection.commit()
conn.connection.close()