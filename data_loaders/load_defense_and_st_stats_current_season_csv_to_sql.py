import pandas as pd

# load defense data
defense = pd.read_csv('data_csvs/defense_2025.csv')

# print(defense.columns)

# columns to keep
cols = [
    'season', 'week', 'player_id', 'position', 'position_group', 'team', 'def_tackles',
    'def_tackles_for_loss', 'def_fumbles_forced', 'def_sacks', 'def_qb_hits', 'def_interceptions',
    'def_pass_defended', 'def_tds', 'def_fumble_recovery_opp', 'def_safety', 'def_penalty', 'def_penalty_yards'
]

defense = defense[cols]

# load special teams

special_teams = pd.read_csv('data_csvs/special_teams_2025.csv')

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

from SQLConnector import MySQLConnection
from sqlalchemy import text
# Create a connection to the database
conn = MySQLConnection()

# find team query
find_team_query = text(f"""
    SELECT id FROM teams WHERE char_id = :team
""")

# DEFENSE QUERIES
# insert query
insert_defense_statement = text(f"""
    INSERT INTO player_game_stats (game_id, season, week, player_id, team_id, position, position_group, tackles, tackles_for_loss, fumbles_forced, sacks, qb_hits, interceptions, pass_defended, defensive_touchdowns, def_fumble_recovery_opp, def_safety_forced, def_penalty, def_penalty_yards)
    VALUES (:game_id, :season, :week, :player_id, :team, :position, :position_group, :def_tackles, :def_tackles_for_loss, :def_fumbles_forced, :def_sacks, :def_qb_hits, :def_interceptions, :def_pass_defended, :def_tds, :def_fumble_recovery_opp, :def_safety, :def_penalty, :def_penalty_yards)
""")

