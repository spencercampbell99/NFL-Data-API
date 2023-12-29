# get sql connection
from mysql_connection import MySQLConnection
from sqlalchemy import text
conn = MySQLConnection()

import pandas as pd
import numpy as np

# get all box_scores
box_scores = pd.read_sql('select schedule_id, team_id from box_scores join schedules on schedules.id = box_scores.schedule_id where season = 2023 and week = 16', con=conn.connection)

# query to get defense and special teams totals for player_game_stats
stat_totals_query = f"""
    SELECT
        SUM(interceptions) AS defense_special_teams_interceptions,
        SUM(sacks) AS defense_special_teams_sacks,
        sum(tackles_for_loss) AS defense_special_teams_tackles_for_loss,
        sum(passes_defended) AS defense_special_teams_passes_defended,
        sum(fumbles_recovered) AS defense_special_teams_fumble_recoveries,
        sum(qb_hits) AS defense_special_teams_qb_hits,
        sum(tackles) AS defense_special_teams_tackles,
        sum(field_goal_makes) AS field_goals_made,
        sum(field_goal_attempts) AS field_goals_attempted,
        sum(extra_point_makes) AS extra_points_made,
        sum(extra_point_attempts) AS extra_points_attempted,
        sum(punts) AS punts,
        sum(punt_yards) AS punt_yards,
        sum(touchbacks) AS touchbacks,
        sum(punts_inside_20) AS punts_inside_20
    FROM
        player_game_stats
    WHERE
        game_id = %s
        AND team_id = %s
"""
update_query = text(f"""
    UPDATE box_scores
    SET
        defense_special_teams_interceptions = :defense_special_teams_interceptions,
        defense_special_teams_sacks = :defense_special_teams_sacks,
        defense_special_teams_tackles_for_loss = :defense_special_teams_tackles_for_loss,
        defense_special_teams_passes_defended = :defense_special_teams_passes_defended,
        defense_special_teams_fumble_recoveries = :defense_special_teams_fumble_recoveries,
        defense_special_teams_qb_hits = :defense_special_teams_qb_hits,
        defense_special_teams_tackles = :defense_special_teams_tackles,
        field_goals_made = :field_goals_made,
        field_goals_attempted = :field_goals_attempted,
        extra_points_made = :extra_points_made,
        extra_points_attempted = :extra_points_attempted,
        punts = :punts,
        punt_yards = :punt_yards,
        touchbacks = :touchbacks,
        punts_inside_20 = :punts_inside_20,
        yards_per_punt = :yards_per_punt
    WHERE
        schedule_id = :schedule_id
        AND team_id = :team_id
""")

counter = 0
total_box_scores = len(box_scores)

for index, box_score in box_scores.iterrows():
    if counter % 100 == 0:
        percent = counter / total_box_scores * 100
        print(f'{percent:.2f}% ({counter}/{total_box_scores})')
    
    # get schedule_id and team_id
    schedule_id = int(box_score['schedule_id'])
    team_id = int(box_score['team_id'])
    
    stat_totals_for_game = pd.read_sql(stat_totals_query, con=conn.connection, params=(schedule_id, team_id, ))
    
    # calculate yards per punt
    stat_totals_for_game['yards_per_punt'] = np.where(stat_totals_for_game['punts'] == 0, 0, stat_totals_for_game['punt_yards'] / stat_totals_for_game['punts'])
    
    stat_totals_for_game['schedule_id'] = schedule_id
    stat_totals_for_game['team_id'] = team_id
    
    # if any stats are na, continue
    if stat_totals_for_game.isna().any().any():
        counter += 1
        continue
    
    # get params
    params = stat_totals_for_game.iloc[0].to_dict()
    
    # update box_score
    conn.connection.execute(update_query, params)
    
    counter += 1

print('Done.')

# commit changes
conn.connection.commit()

# close connection
conn.close()