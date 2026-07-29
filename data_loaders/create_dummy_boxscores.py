from SQLConnector import MySQLConnection
from sqlalchemy import text

SEASON = 2026
WEEK = 1

find_games_query = text("""
    SELECT id, home_team_id, away_team_id, home_team_char_id, away_team_char_id
    FROM schedules
    WHERE season = :season and week = :week
""")

create_boxscore_query = text("""
    INSERT INTO box_scores
    (schedule_id, team_id, opponent_id, home_team, team_char_id)
    VALUES
    (:game_id, :team_id, :opponent_id, :home_team, :team_char_id)
""")

find_boxscore_query = text("""
    SELECT id
    FROM box_scores
    WHERE schedule_id = :game_id and team_id = :team_id
""")

def main():
    conn = MySQLConnection()
    created = 0
    try:
        games = conn.connection.execute(
            find_games_query,
            {'season': SEASON, 'week': WEEK}
        ).fetchall()

        # Create any missing home/away box scores for each game.
        for game in games:
            game_id = game[0]
            home_team_id = game[1]
            away_team_id = game[2]
            home_team_char_id = game[3]
            away_team_char_id = game[4]

            home_boxscore = conn.connection.execute(
                find_boxscore_query,
                {'game_id': game_id, 'team_id': home_team_id}
            ).fetchone()
            away_boxscore = conn.connection.execute(
                find_boxscore_query,
                {'game_id': game_id, 'team_id': away_team_id}
            ).fetchone()

            if home_boxscore is None:
                conn.connection.execute(create_boxscore_query, {
                    'game_id': game_id,
                    'team_id': home_team_id,
                    'opponent_id': away_team_id,
                    'home_team': 1,
                    'team_char_id': home_team_char_id
                })
                created += 1
                print(f"Created boxscore for game {game_id} and team {home_team_char_id}")

            if away_boxscore is None:
                conn.connection.execute(create_boxscore_query, {
                    'game_id': game_id,
                    'team_id': away_team_id,
                    'opponent_id': home_team_id,
                    'home_team': 0,
                    'team_char_id': away_team_char_id
                })
                created += 1
                print(f"Created boxscore for game {game_id} and team {away_team_char_id}")

        conn.connection.commit()
        print(f"Done. Created {created} missing box scores.")
    except Exception:
        conn.connection.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()