import pandas as pd
import nfl_data_py as nfl
from SQLConnector import MySQLConnection
from sqlalchemy import text

YEARS = list(range(2026, 2027))
MAX_WEEK = 25

# columns to keep
cols = [
    'game_id', 'season', 'week', 'game_type', 'gameday', 'weekday', 'gametime', 'away_team', 'home_team',
    'home_score', 'away_score', 'total', 'overtime', 'espn', 'location', 'away_rest', 'home_rest',
    'away_moneyline', 'home_moneyline', 'spread_line', 'total_line', 'div_game', 'roof', 'surface', 'temp', 'wind'
]

# team conversion dictionary
team_conversion = {
    'OAK': 'LV',
    'SD': 'LAC',
    'STL': 'LA'
}

find_team_id = text("""
    SELECT id
    FROM teams
    WHERE char_id = :team
""")

insert_statement = text("""
    INSERT INTO schedules (game_uid, season, week, game_type, date, weekday, time, away_team_id, home_team_id, home_score, away_score, total, espn_id, neutral_site, away_rest, home_rest, away_moneyline, home_moneyline, spread, over_under, division_game, roof, surface, temperature, wind, away_team_char_id, home_team_char_id)
    VALUES (:game_id, :season, :week, :game_type, :gameday, :weekday, :gametime, :away_team_id, :home_team_id, :home_score, :away_score, :total, :espn, :location, :away_rest, :home_rest, :away_moneyline, :home_moneyline, :spread_line, :total_line, :div_game, :roof, :surface, :temp, :wind, :away_team, :home_team)
""")

update_statement = text("""
    UPDATE schedules
    SET season = :season, week = :week, game_type = :game_type, date = :gameday, weekday = :weekday, time = :gametime, away_team_id = :away_team_id, home_team_id = :home_team_id, home_score = :home_score, away_score = :away_score, total = :total, espn_id = :espn, neutral_site = :location, away_rest = :away_rest, home_rest = :home_rest, away_moneyline = :away_moneyline, home_moneyline = :home_moneyline, spread = :spread_line, over_under = :total_line, division_game = :div_game, roof = :roof, surface = :surface, temperature = :temp, wind = :wind, away_team_char_id = :away_team, home_team_char_id = :home_team
    WHERE game_uid = :game_id
""")

find_game_query = text("""
    SELECT game_uid, id
    FROM schedules
    WHERE game_uid = :game_id
""")

def main():
    schedule = nfl.import_schedules(YEARS)
    schedule = schedule[cols].copy()

    completed = 0
    total = len(schedule)

    conn = MySQLConnection()
    try:
        # Insert/update the data in the database.
        for _, row in schedule.iterrows():
            if row['week'] < 1 or row['week'] > MAX_WEEK:
                continue

            if completed % 100 == 0:
                pct = (completed / total * 100) if total else 100
                print(f'{completed}/{total} ({pct:.2f}%)')

            row = row.where(pd.notnull(row), None)

            if row['away_team'] in team_conversion:
                row['away_team'] = team_conversion[row['away_team']]
            if row['home_team'] in team_conversion:
                row['home_team'] = team_conversion[row['home_team']]

            away_team = row['away_team']
            home_team = row['home_team']
            away_team_id = conn.connection.execute(find_team_id, {'team': away_team}).fetchone()
            home_team_id = conn.connection.execute(find_team_id, {'team': home_team}).fetchone()
            if away_team_id is None or home_team_id is None:
                print(f'Could not find team {away_team} or {home_team}')
                completed += 1
                continue

            row['location'] = row['location'] == 'Home'

            game_id = row['game_id']
            game = conn.connection.execute(find_game_query, {'game_id': game_id}).fetchone()
            if game is None:
                row['away_team_id'] = away_team_id[0]
                row['home_team_id'] = home_team_id[0]
                conn.connection.execute(insert_statement, row.to_dict())
            else:
                row = row.drop('game_id')
                row['game_id'] = game_id
                row['away_team_id'] = away_team_id[0]
                row['home_team_id'] = home_team_id[0]
                conn.connection.execute(update_statement, row.to_dict())

            completed += 1

        conn.connection.commit()
        print('Done')
    except Exception:
        conn.connection.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()