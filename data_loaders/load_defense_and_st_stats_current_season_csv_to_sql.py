import pandas as pd
from SQLConnector import MySQLConnection
from sqlalchemy import text

CURRENT_SEASON = 2025
MIN_WEEK = 1
MAX_WEEK = 25


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

    normalized = str(raw_player_id).strip()
    if normalized.startswith('00-'):
        normalized = normalized[3:]

    if not normalized.isnumeric():
        return None

    return str(int(normalized))

# load defense data
defense = pd.read_csv(f'data_csvs/defense_{CURRENT_SEASON}.csv')

# print(defense.columns)

# columns to keep
cols = [
    'season', 'week', 'player_id', 'position', 'position_group', 'team', 'def_tackles_solo', 'def_tackles_with_assist',
    'def_tackles_for_loss', 'def_fumbles_forced', 'def_sacks', 'def_qb_hits', 'def_interceptions',
    'def_pass_defended', 'def_tds', 'fumble_recovery_opp', 'penalties', 'penalty_yards'
]

defense = defense[cols]

# collapse def_tackles_solo and def_tackles_with_assist into def_tackles
defense['def_tackles'] = defense['def_tackles_solo'].fillna(0) + defense['def_tackles_with_assist'].fillna(0)
defense = defense.drop(columns=['def_tackles_solo', 'def_tackles_with_assist'])

# get def_safety as 0s
defense['def_safety'] = 0

# load special teams

special_teams = pd.read_csv(f'data_csvs/special_teams_{CURRENT_SEASON}.csv')

# columns to keep
cols = [
    'season' ,'week', 'player_id', 'team', 'fg_made',
    'fg_missed', 'fg_blocked', 'fg_long', 'fg_att', 'fg_pct', 'pat_made', 'pat_missed', 'pat_blocked', 'pat_att', 'pat_pct',
    'fg_made_distance', 'fg_missed_distance', 'gwfg_att', 'gwfg_distance', 'gwfg_made', 'gwfg_missed', 'gwfg_blocked'
]

special_teams = special_teams[cols]

# THERE ARE ALSO fg made and missed for 0-19, 20-29, 30-39, 40-49, 50+ yards

# drop seasons pre 2010
defense = defense[defense['season'] >= 2010]
special_teams = special_teams[special_teams['season'] >= 2010]

# find team query
find_team_query = text("""
    SELECT id FROM teams WHERE char_id = :team
""")

# DEFENSE QUERIES
# insert query
insert_defense_statement = text("""
    INSERT INTO player_game_stats (game_id, season, week, player_id, team_id, position, position_group, tackles, tackles_for_loss, fumbles_forced, sacks, qb_hits, interceptions, pass_defended, defensive_touchdowns, def_fumble_recovery_opp, def_safety_forced, def_penalty, def_penalty_yards)
    VALUES (:game_id, :season, :week, :player_id, :team, :position, :position_group, :def_tackles, :def_tackles_for_loss, :def_fumbles_forced, :def_sacks, :def_qb_hits, :def_interceptions, :def_pass_defended, :def_tds, :fumble_recovery_opp, :def_safety, :penalties, :penalty_yards)
""")