# update query
update_defense_statement = text(f"""
    UPDATE player_game_stats
    SET team_id = :team, position = :position, position_group = :position_group, tackles = :def_tackles, tackles_for_loss = :def_tackles_for_loss, fumbles_forced = :def_fumbles_forced, sacks = :def_sacks, qb_hits = :def_qb_hits, interceptions = :def_interceptions, pass_defended = :def_pass_defended, defensive_touchdowns = :def_tds, def_fumble_recovery_opp = :def_fumble_recovery_opp, def_safety_forced = :def_safety, def_penalty = :def_penalty, def_penalty_yards = :def_penalty_yards
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# SPECIAL TEAMS QUERIES
# insert query
insert_special_teams_statement = text(f"""
    INSERT INTO player_game_stats (game_id, season, week, player_id, team_id, position, position_group, fg_made, fg_missed, fg_blocked, fg_long, fg_att, fg_pct, pat_made, pat_missed, pat_blocked, pat_att, pat_pct, fg_made_distance, fg_missed_distance, gwfg_att, gwfg_made, gwfg_missed, gwfg_blocked)
    VALUES (:game_id, :season, :week, :player_id, :team, :position, :position_group, :fg_made, :fg_missed, :fg_blocked, :fg_long, :fg_att, :fg_pct, :pat_made, :pat_missed, :pat_blocked, :pat_att, :pat_pct, :fg_made_distance, :fg_missed_distance, :gwfg_att, :gwfg_made, :gwfg_missed, :gwfg_blocked)
""")

# update query
update_special_teams_statement = text(f"""
    UPDATE player_game_stats
    SET team_id = :team, position = :position, position_group = :position_group, fg_made = :fg_made, fg_missed = :fg_missed, fg_blocked = :fg_blocked, fg_long = :fg_long, fg_att = :fg_att, fg_pct = :fg_pct, pat_made = :pat_made, pat_missed = :pat_missed, pat_blocked = :pat_blocked, pat_att = :pat_att, pat_pct = :pat_pct, fg_made_distance = :fg_made_distance, fg_missed_distance = :fg_missed_distance, gwfg_att = :gwfg_att, gwfg_made = :gwfg_made, gwfg_missed = :gwfg_missed, gwfg_blocked = :gwfg_blocked
    WHERE season = :season AND week = :week AND player_id = :player_id
""")

# check for existing data
check_query = text(f"""
    SELECT season FROM player_game_stats WHERE season = :season AND week = :week AND player_id = :player_id
""")

# find schedule query
find_schedule_query = text(f"""
    SELECT id FROM schedules WHERE season = :season AND week = :week AND (home_team_char_id = :team OR away_team_char_id = :team)
""")

completed = 0
total = len(defense) + len(special_teams)

skip_def = False

if not skip_def:
    # insert/update the data into the database
    for index, row in defense.iterrows():
        # print percent completion if divisible by 100
        if completed % 100 == 0:
            print(f"{completed} / {total} ({completed / total * 100}%)")

        if row['week'] < 15 or row['week'] > 18:
            completed += 1
            continue
        
        # replace NAN with None
        row = row.where(pd.notnull(row), None)
        
        if row['player_id'] is None:
            completed += 1
            continue
        
        row['player_id'] = row['player_id'][3:]
        
        # if player id not a number, skip
        if not row['player_id'].isnumeric():
            completed += 1
            continue
        
        # find the team id
        team = row['team']
        result = conn.connection.execute(find_team_query, {'team': team})
        team_id = result.fetchone()[0]

        if team_id is None:
            print(f"Team {team} not found")
            completed += 1
            continue

        # find the schedule id
        result = conn.connection.execute(find_schedule_query, {'season': row['season'], 'week': row['week'], 'team': team})
        schedule_id = result.fetchone()

        if schedule_id is None:
            print(f"Schedule not found for team {team} in week {row['week']} of season {row['season']}")
            completed += 1
            continue
        schedule_id = schedule_id[0]

        row['game_id'] = schedule_id
        row['team'] = team_id

        # check if the data already exists
        result = conn.connection.execute(check_query, {'season': row['season'], 'week': row['week'], 'player_id': row['player_id']})
        exists = result.fetchone()

        # insert or update the data
        if exists is None:
            conn.connection.execute(insert_defense_statement, row.to_dict())
        else:
            conn.connection.execute(update_defense_statement, row.to_dict())

        completed += 1

    conn.connection.commit()

completed = 0
total = len(special_teams)

for index, row in special_teams.iterrows():
    # print percent completion if divisible by 100
    if completed % 100 == 0:
        print(f"{completed} / {total} ({completed / total * 100}%)")
    
    # replace NAN with None
    row = row.where(pd.notnull(row), None)
    
    if row['player_id'] is None:
        completed += 1
        continue
    
    row['player_id'] = row['player_id'][3:]
    
    row['position'] = 'ST'
    row['position_group'] = 'special_teams'
    
    # find the team id
    team = row['team']
    result = conn.connection.execute(find_team_query, {'team': team})
    team_id = result.fetchone()[0]

    if team_id is None:
        print(f"Team {team} not found")
        completed += 1
        continue

    # find the schedule id
    result = conn.connection.execute(find_schedule_query, {'season': row['season'], 'week': row['week'], 'team': team})
    schedule_id = result.fetchone()
    
    if schedule_id is None:
        print(f"Schedule not found for team {team} in week {row['week']} of season {row['season']}")
        completed += 1
        continue
    else:
        schedule_id = schedule_id[0]

    if schedule_id is None:
        print(f"Schedule not found for team {team} in week {row['week']} of season {row['season']}")
        completed += 1
        continue

    row['game_id'] = schedule_id
    row['team'] = team_id

    # check if the data already exists
    result = conn.connection.execute(check_query, {'season': row['season'], 'week': row['week'], 'player_id': row['player_id']})
    exists = result.fetchone()

    # insert or update the data
    if exists is None:
        conn.connection.execute(insert_special_teams_statement, row.to_dict())
    else:
        conn.connection.execute(update_special_teams_statement, row.to_dict())
        
    completed += 1

conn.connection.commit()
conn.close()