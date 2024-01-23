from collections import Counter
from matplotlib import pyplot as plt
from mysql_connection import MySQLConnection
from sqlalchemy import text
conn = MySQLConnection()
import pandas as pd
import numpy as np

get_average_team_performance = text(f"""
    WITH RankedBoxScores AS (
        SELECT
            box_scores.*,
            Row_Number() OVER (PARTITION BY box_scores.team_id ORDER BY schedules.season DESC, schedules.week DESC) AS `row_number`
        FROM
            box_scores
        JOIN schedules ON schedules.id = box_scores.schedule_id
        WHERE
            (schedules.season < :season OR (schedules.season = :season AND schedules.week <= :week))
            AND box_scores.team_id = :team_id
        ORDER BY schedules.season DESC, schedules.week DESC
        LIMIT :weeks_back
    )
    select
        avg(points_scored) as average_points_scored,
        avg(points_allowed) as average_points_allowed,
        avg(points_scored) + avg(points_allowed) as average_total_score,
        avg(passing_yards) as average_passing_yards,
        avg(rushing_yards) as average_rushing_yards,
        avg(first_downs) as average_first_downs,
        avg(third_down_conversions) as average_third_down_conversions,
        avg(punts_inside_20) as average_punts_inside_20,
        avg(yards_per_play) as average_yards_per_play,
        avg(total_offensive_plays) as average_offensive_plays,
        avg(red_zone_attempts) as average_redzone_attempts,
        avg(field_goals_attempted) as average_fg_attempted,
        avg(total_epa) as average_epa
    FROM
        RankedBoxScores
    WHERE
        `row_number` <= :weeks_back
""")

get_average_team_performance_for_home = text(f"""
    WITH RankedBoxScores AS (
        SELECT
            box_scores.*,
            Row_Number() OVER (PARTITION BY box_scores.team_id ORDER BY schedules.season DESC, schedules.week DESC) AS `row_number`
        FROM
            box_scores
        JOIN schedules ON schedules.id = box_scores.schedule_id
        WHERE
            (schedules.season < :season OR (schedules.season = :season AND schedules.week <= :week))
            AND box_scores.team_id = :team_id AND box_scores.home_team = 1
        ORDER BY schedules.season DESC, schedules.week DESC
        LIMIT :weeks_back
    )
    select
        avg(points_scored) as average_home_points_scored,
        avg(points_allowed) as average_home_points_allowed,
        avg(points_scored) + avg(points_allowed) as average_home_total_score,
        avg(passing_yards) as average_home_passing_yards,
        avg(rushing_yards) as average_home_rushing_yards,
        avg(first_downs) as average_home_first_downs,
        avg(third_down_conversions) as average_home_third_down_conversions,
        avg(punts_inside_20) as average_home_punts_inside_20,
        avg(yards_per_play) as average_home_yards_per_play,
        avg(total_offensive_plays) as average_home_offensive_plays,
        avg(red_zone_attempts) as average_home_redzone_attempts,
        avg(field_goals_attempted) as average_fg_attempted,
        avg(total_epa) as average_epa
    FROM
        RankedBoxScores
    WHERE
        `row_number` <= :weeks_back                                    
""")

get_average_team_performance_for_away = text(f"""
    WITH RankedBoxScores AS (
        SELECT
            box_scores.*,
            Row_Number() OVER (PARTITION BY box_scores.team_id ORDER BY schedules.season DESC, schedules.week DESC) AS `row_number`
        FROM
            box_scores
        JOIN schedules ON schedules.id = box_scores.schedule_id
        WHERE
            (schedules.season < :season OR (schedules.season = :season AND schedules.week <= :week))
            AND box_scores.team_id = :team_id AND box_scores.home_team = 0
        ORDER BY schedules.season DESC, schedules.week DESC
        LIMIT :weeks_back
    )
    select
        avg(points_scored) as average_home_points_scored,
        avg(points_allowed) as average_home_points_allowed,
        avg(points_scored) + avg(points_allowed) as average_home_total_score,
        avg(passing_yards) as average_home_passing_yards,
        avg(rushing_yards) as average_home_rushing_yards,
        avg(first_downs) as average_home_first_downs,
        avg(third_down_conversions) as average_home_third_down_conversions,
        avg(punts_inside_20) as average_home_punts_inside_20,
        avg(yards_per_play) as average_home_yards_per_play,
        avg(total_offensive_plays) as average_home_offensive_plays,
        avg(red_zone_attempts) as average_home_redzone_attempts,
        avg(field_goals_attempted) as average_fg_attempted,
        avg(total_epa) as average_epa
    FROM
        RankedBoxScores
    WHERE
        `row_number` <= :weeks_back
""")