# update query
update_defense_statement = text("""
    UPDATE player_game_stats
    SET team_id = :team, position = :position, position_group = :position_group, tackles = :def_tackles, tackles_for_loss = :def_tackles_for_loss, fumbles_forced = :def_fumbles_forced, sacks = :def_sacks, qb_hits = :def_qb_hits, interceptions = :def_interceptions, pass_defended = :def_pass_defended, defensive_touchdowns = :def_tds, def_fumble_recovery_opp = :fumble_recovery_opp, def_safety_forced = :def_safety, def_penalty = :penalties, def_penalty_yards = :penalty_yards
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# SPECIAL TEAMS QUERIES
# insert query
insert_special_teams_statement = text("""
    INSERT INTO player_game_stats (game_id, season, week, player_id, team_id, position, position_group, fg_made, fg_missed, fg_blocked, fg_long, fg_att, fg_pct, pat_made, pat_missed, pat_blocked, pat_att, pat_pct, fg_made_distance, fg_missed_distance, gwfg_att, gwfg_made, gwfg_missed, gwfg_blocked)
    VALUES (:game_id, :season, :week, :player_id, :team, :position, :position_group, :fg_made, :fg_missed, :fg_blocked, :fg_long, :fg_att, :fg_pct, :pat_made, :pat_missed, :pat_blocked, :pat_att, :pat_pct, :fg_made_distance, :fg_missed_distance, :gwfg_att, :gwfg_made, :gwfg_missed, :gwfg_blocked)
""")

# update query
update_special_teams_statement = text("""
    UPDATE player_game_stats
    SET team_id = :team, position = :position, position_group = :position_group, fg_made = :fg_made, fg_missed = :fg_missed, fg_blocked = :fg_blocked, fg_long = :fg_long, fg_att = :fg_att, fg_pct = :fg_pct, pat_made = :pat_made, pat_missed = :pat_missed, pat_blocked = :pat_blocked, pat_att = :pat_att, pat_pct = :pat_pct, fg_made_distance = :fg_made_distance, fg_missed_distance = :fg_missed_distance, gwfg_att = :gwfg_att, gwfg_made = :gwfg_made, gwfg_missed = :gwfg_missed, gwfg_blocked = :gwfg_blocked
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# find schedule query
find_schedule_query = text("""
    SELECT id FROM schedules WHERE season = :season AND week = :week AND (home_team_char_id = :team OR away_team_char_id = :team)
""")

existing_player_game_keys_query = text("""
    SELECT game_id, player_id
    FROM player_game_stats
    WHERE season >= :min_season AND season <= :max_season
""")

skip_def = False

def main():
    completed = 0
    total = len(defense) + len(special_teams)
    load_mode = ask_load_mode()
    overwrite_existing = load_mode == 'overwrite'
    print(f"Using load mode: {load_mode}")

    conn = MySQLConnection()
    try:
        existing_player_game_keys = {
            (int(row[0]), str(int(str(row[1]))))
            for row in conn.connection.execute(
                existing_player_game_keys_query,
                {'min_season': int(min(defense['season'].min(), special_teams['season'].min())), 'max_season': CURRENT_SEASON}
            ).fetchall()
            if row[0] is not None and row[1] is not None and str(row[1]).strip().isdigit()
        }

        skipped_existing = 0

        if not skip_def:
            # insert/update the data into the database
            for _, row in defense.iterrows():
                if completed % 100 == 0:
                    pct = (completed / total * 100) if total else 100
                    print(f"{completed} / {total} ({pct:.2f}%)")

                if row['week'] < MIN_WEEK or row['week'] > MAX_WEEK:
                    completed += 1
                    continue

                row = row.where(pd.notnull(row), None)
                row['player_id'] = normalize_player_id(row['player_id'])
                if row['player_id'] is None:
                    completed += 1
                    continue

                team = row['team']
                team_row = conn.connection.execute(find_team_query, {'team': team}).fetchone()
                if team_row is None:
                    print(f"Team {team} not found")
                    completed += 1
                    continue
                team_id = team_row[0]

                schedule_row = conn.connection.execute(
                    find_schedule_query,
                    {'season': row['season'], 'week': row['week'], 'team': team}
                ).fetchone()
                if schedule_row is None:
                    print(f"Schedule not found for team {team} in week {row['week']} of season {row['season']}")
                    completed += 1
                    continue
                schedule_id = schedule_row[0]

                row['game_id'] = schedule_id
                row['team'] = team_id
                player_game_key = (int(schedule_id), row['player_id'])
                exists = player_game_key in existing_player_game_keys

                if exists and not overwrite_existing:
                    skipped_existing += 1
                elif not exists:
                    conn.connection.execute(insert_defense_statement, row.to_dict())
                    existing_player_game_keys.add(player_game_key)
                else:
                    conn.connection.execute(update_defense_statement, row.to_dict())

                completed += 1

            conn.connection.commit()

        completed = 0
        total = len(special_teams)

        for _, row in special_teams.iterrows():
            if completed % 100 == 0:
                pct = (completed / total * 100) if total else 100
                print(f"{completed} / {total} ({pct:.2f}%)")

            row = row.where(pd.notnull(row), None)
            row['player_id'] = normalize_player_id(row['player_id'])
            if row['player_id'] is None:
                completed += 1
                continue

            row['position'] = 'ST'
            row['position_group'] = 'special_teams'

            team = row['team']
            team_row = conn.connection.execute(find_team_query, {'team': team}).fetchone()
            if team_row is None:
                print(f"Team {team} not found")
                completed += 1
                continue
            team_id = team_row[0]

            schedule_row = conn.connection.execute(
                find_schedule_query,
                {'season': row['season'], 'week': row['week'], 'team': team}
            ).fetchone()
            if schedule_row is None:
                print(f"Schedule not found for team {team} in week {row['week']} of season {row['season']}")
                completed += 1
                continue
            schedule_id = schedule_row[0]

            row['game_id'] = schedule_id
            row['team'] = team_id
            player_game_key = (int(schedule_id), row['player_id'])
            exists = player_game_key in existing_player_game_keys

            if exists and not overwrite_existing:
                skipped_existing += 1
            elif not exists:
                conn.connection.execute(insert_special_teams_statement, row.to_dict())
                existing_player_game_keys.add(player_game_key)
            else:
                conn.connection.execute(update_special_teams_statement, row.to_dict())

            completed += 1

        conn.connection.commit()
        print(f"Done defense/ST load. Skipped existing rows: {skipped_existing}")
    except Exception:
        conn.connection.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()