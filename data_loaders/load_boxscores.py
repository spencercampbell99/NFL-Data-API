from data_api import LocalhostAPI
from SQLConnector import MySQLConnection
from sqlalchemy import text

SEASON = 2025
WEEK = 1

find_games_query = text("""
    SELECT id
    FROM schedules
    WHERE season = :season and week >= :week
""")

delete_player_game_stats_query = text("""
    DELETE FROM player_game_stats
    WHERE boxscore_id IN (SELECT id FROM box_scores WHERE schedule_id IN (SELECT id FROM schedules WHERE season = :season and week >= :week))
""")

delete_boxscore_query = text("""
    DELETE FROM box_scores
    WHERE schedule_id IN (SELECT id FROM schedules WHERE season = :season and week >= :week)
""")

def main():
    conn = MySQLConnection()
    try:
        params = {'season': SEASON, 'week': WEEK}
        games = conn.connection.execute(find_games_query, params).fetchall()

        try:
            conn.connection.execute(delete_player_game_stats_query, params)
            conn.connection.execute(delete_boxscore_query, params)
            conn.connection.commit()
        except Exception as e:
            conn.connection.rollback()
            print(f"Failed to delete existing box score data: {e}")
            raise

        api = LocalhostAPI()
        total_count = len(games)
        completed = 0
        failures = 0

        for game in games:
            if completed % 100 == 0:
                pct = (completed / total_count * 100) if total_count else 100
                print(f"{completed} / {total_count} ({pct:.2f}%)")

            game_id = game[0]
            try:
                api.get(f'/api/loaders/boxscores/{game_id}')
            except Exception as e:
                failures += 1
                print(f"Failed to load boxscore for game {game_id}: {e}")

            completed += 1

        print(f"Done. Loaded {completed - failures}/{total_count} games.")
    finally:
        conn.close()


if __name__ == '__main__':
    main()