get_average_team_performance_vs_opponent = text(f"""
    WITH RankedBoxScores AS (
        SELECT
            box_scores.*,
            Row_Number() OVER (PARTITION BY box_scores.team_id ORDER BY schedules.season DESC, schedules.week DESC) AS `row_number`
        FROM
            box_scores
        JOIN schedules ON schedules.id = box_scores.schedule_id
        WHERE
            (schedules.season < :season OR (schedules.season = :season AND schedules.week <= :week))
            AND box_scores.team_id = :team_id AND box_scores.opponent_id = :opponent_id
        ORDER BY schedules.season DESC, schedules.week DESC
        LIMIT :weeks_back
    )
    select
        avg(points_scored) as average_home_points_scored,
        avg(points_allowed) as average_home_points_allowed,
        avg(points_scored) + avg(points_allowed) as average_home_total_score,
        avg(passing_yards) as average_home_passing_yards,
        avg(rushing_yards) as average_home_rushing_yards,
        avg(first_downs) as average_home_first_downs,
        avg(third_down_conversions) as average_home_third_down_conversions,
        avg(punts_inside_20) as average_home_punts_inside_20,
        avg(yards_per_play) as average_home_yards_per_play,
        avg(total_offensive_plays) as average_home_offensive_plays,
        avg(red_zone_attempts) as average_home_redzone_attempts,
        avg(field_goals_attempted) as average_fg_attempted,
        avg(total_epa) as average_epa
    FROM
        RankedBoxScores
    WHERE
        `row_number` <= :weeks_back                                            
""")

