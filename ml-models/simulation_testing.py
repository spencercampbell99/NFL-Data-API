from collections import Counter
from matplotlib import pyplot as plt
from mysql_connection import MySQLConnection
from sqlalchemy import text
# conn = MySQLConnection()
import pandas as pd
import numpy as np

schedule_id = 401547594 # week 15 MIA @ NYJ

features_coefs = {
    'team_passing_first_downs': 1.5285072219308058,
    'team_rushing_first_downs': 0.5541503712179643,
    'team_third_down_conversions': 0.7494697196992546,
    'team_red_zone_attempts': 2.6885252837842413,
    'team_passing_yards': -0.782712970540092,
    'team_yards_per_pass_attempt': 4.235795839045554,
    'team_sacks_allowed': -0.01541669822940117,
    'team_sack_yards_lost': -0.07809528559447797,
    'team_rushing_yards': 2.2676362517409556,
    'team_rushing_attempts': -0.8886392144862788,
    'team_turnovers': -1.157713429955479,
    'team_punts': 0.6257555170686746,
    'opp_rushing_attempts': -0.4873604991944854,
    'opp_defense_special_teams_qb_hits': -0.12691653950059845,
    'spread': 0.7649359979796952,
    'over_under': 0.7381265848861227
}

def calculate_offense_stat_averages(team_id, season, week, conn, weeks_back=5):
    """
    Calculate the average offensive statistics for a team over a specified number of weeks.
    
    Parameters:
        team_id (int): The ID of the team.
        season (int): The season year.
        week (int): The current week.
        weeks_back (int, optional): The number of weeks to include in the average calculation. Default is 5.
    """

    query = text(
        f"""
            WITH RankedGames AS (
                SELECT
                    team.passing_first_downs as team_passing_first_downs,
                    team.rushing_first_downs AS team_rushing_first_downs,
                    team.third_down_conversions AS team_third_down_conversions,
                    team.red_zone_attempts AS team_red_zone_attempts,
                    team.passing_yards AS team_passing_yards,
                    team.yards_per_pass_attempt AS team_yards_per_pass_attempt,
                    team.sacks_allowed AS team_sacks_allowed,
                    team.sack_yards_lost AS team_sack_yards_lost,
                    team.rushing_yards AS team_rushing_yards,
                    team.rushing_attempts AS team_rushing_attempts,
                    team.turnovers AS team_turnovers,
                    team.punts AS team_punts,
                    opp.rushing_attempts AS opp_rushing_attempts,
                    opp.defense_special_teams_qb_hits AS opp_defense_special_teams_qb_hits,
                    ROW_NUMBER() OVER (PARTITION BY team.team_id ORDER BY season DESC, week DESC) AS `rank`
                FROM
                    box_scores team
                JOIN schedules on schedules.id = team.schedule_id
                JOIN box_scores opp on opp.schedule_id = schedules.id AND opp.team_id != team.team_id
                WHERE
                    (season < {season} OR (season = {season} AND week < {week})) AND team.team_id = {team_id}
                LIMIT {weeks_back}
            )
            SELECT 
                AVG(team_passing_first_downs) AS passing_first_downs,
                AVG(team_rushing_first_downs) AS rushing_first_downs,
                AVG(team_third_down_conversions) AS third_down_conversions,
                AVG(team_red_zone_attempts) AS red_zone_attempts,
                AVG(team_passing_yards) AS passing_yards,
                AVG(team_yards_per_pass_attempt) AS yards_per_pass_attempt,
                AVG(team_sacks_allowed) AS sacks_allowed,
                AVG(team_sack_yards_lost) AS sack_yards_lost,
                AVG(team_rushing_yards) AS rushing_yards,
                AVG(team_rushing_attempts) AS rushing_attempts,
                AVG(team_turnovers) AS turnovers,
                AVG(team_punts) AS punts,
                AVG(opp_rushing_attempts) AS rushing_attempts_allowed,
                AVG(opp_defense_special_teams_qb_hits) AS defense_special_teams_qb_hits_allowed
            FROM RankedGames
            WHERE `rank` <= {weeks_back}
        """
    )
    
    # execute query
    df = pd.read_sql_query(query, conn.connection)
    
    return df

