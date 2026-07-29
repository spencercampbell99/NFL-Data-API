import pandas as pd
import nfl_data_py as nfl
from SQLConnector import MySQLConnection
from sqlalchemy import text
from data_api import LocalhostAPI

YEARS = list(range(2025, 2026))
MIN_WEEK = 1
MAX_WEEK = 25


def ask_yes_no(prompt):
    while True:
        response = input(prompt).strip().lower()
        if response in {'y', 'n'}:
            return response == 'y'
        print("Please enter 'y' or 'n'.")


def ask_load_mode():
    while True:
        response = input("Load mode: [s]kip existing (default) or [o]verwrite existing? (s/o): ").strip().lower()
        if response in {'', 's', 'skip'}:
            return 'skip'
        if response in {'o', 'overwrite'}:
            return 'overwrite'
        print("Please enter 's' (skip) or 'o' (overwrite).")


def normalize_player_id(raw_player_id):
    if raw_player_id is None:
        return None

    player_id = str(raw_player_id).strip()
    if player_id.startswith('00-'):
        player_id = player_id[3:]

    if player_id == '' or not player_id.isnumeric():
        return None

    return str(int(player_id))


# load weekly data
data = nfl.import_weekly_data(YEARS)

# keep only data from offensive players
data = data[data['position_group'].isin(['QB', 'RB', 'WR', 'TE', 'OL'])]

# columns to keep
cols = [
    'season', 'week', 'season_type', 'player_id', 'team', 'position', 'position_group', # metadata
    'completions', 'attempts', 'passing_yards', 'passing_tds', 'passing_interceptions', 'sacks_suffered', 'sack_yards_lost', # passing
    'sack_fumbles_lost', 'passing_air_yards', 'passing_yards_after_catch', 'passing_first_downs', 'passing_epa', 'passing_2pt_conversions', # passing
    'pacr', # passing
    'carries', 'rushing_yards', 'rushing_tds', 'rushing_first_downs', 'rushing_epa', 'rushing_2pt_conversions', 'rushing_fumbles_lost', # rushing
    'receptions', 'targets', 'receiving_yards', 'receiving_tds', 'receiving_first_downs', 'receiving_epa', 'receiving_2pt_conversions', 'receiving_air_yards', 'receiving_yards_after_catch', 'receiving_fumbles_lost', # receiving
    'racr', 'target_share', 'wopr', 'air_yards_share' # receiving
]

data = data[cols]

# find team query
find_team_query = text("""
    SELECT id FROM teams WHERE char_id = :team
""")

# insert query
insert_statement = text("""
    INSERT INTO player_game_stats (game_id, season, week, player_id, team_id, position, position_group, passing_completions, passing_attempts, passing_yards, passing_touchdowns, passing_interceptions, passing_sacks, passing_sack_yards, passing_sack_fumbles_lost, passing_air_yards, passing_yards_after_catch, passing_first_downs, passing_epa, passing_2pt_conversions, pacr, dakota, rushing_attempts, rushing_yards, rushing_touchdowns, rushing_first_downs, rushing_epa, rushing_2pt_conversions, rushing_fumbles_lost, receptions, targets, receiving_yards, receiving_touchdowns, receiving_first_downs, receiving_epa, receiving_2pt_conversions, receiving_air_yards, receiving_yards_after_catch, receiving_fumbles_lost, racr, target_share, wopr, air_yards_share)
    VALUES (:game_id, :season, :week, :player_id, :team, :position, :position_group, :completions, :attempts, :passing_yards, :passing_tds, :passing_interceptions, :sacks_suffered, :sack_yards_lost, :sack_fumbles_lost, :passing_air_yards, :passing_yards_after_catch, :passing_first_downs, :passing_epa, :passing_2pt_conversions, :pacr, 0, :carries, :rushing_yards, :rushing_tds, :rushing_first_downs, :rushing_epa, :rushing_2pt_conversions, :rushing_fumbles_lost, :receptions, :targets, :receiving_yards, :receiving_tds, :receiving_first_downs, :receiving_epa, :receiving_2pt_conversions, :receiving_air_yards, :receiving_yards_after_catch, :receiving_fumbles_lost, :racr, :target_share, :wopr, :air_yards_share)
""")