# insert query for average team performance
insert_query = text(f"""
    INSERT INTO averaged_team_performances (
        team_id,
        schedule_id,
        next_schedule_id,
        boxscore_id,
        average_points_scored,
        average_points_allowed,
        average_total_score,
        average_passing_yards,
        average_rushing_yards,
        average_first_downs,
        average_third_down_conversions,
        average_punts_inside_20,
        average_yards_per_play,
        average_offensive_plays,
        average_home_points_scored,
        average_home_points_allowed,
        average_home_total_score,
        average_home_passing_yards,
        average_home_rushing_yards,
        average_home_first_downs,
        average_home_third_down_conversions,
        average_home_punts_inside_20,
        average_home_yards_per_play,
        average_home_offensive_plays,
        average_away_points_scored,
        average_away_points_allowed,
        average_away_total_score,
        average_away_passing_yards,
        average_away_rushing_yards,
        average_away_first_downs,
        average_away_third_down_conversions,
        average_away_punts_inside_20,
        average_away_yards_per_play,
        average_away_offensive_plays,
        average_points_scored_against_opponent,
        average_points_allowed_against_opponent,
        average_total_score_against_opponent,
        average_passing_yards_against_opponent,
        average_rushing_yards_against_opponent,
        average_first_downs_against_opponent,
        average_third_down_conversions_against_opponent,
        average_punts_inside_20_against_opponent,
        average_yards_per_play_against_opponent,
        average_offensive_plays_against_opponent,
        average_redzone_attempts,
        average_home_redzone_attempts,
        average_away_redzone_attempts,
        average_redzone_attempts_against_opponent,
        average_fg_attempted,
        average_home_fg_attempted,
        average_away_fg_attempted,
        average_fg_attempted_against_opponent,
        average_epa,
        average_home_epa,
        average_away_epa,
        average_epa_against_opponent
    )
    VALUES (
        :team_id,
        :schedule_id,
        :next_schedule_id,
        :boxscore_id,
        :average_points_scored,
        :average_points_allowed,
        :average_total_score,
        :average_passing_yards,
        :average_rushing_yards,
        :average_first_downs,
        :average_third_down_conversions,
        :average_punts_inside_20,
        :average_yards_per_play,
        :average_offensive_plays,
        :average_home_points_scored,
        :average_home_points_allowed,
        :average_home_total_score,
        :average_home_passing_yards,
        :average_home_rushing_yards,
        :average_home_first_downs,
        :average_home_third_down_conversions,
        :average_home_punts_inside_20,
        :average_home_yards_per_play,
        :average_home_offensive_plays,
        :average_away_points_scored,
        :average_away_points_allowed,
        :average_away_total_score,
        :average_away_passing_yards,
        :average_away_rushing_yards,
        :average_away_first_downs,
        :average_away_third_down_conversions,
        :average_away_punts_inside_20,
        :average_away_yards_per_play,
        :average_away_offensive_plays,
        :average_vs_opponent_points_scored,
        :average_vs_opponent_points_allowed,
        :average_vs_opponent_total_score,
        :average_vs_opponent_passing_yards,
        :average_vs_opponent_rushing_yards,
        :average_vs_opponent_first_downs,
        :average_vs_opponent_third_down_conversions,
        :average_vs_opponent_punts_inside_20,
        :average_vs_opponent_yards_per_play,
        :average_vs_opponent_offensive_plays,
        :average_redzone_attempts,
        :average_home_redzone_attempts,
        :average_away_redzone_attempts,
        :average_vs_opponent_redzone_attempts,
        :average_fg_attempted,
        :average_home_fg_attempted,
        :average_away_fg_attempted,
        :average_vs_opponent_fg_attempted,
        :average_epa,
        :average_home_epa,
        :average_away_epa,
        :average_epa_against_opponent
    )
""")

# update query
update_query = text(f"""
    UPDATE averaged_team_performances
    SET
        next_schedule_id = :next_schedule_id,
        average_points_scored = :average_points_scored,
        average_points_allowed = :average_points_allowed,
        average_total_score = :average_total_score,
        average_passing_yards = :average_passing_yards,
        average_rushing_yards = :average_rushing_yards,
        average_first_downs = :average_first_downs,
        average_third_down_conversions = :average_third_down_conversions,
        average_punts_inside_20 = :average_punts_inside_20,
        average_yards_per_play = :average_yards_per_play,
        average_offensive_plays = :average_offensive_plays,
        average_home_points_scored = :average_home_points_scored,
        average_home_points_allowed = :average_home_points_allowed,
        average_home_total_score = :average_home_total_score,
        average_home_passing_yards = :average_home_passing_yards,
        average_home_rushing_yards = :average_home_rushing_yards,
        average_home_first_downs = :average_home_first_downs,
        average_home_third_down_conversions = :average_home_third_down_conversions,
        average_home_punts_inside_20 = :average_home_punts_inside_20,
        average_home_yards_per_play = :average_home_yards_per_play,
        average_home_offensive_plays = :average_home_offensive_plays,
        average_away_points_scored = :average_away_points_scored,
        average_away_points_allowed = :average_away_points_allowed,
        average_away_total_score = :average_away_total_score,
        average_away_passing_yards = :average_away_passing_yards,
        average_away_rushing_yards = :average_away_rushing_yards,
        average_away_first_downs = :average_away_first_downs,
        average_away_third_down_conversions = :average_away_third_down_conversions,
        average_away_punts_inside_20 = :average_away_punts_inside_20,
        average_away_yards_per_play = :average_away_yards_per_play,
        average_away_offensive_plays = :average_away_offensive_plays,
        average_points_scored_against_opponent = :average_vs_opponent_points_scored,
        average_points_allowed_against_opponent = :average_vs_opponent_points_allowed,
        average_total_score_against_opponent = :average_vs_opponent_total_score,
        average_passing_yards_against_opponent = :average_vs_opponent_passing_yards,
        average_rushing_yards_against_opponent = :average_vs_opponent_rushing_yards,
        average_first_downs_against_opponent = :average_vs_opponent_first_downs,
        average_third_down_conversions_against_opponent = :average_vs_opponent_third_down_conversions,
        average_punts_inside_20_against_opponent = :average_vs_opponent_punts_inside_20,
        average_yards_per_play_against_opponent = :average_vs_opponent_yards_per_play,
        average_offensive_plays_against_opponent = :average_vs_opponent_offensive_plays,
        average_redzone_attempts = :average_redzone_attempts,
        average_home_redzone_attempts = :average_home_redzone_attempts,
        average_away_redzone_attempts = :average_away_redzone_attempts,
        average_redzone_attempts_against_opponent = :average_vs_opponent_redzone_attempts,
        average_fg_attempted = :average_fg_attempted,
        average_home_fg_attempted = :average_home_fg_attempted,
        average_away_fg_attempted = :average_away_fg_attempted,
        average_fg_attempted_against_opponent = :average_vs_opponent_fg_attempted,
        average_epa = :average_epa,
        average_home_epa = :average_home_epa,
        average_away_epa = :average_away_epa,
        average_epa_against_opponent = :average_epa_against_opponent
    WHERE
        team_id = :team_id
        AND schedule_id = :schedule_id      
""")