def calculate_defense_stat_averages(team_id, season, week, conn, weeks_back=5):
    """
    Calculate the average defensive statistics for a team over a specified number of weeks.
    
    Parameters:
        team_id (int): The ID of the team.
        season (int): The season year.
        week (int): The current week.
        weeks_back (int, optional): The number of weeks to include in the average calculation. Default is 5.
    """

    query = text(
        f"""
            WITH RankedGames AS (
                SELECT
                    opp.passing_first_downs as opp_passing_first_downs,
                    opp.rushing_first_downs AS opp_rushing_first_downs,
                    opp.third_down_conversions AS opp_third_down_conversions,
                    opp.red_zone_attempts AS opp_red_zone_attempts,
                    opp.passing_yards AS opp_passing_yards,
                    opp.yards_per_pass_attempt AS opp_yards_per_pass_attempt,
                    opp.sacks_allowed AS opp_sacks_allowed,
                    opp.sack_yards_lost AS opp_sack_yards_lost,
                    opp.rushing_yards AS opp_rushing_yards,
                    opp.rushing_attempts AS opp_rushing_attempts,
                    opp.turnovers AS opp_turnovers,
                    opp.punts AS opp_punts,
                    team.rushing_attempts AS team_rushing_attempts,
                    team.defense_special_teams_qb_hits AS team_defense_special_teams_qb_hits,
                    ROW_NUMBER() OVER (PARTITION BY team.team_id ORDER BY season DESC, week DESC) AS `rank`
                FROM
                    box_scores team
                JOIN schedules on schedules.id = team.schedule_id
                JOIN box_scores opp on opp.schedule_id = schedules.id AND opp.team_id != team.team_id
                WHERE
                    (season < {season} OR (season = {season} AND week < {week})) AND team.team_id = {team_id}
                LIMIT {weeks_back}
            )
            SELECT 
                AVG(opp_passing_first_downs) AS passing_first_downs,
                AVG(opp_rushing_first_downs) AS rushing_first_downs,
                AVG(opp_third_down_conversions) AS third_down_conversions,
                AVG(opp_red_zone_attempts) AS red_zone_attempts,
                AVG(opp_passing_yards) AS passing_yards,
                AVG(opp_yards_per_pass_attempt) AS yards_per_pass_attempt,
                AVG(opp_sacks_allowed) AS sacks_allowed,
                AVG(opp_sack_yards_lost) AS sack_yards_lost,
                AVG(opp_rushing_yards) AS rushing_yards,
                AVG(opp_rushing_attempts) AS rushing_attempts,
                AVG(opp_turnovers) AS turnovers,
                AVG(opp_punts) AS punts,
                AVG(team_rushing_attempts) AS rushing_attempts_allowed,
                AVG(team_defense_special_teams_qb_hits) AS defense_special_teams_qb_hits_allowed
            FROM RankedGames
            WHERE `rank` <= {weeks_back}
        """
    )
    df = pd.read_sql_query(query, conn.connection)
    
    return df
    
# game = pd.read_sql_query(f"SELECT * FROM schedules WHERE id = {schedule_id}", conn.connection)
# home_team_id = game['home_team_id'][0]
# away_team_id = game['away_team_id'][0]
# game_id = game['id'][0]

# # get the average offensive stats for the home team
# home_team_off_stats = calculate_offense_stat_averages(home_team_id, 2023, 15, weeks_back=8)
# away_team_def_stats = calculate_defense_stat_averages(away_team_id, 2023, 15, weeks_back=8)
# home_team_def_stats = calculate_defense_stat_averages(home_team_id, 2023, 15, weeks_back=8)
# away_team_off_stats = calculate_offense_stat_averages(away_team_id, 2023, 15, weeks_back=8)

# # calculate the expected stats for the home team by taking the average of the home team's offensive stats and the away team's defensive stats
# home_team_general_expected_stats = (home_team_off_stats + away_team_def_stats) / 2
# away_team_general_expected_stats = (away_team_off_stats + home_team_def_stats) / 2

# # compare the two teams' expected stats to their actual stats for the matchup
# home_team_stats = calculate_offense_stat_averages(home_team_id, 2023, 16, weeks_back=1)
# away_team_stats = calculate_offense_stat_averages(away_team_id, 2023, 16, weeks_back=1)

# # calculate the difference between the expected stats and the actual stats
# home_team_stats = home_team_stats - home_team_general_expected_stats
# away_team_stats = away_team_stats - away_team_general_expected_stats

# print the difference between the expected stats and the actual stats
# print(home_team_stats.iloc[0])

# print("\n\nMIA performance: ")
# print(away_team_stats.iloc[0])

# run monte carlo simulations
num_simulations = 10000

def calculate_team_score(team_stats, model_weights):
    score = 0
    for stat, weight in model_weights.items():
        score += team_stats.get(stat, 0) * weight
    return score


def simulate_game(team1_stats, team2_stats, model_weights):
    # Calculate team scores
    team1_score = calculate_team_score(team1_stats, model_weights)
    team2_score = calculate_team_score(team2_stats, model_weights)

    # Determine the outcome
    # This is a simple comparison, but you can introduce randomness or other factors
    if team1_score > team2_score:
        return 'Team1_Win'
    elif team1_score < team2_score:
        return 'Team2_Win'
    else:
        return 'Draw'