# update query
update_statement = text("""
    UPDATE player_game_stats
    SET team_id = :team, position = :position, position_group = :position_group, passing_completions = :completions, passing_attempts = :attempts, passing_yards = :passing_yards, passing_touchdowns = :passing_tds, passing_interceptions = :passing_interceptions, passing_sacks = :sacks_suffered, passing_sack_yards = :sack_yards_lost, passing_sack_fumbles_lost = :sack_fumbles_lost, passing_air_yards = :passing_air_yards, passing_yards_after_catch = :passing_yards_after_catch, passing_first_downs = :passing_first_downs, passing_epa = :passing_epa, passing_2pt_conversions = :passing_2pt_conversions, pacr = :pacr, dakota = 0, rushing_attempts = :carries, rushing_yards = :rushing_yards, rushing_touchdowns = :rushing_tds, rushing_first_downs = :rushing_first_downs, rushing_epa = :rushing_epa, rushing_2pt_conversions = :rushing_2pt_conversions, rushing_fumbles_lost = :rushing_fumbles_lost, receptions = :receptions, targets = :targets, receiving_yards = :receiving_yards, receiving_touchdowns = :receiving_tds, receiving_first_downs = :receiving_first_downs, receiving_epa = :receiving_epa, receiving_2pt_conversions = :receiving_2pt_conversions, receiving_air_yards = :receiving_air_yards, receiving_yards_after_catch = :receiving_yards_after_catch, receiving_fumbles_lost = :receiving_fumbles_lost, racr = :racr, target_share = :target_share, wopr = :wopr, air_yards_share = :air_yards_share
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# update aggregates query (yards/reception, yards/carry, etc.)
update_aggregates_statement = text("""
    UPDATE player_game_stats
    SET yards_per_rush_attempt = CASE WHEN rushing_attempts = 0 THEN 0 ELSE rushing_yards / rushing_attempts END, 
        yards_per_reception = CASE WHEN receptions = 0 THEN 0 ELSE receiving_yards / receptions END, 
        yards_per_pass_attempt = CASE WHEN passing_attempts = 0 THEN 0 ELSE passing_yards / passing_attempts END, 
        yards_per_pass_completion = CASE WHEN passing_completions = 0 THEN 0 ELSE passing_yards / passing_completions END
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# find schedule query
find_schedule_query = text("""
    SELECT id, espn_id FROM schedules WHERE season = :season AND week = :week AND (home_team_char_id = :team OR away_team_char_id = :team)
""")

existing_player_game_keys_query = text("""
    SELECT game_id, player_id
    FROM player_game_stats
    WHERE season >= :min_season AND season <= :max_season
""")

espn_game_ids = set()

def main():
    completed = 0
    total = len(data)
    load_mode = ask_load_mode()
    overwrite_existing = load_mode == 'overwrite'
    print(f"Using load mode: {load_mode}")

    conn = MySQLConnection()
    try:
        existing_player_game_keys = {
            (int(row[0]), str(int(str(row[1]))))
            for row in conn.connection.execute(
                existing_player_game_keys_query,
                {'min_season': min(YEARS), 'max_season': max(YEARS)}
            ).fetchall()
            if row[0] is not None and row[1] is not None and str(row[1]).strip().isdigit()
        }

        skipped_existing = 0

        # insert/update the data into the database
        for _, row in data.iterrows():
            if row['week'] < MIN_WEEK or row['week'] > MAX_WEEK:
                completed += 1
                continue

            if completed % 100 == 0:
                pct = (completed / total * 100) if total else 100
                print(f"{completed} / {total} ({pct:.2f}%)")

            if row['season_type'] == 'PRE':
                completed += 1
                continue

            row = row.where(pd.notnull(row), None)

            if row['player_id'] is None:
                completed += 1
                continue

            schedule_id = conn.connection.execute(
                find_schedule_query,
                {'season': row['season'], 'week': row['week'], 'team': row['team']}
            ).fetchone()
            if schedule_id is None:
                completed += 1
                print(f"Schedule not found for {row['team']} in week {row['week']} of {row['season']}")
                continue

            if schedule_id[1] is not None:
                espn_game_ids.add(schedule_id[1])

            row['game_id'] = schedule_id[0]

            player_id = normalize_player_id(row['player_id'])
            if player_id is None:
                completed += 1
                continue
            row['player_id'] = player_id

            existing_key = (int(row['game_id']), player_id)
            exists = existing_key in existing_player_game_keys
            if exists and not overwrite_existing:
                skipped_existing += 1
                completed += 1
                continue

            team_id = conn.connection.execute(find_team_query, {'team': row['team']}).fetchone()
            if team_id is None:
                completed += 1
                continue

            row['team'] = team_id[0]

            if row['season'] < 2021 and row['season_type'] == 'POST':
                row['week'] = 17 + row['week']
            elif row['season'] >= 2021 and row['season_type'] == 'POST':
                row['week'] = 18 + row['week']

            if not exists:
                try:
                    conn.connection.execute(insert_statement, row.to_dict())
                    existing_player_game_keys.add(existing_key)
                except Exception as e:
                    print(f"Failed to insert for player {row['player_id']} in week {row['week']} of {row['season']}: {e}")
                    completed += 1
                    continue
            else:
                conn.connection.execute(update_statement, row.to_dict())

            conn.connection.execute(
                update_aggregates_statement,
                {'season': row['season'], 'week': row['week'], 'player_id': row['player_id']}
            )

            completed += 1

        conn.connection.commit()
        print(f"Done weekly load. Skipped existing rows: {skipped_existing}")
    except Exception:
        conn.connection.rollback()
        raise
    finally:
        conn.close()

    if not ask_yes_no("Update extra player stats? (y/n): "):
        return

    api = LocalhostAPI()
    game_ids = list(espn_game_ids)

    count = len(game_ids)
    completed_api = 0
    for game_id in game_ids:
        if completed_api % 10 == 0:
            pct = (completed_api / count * 100) if count else 100
            print(f"{completed_api} / {count} ({pct:.2f}%)")

        api.get(f'/api/loaders/playerStats/{game_id}')
        completed_api += 1


if __name__ == '__main__':
    main()