# get all box_scores from 2013 onwards
box_scores = pd.read_sql('select schedules.id as schedule_id, box_scores.id as boxscore_id, box_scores.team_id as team_id, box_scores.opponent_id as opponent_id, schedules.season as season, schedules.week as week from box_scores join schedules on schedules.id = box_scores.schedule_id where season >= 2013 ORDER BY season ASC, week ASC', con=conn.connection)

# get next schedule id query
next_schedule_id_query = text(f"""
    SELECT
        schedules.id as schedule_id
    FROM
        schedules
    WHERE
        (away_team_id = :team_id or home_team_id = :team_id)
        and (season > :season or (season = :season and week > :week))
    ORDER BY schedules.season ASC, schedules.week ASC
    LIMIT 1
""")

completed = 0
total_box_scores = len(box_scores)

weeks_back = 5

for index, box_score in box_scores.iterrows():
    # print progress
    if completed % 100 == 0:
        print(f'{completed}/{total_box_scores} ({completed / total_box_scores * 100:.2f}%)')
    
    # get schedule_id, team_id, and opponent_id
    schedule_id = box_score['schedule_id'].item()
    team_id = box_score['team_id'].item()
    opponent_id = box_score['opponent_id'].item()
    season = box_score['season'].item()
    week = box_score['week'].item()
    boxscore_id = box_score['boxscore_id'].item()
    
    # get next schedule id
    next_schedule_id_result = conn.connection.execute(next_schedule_id_query, {'team_id': team_id, 'season': season, 'week': week}).fetchone()
    next_schedule_id = next_schedule_id_result[0] if next_schedule_id_result is not None else None
    
    # get average team performance
    average_team_performance = pd.read_sql(get_average_team_performance, con=conn.connection, params={'team_id': team_id, 'season': season, 'week': week, 'weeks_back': weeks_back})
    average_team_performance_for_home = pd.read_sql(get_average_team_performance_for_home, con=conn.connection, params={'team_id': team_id, 'season': season, 'week': week, 'weeks_back': weeks_back})
    average_team_performance_for_away = pd.read_sql(get_average_team_performance_for_away, con=conn.connection, params={'team_id': team_id, 'season': season, 'week': week, 'weeks_back': weeks_back})
    average_team_performance_vs_opponent = pd.read_sql(get_average_team_performance_vs_opponent, con=conn.connection, params={'team_id': team_id, 'opponent_id': opponent_id, 'season': season, 'week': week, 'weeks_back': weeks_back})
    
    # try update, if no rows updated, insert
    res = conn.connection.execute(update_query, {
        'team_id': team_id,
        'schedule_id': schedule_id,
        'next_schedule_id': next_schedule_id,
        'average_points_scored': average_team_performance.loc[0, 'average_points_scored'],
        'average_points_allowed': average_team_performance.loc[0, 'average_points_allowed'],
        'average_total_score': average_team_performance.loc[0, 'average_total_score'],
        'average_passing_yards': average_team_performance.loc[0, 'average_passing_yards'],
        'average_rushing_yards': average_team_performance.loc[0, 'average_rushing_yards'],
        'average_first_downs': average_team_performance.loc[0, 'average_first_downs'],
        'average_third_down_conversions': average_team_performance.loc[0, 'average_third_down_conversions'],
        'average_punts_inside_20': average_team_performance.loc[0, 'average_punts_inside_20'],
        'average_yards_per_play': average_team_performance.loc[0, 'average_yards_per_play'],
        'average_offensive_plays': average_team_performance.loc[0, 'average_offensive_plays'],
        'average_home_points_scored': average_team_performance_for_home.loc[0, 'average_home_points_scored'],
        'average_home_points_allowed': average_team_performance_for_home.loc[0, 'average_home_points_allowed'],
        'average_home_total_score': average_team_performance_for_home.loc[0, 'average_home_total_score'],
        'average_home_passing_yards': average_team_performance_for_home.loc[0, 'average_home_passing_yards'],
        'average_home_rushing_yards': average_team_performance_for_home.loc[0, 'average_home_rushing_yards'],
        'average_home_first_downs': average_team_performance_for_home.loc[0, 'average_home_first_downs'],
        'average_home_third_down_conversions': average_team_performance_for_home.loc[0, 'average_home_third_down_conversions'],
        'average_home_punts_inside_20': average_team_performance_for_home.loc[0, 'average_home_punts_inside_20'],
        'average_home_yards_per_play': average_team_performance_for_home.loc[0, 'average_home_yards_per_play'],
        'average_home_offensive_plays': average_team_performance_for_home.loc[0, 'average_home_offensive_plays'],
        'average_away_points_scored': average_team_performance_for_away.loc[0, 'average_home_points_scored'],
        'average_away_points_allowed': average_team_performance_for_away.loc[0, 'average_home_points_allowed'],
        'average_away_total_score': average_team_performance_for_away.loc[0, 'average_home_total_score'],
        'average_away_passing_yards': average_team_performance_for_away.loc[0, 'average_home_passing_yards'],
        'average_away_rushing_yards': average_team_performance_for_away.loc[0, 'average_home_rushing_yards'],
        'average_away_first_downs': average_team_performance_for_away.loc[0, 'average_home_first_downs'],
        'average_away_third_down_conversions': average_team_performance_for_away.loc[0, 'average_home_third_down_conversions'],
        'average_away_punts_inside_20': average_team_performance_for_away.loc[0, 'average_home_punts_inside_20'],
        'average_away_yards_per_play': average_team_performance_for_away.loc[0, 'average_home_yards_per_play'],
        'average_away_offensive_plays': average_team_performance_for_away.loc[0, 'average_home_offensive_plays'],
        'average_vs_opponent_points_scored': average_team_performance_vs_opponent.loc[0, 'average_home_points_scored'],
        'average_vs_opponent_points_allowed': average_team_performance_vs_opponent.loc[0, 'average_home_points_allowed'],
        'average_vs_opponent_total_score': average_team_performance_vs_opponent.loc[0, 'average_home_total_score'],
        'average_vs_opponent_passing_yards': average_team_performance_vs_opponent.loc[0, 'average_home_passing_yards'],
        'average_vs_opponent_rushing_yards': average_team_performance_vs_opponent.loc[0, 'average_home_rushing_yards'],
        'average_vs_opponent_first_downs': average_team_performance_vs_opponent.loc[0, 'average_home_first_downs'],
        'average_vs_opponent_third_down_conversions': average_team_performance_vs_opponent.loc[0, 'average_home_third_down_conversions'],
        'average_vs_opponent_punts_inside_20': average_team_performance_vs_opponent.loc[0, 'average_home_punts_inside_20'],
        'average_vs_opponent_yards_per_play': average_team_performance_vs_opponent.loc[0, 'average_home_yards_per_play'],
        'average_vs_opponent_offensive_plays': average_team_performance_vs_opponent.loc[0, 'average_home_offensive_plays'],
        'average_redzone_attempts': average_team_performance.loc[0, 'average_redzone_attempts'],
        'average_home_redzone_attempts': average_team_performance_for_home.loc[0, 'average_home_redzone_attempts'],
        'average_away_redzone_attempts': average_team_performance_for_away.loc[0, 'average_home_redzone_attempts'],
        'average_vs_opponent_redzone_attempts': average_team_performance_vs_opponent.loc[0, 'average_home_redzone_attempts'],
        'average_fg_attempted': average_team_performance.loc[0, 'average_fg_attempted'],
        'average_home_fg_attempted': average_team_performance_for_home.loc[0, 'average_fg_attempted'],
        'average_away_fg_attempted': average_team_performance_for_away.loc[0, 'average_fg_attempted'],
        'average_vs_opponent_fg_attempted': average_team_performance_vs_opponent.loc[0, 'average_fg_attempted'],
        'average_epa': average_team_performance.loc[0, 'average_epa'],
        'average_home_epa': average_team_performance_for_home.loc[0, 'average_epa'],
        'average_away_epa': average_team_performance_for_away.loc[0, 'average_epa'],
        'average_epa_against_opponent': average_team_performance_vs_opponent.loc[0, 'average_epa']
    })
    
    # see if update failed
    if res.rowcount == 0:
        conn.connection.execute(insert_query, {
            'team_id': team_id,
            'schedule_id': schedule_id,
            'boxscore_id': boxscore_id,
            'next_schedule_id': next_schedule_id, # this is the last schedule id for the team
            'average_points_scored': average_team_performance.loc[0, 'average_points_scored'],
            'average_points_allowed': average_team_performance.loc[0, 'average_points_allowed'],
            'average_total_score': average_team_performance.loc[0, 'average_total_score'],
            'average_passing_yards': average_team_performance.loc[0, 'average_passing_yards'],
            'average_rushing_yards': average_team_performance.loc[0, 'average_rushing_yards'],
            'average_first_downs': average_team_performance.loc[0, 'average_first_downs'],
            'average_third_down_conversions': average_team_performance.loc[0, 'average_third_down_conversions'],
            'average_punts_inside_20': average_team_performance.loc[0, 'average_punts_inside_20'],
            'average_yards_per_play': average_team_performance.loc[0, 'average_yards_per_play'],
            'average_offensive_plays': average_team_performance.loc[0, 'average_offensive_plays'],
            'average_home_points_scored': average_team_performance_for_home.loc[0, 'average_home_points_scored'],
            'average_home_points_allowed': average_team_performance_for_home.loc[0, 'average_home_points_allowed'],
            'average_home_total_score': average_team_performance_for_home.loc[0, 'average_home_total_score'],
            'average_home_passing_yards': average_team_performance_for_home.loc[0, 'average_home_passing_yards'],
            'average_home_rushing_yards': average_team_performance_for_home.loc[0, 'average_home_rushing_yards'],
            'average_home_first_downs': average_team_performance_for_home.loc[0, 'average_home_first_downs'],
            'average_home_third_down_conversions': average_team_performance_for_home.loc[0, 'average_home_third_down_conversions'],
            'average_home_punts_inside_20': average_team_performance_for_home.loc[0, 'average_home_punts_inside_20'],
            'average_home_yards_per_play': average_team_performance_for_home.loc[0, 'average_home_yards_per_play'],
            'average_home_offensive_plays': average_team_performance_for_home.loc[0, 'average_home_offensive_plays'],
            'average_away_points_scored': average_team_performance_for_away.loc[0, 'average_home_points_scored'],
            'average_away_points_allowed': average_team_performance_for_away.loc[0, 'average_home_points_allowed'],
            'average_away_total_score': average_team_performance_for_away.loc[0, 'average_home_total_score'],
            'average_away_passing_yards': average_team_performance_for_away.loc[0, 'average_home_passing_yards'],
            'average_away_rushing_yards': average_team_performance_for_away.loc[0, 'average_home_rushing_yards'],
            'average_away_first_downs': average_team_performance_for_away.loc[0, 'average_home_first_downs'],
            'average_away_third_down_conversions': average_team_performance_for_away.loc[0, 'average_home_third_down_conversions'],
            'average_away_punts_inside_20': average_team_performance_for_away.loc[0, 'average_home_punts_inside_20'],
            'average_away_yards_per_play': average_team_performance_for_away.loc[0, 'average_home_yards_per_play'],
            'average_away_offensive_plays': average_team_performance_for_away.loc[0, 'average_home_offensive_plays'],
            'average_vs_opponent_points_scored': average_team_performance_vs_opponent.loc[0, 'average_home_points_scored'],
            'average_vs_opponent_points_allowed': average_team_performance_vs_opponent.loc[0, 'average_home_points_allowed'],
            'average_vs_opponent_total_score': average_team_performance_vs_opponent.loc[0, 'average_home_total_score'],
            'average_vs_opponent_passing_yards': average_team_performance_vs_opponent.loc[0, 'average_home_passing_yards'],
            'average_vs_opponent_rushing_yards': average_team_performance_vs_opponent.loc[0, 'average_home_rushing_yards'],
            'average_vs_opponent_first_downs': average_team_performance_vs_opponent.loc[0, 'average_home_first_downs'],
            'average_vs_opponent_third_down_conversions': average_team_performance_vs_opponent.loc[0, 'average_home_third_down_conversions'],
            'average_vs_opponent_punts_inside_20': average_team_performance_vs_opponent.loc[0, 'average_home_punts_inside_20'],
            'average_vs_opponent_yards_per_play': average_team_performance_vs_opponent.loc[0, 'average_home_yards_per_play'],
            'average_vs_opponent_offensive_plays': average_team_performance_vs_opponent.loc[0, 'average_home_offensive_plays'],
            'average_redzone_attempts': average_team_performance.loc[0, 'average_redzone_attempts'],
            'average_home_redzone_attempts': average_team_performance_for_home.loc[0, 'average_home_redzone_attempts'],
            'average_away_redzone_attempts': average_team_performance_for_away.loc[0, 'average_home_redzone_attempts'],
            'average_vs_opponent_redzone_attempts': average_team_performance_vs_opponent.loc[0, 'average_home_redzone_attempts'],
            'average_fg_attempted': average_team_performance.loc[0, 'average_fg_attempted'],
            'average_home_fg_attempted': average_team_performance_for_home.loc[0, 'average_fg_attempted'],
            'average_away_fg_attempted': average_team_performance_for_away.loc[0, 'average_fg_attempted'],
            'average_vs_opponent_fg_attempted': average_team_performance_vs_opponent.loc[0, 'average_fg_attempted'],
            'average_epa': average_team_performance.loc[0, 'average_epa'],
            'average_home_epa': average_team_performance_for_home.loc[0, 'average_epa'],
            'average_away_epa': average_team_performance_for_away.loc[0, 'average_epa'],
            'average_epa_against_opponent': average_team_performance_vs_opponent.loc[0, 'average_epa']
        })
        # print(f'Inserted {team_id} for {schedule_id}')
    completed += 1

# commit
conn.connection.commit()

# close
conn.close()