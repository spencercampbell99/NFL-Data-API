from MysqlConnection import MySQLConnection
import pandas as pd
from sqlalchemy import text

from simulation_testing import calculate_defense_stat_averages, calculate_offense_stat_averages

total_model_columns = [
    "points_scored",
    "points_allowed",
    "rushing_yards",
    "passing_yards",
    "rushing_first_downs",
    "passing_first_downs",
    "penalty_first_downs",
    "first_downs",
    "punts",
    "touchbacks",
    "punts_inside_20",
    "yards_per_punt",
    "yards_per_pass_attempt",
    "yards_per_rush",
    "punt_yards",
    "team_total_penalties",
    "penalty_yards_against",
    "turnovers",
    "fumbles_lost",
    "interceptions_thrown",
    "third_down_attempts",
    "third_down_conversions",
    "fourth_down_attempts",
    "fourth_down_conversions",
    "red_zone_attempts",
    "red_zone_scores",
    "time_of_possession",
    "total_offensive_plays",
    "total_offensive_yards",
    "yards_per_play",
    "passing_attempts",
    "passing_completions",
    "sacks_allowed",
    "rushing_attempts",
    # "rushing_touchdowns",
    # "passing_touchdowns",
    "field_goals_made",
    "field_goals_attempted",
    "extra_points_made",
    "extra_points_attempted",
    "defense_qb_hits",
    'defense_sacks',
    'total_epa',
    'passing_epa',
    'rushing_epa',
    'receiving_epa'
]

def get_total_score_data(start_year, end_year):
    """
    Retrieves the total score data for NFL games within a specified range of years.

    Parameters:
    start_year (int): The starting year of the range.
    end_year (int): The ending year of the range.

    Returns:
    pandas.DataFrame: A DataFrame containing the total score data for the specified range of years.
    """
    
    query = f"""
        SELECT
            {', '.join([f'home.{col} + away.{col} as {col}' for col in total_model_columns])},
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            home.points_scored + away.points_scored as total_points_scored,
            over_under,
            spread,
            CASE WHEN spread >= 0 THEN CASE WHEN home.points_scored - away.points_scored >= spread THEN 1 ELSE 0 END ELSE CASE WHEN home.points_scored - away.points_scored > spread THEN 0 ELSE 1 END END as spread_covered,
            CASE WHEN spread >= 0 THEN home.points_scored - away.points_scored ELSE away.points_scored - home.points_scored END as actual_spread,
            CASE WHEN spread >= 0 THEN home.points_scored - away.points_scored - spread ELSE away.points_scored - home.points_scored - abs(spread) END as spread_covered_by,
            CASE WHEN home.points_scored + away.points_scored > schedules.over_under THEN 'over' ELSE 'under' END as over_under_result
        FROM
            schedules
        JOIN box_scores home ON schedules.home_team_id = home.team_id AND schedules.id = home.schedule_id
        JOIN box_scores away ON schedules.away_team_id = away.team_id AND schedules.id = away.schedule_id
        WHERE
            schedules.game_type = 'REG'
            AND (schedules.season >= {start_year} AND schedules.season <= {end_year})
    """
    connection = MySQLConnection()
    data = pd.read_sql(query, con=connection.connection)
    connection.close()
    
    # create percentage columns
    # data['home_third_down_percentage'] = data['home_third_down_conversions'] / data['home_third_down_attempts']
    # data['away_third_down_percentage'] = data['away_third_down_conversions'] / data['away_third_down_attempts']
    # data['home_fourth_down_percentage'] = data['home_fourth_down_conversions'] / data['home_fourth_down_attempts']
    # data['away_fourth_down_percentage'] = data['away_fourth_down_conversions'] / data['away_fourth_down_attempts']
    # data['home_red_zone_percentage'] = data['home_red_zone_scores'] / data['home_red_zone_attempts']
    # data['away_red_zone_percentage'] = data['away_red_zone_scores'] / data['away_red_zone_attempts']
    # data['home_field_goal_percentage'] = data['home_field_goals_made'] / data['home_field_goals_attempted']
    # data['away_field_goal_percentage'] = data['away_field_goals_made'] / data['away_field_goals_attempted']
    # data['home_extra_point_percentage'] = data['home_extra_points_made'] / data['home_extra_points_attempted']
    # data['away_extra_point_percentage'] = data['away_extra_points_made'] / data['away_extra_points_attempted']
    # data['home_critical_situation_percentage'] = (data['home_third_down_conversions'] + data['home_fourth_down_conversions'] + data['home_red_zone_scores']) / (data['home_third_down_attempts'] + data['home_fourth_down_attempts'] + data['home_red_zone_attempts'])
    # data['away_critical_situation_percentage'] = (data['away_third_down_conversions'] + data['away_fourth_down_conversions'] + data['away_red_zone_scores']) / (data['away_third_down_attempts'] + data['away_fourth_down_attempts'] + data['away_red_zone_attempts'])

    # convert time of possession to seconds
    data['home_time_of_possession'] = data['home_time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
    data['away_time_of_possession'] = data['away_time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
    
    return data

def get_games_for_week(week, season, connection):
    """
    Retreives the games for a given week and season.

    Parameters:
    week (int): The week of the season.
    season (int): The season.
    connection (MySQLConnection): The connection to use.

    Returns:
    pandas.DataFrame: A DataFrame containing the games for the given week and season.
    """
    
    query = f"""
        SELECT
            schedules.*,
            home.points_scored as home_points_scored,
            home.points_allowed as away_points_scored
        FROM
            schedules
        LEFT JOIN box_scores home ON schedules.home_team_id = home.team_id AND schedules.id = home.schedule_id
        WHERE
            game_type = 'REG'
            AND season = %s
            AND week = %s
    """
    df = pd.read_sql(query, con=connection.connection, params=(season, week, ))
    
    # set short_name = away @ home
    df['short_name'] = df['away_team_char_id'] + ' @ ' + df['home_team_char_id']
    
    return df

team_expected_values_query = text(f"""
    WITH RankedOppDefenseGames AS (
        SELECT
            opp.*,
            ROW_NUMBER() OVER (PARTITION BY team.team_id ORDER BY season DESC, week DESC) AS `rank`
        FROM
            box_scores team
        JOIN schedules on schedules.id = team.schedule_id
        JOIN box_scores opp on opp.schedule_id = schedules.id AND opp.team_id != team.team_id
        WHERE
            (season < :season OR (season = :season AND week < :week)) AND team.team_id = :opp_team_id
        ORDER BY `rank` ASC
        LIMIT :weeks_back
    ),
    RankedTeamOffenseGames AS (
        SELECT
            team.*,
            ROW_NUMBER() OVER (PARTITION BY team.team_id ORDER BY season DESC, week DESC) AS `rank`
        FROM
            box_scores team
        JOIN schedules on schedules.id = team.schedule_id
        JOIN box_scores opp on opp.schedule_id = schedules.id AND opp.team_id != team.team_id
        WHERE
            (season < :season OR (season = :season AND week < :week)) AND team.team_id = :team_id
        ORDER BY `rank` ASC
        LIMIT :weeks_back
    )
    SELECT 
        (AVG(RankedOppDefenseGames.passing_first_downs) + AVG(RankedTeamOffenseGames.passing_first_downs)) / 2 as passing_first_downs,
        (AVG(RankedOppDefenseGames.rushing_first_downs) + AVG(RankedTeamOffenseGames.rushing_first_downs)) / 2 as rushing_first_downs,
        (AVG(RankedOppDefenseGames.third_down_attempts) + AVG(RankedTeamOffenseGames.third_down_attempts)) / 2 as third_down_attempts,
        (AVG(RankedOppDefenseGames.third_down_conversions) + AVG(RankedTeamOffenseGames.third_down_conversions)) / 2 as third_down_conversions,
        (AVG(RankedOppDefenseGames.red_zone_attempts) + AVG(RankedTeamOffenseGames.red_zone_attempts)) / 2 as red_zone_attempts,
        (AVG(RankedOppDefenseGames.total_offensive_plays) + AVG(RankedTeamOffenseGames.total_offensive_plays)) / 2 as total_offensive_plays,
        (AVG(RankedOppDefenseGames.total_offensive_yards) + AVG(RankedTeamOffenseGames.total_offensive_yards)) / 2 as total_offensive_yards,
        (AVG(RankedOppDefenseGames.yards_per_play) + AVG(RankedTeamOffenseGames.yards_per_play)) / 2 as yards_per_play,
        (AVG(RankedOppDefenseGames.yards_per_pass_attempt) + AVG(RankedTeamOffenseGames.yards_per_pass_attempt)) / 2 as yards_per_pass_attempt,
        (AVG(RankedOppDefenseGames.yards_per_rush) + AVG(RankedTeamOffenseGames.yards_per_rush)) / 2 as yards_per_rush,
        (AVG(RankedOppDefenseGames.punts) + AVG(RankedTeamOffenseGames.punts)) / 2 as punts,
        (AVG(RankedOppDefenseGames.punts_inside_20) + AVG(RankedTeamOffenseGames.punts_inside_20)) / 2 as punts_inside_20,
        (AVG(RankedOppDefenseGames.defense_sacks) + AVG(RankedTeamOffenseGames.defense_sacks)) / 2 as defense_sacks,
        (AVG(RankedOppDefenseGames.sacks_allowed) + AVG(RankedTeamOffenseGames.sacks_allowed)) / 2 as sacks_allowed,
        (AVG(RankedOppDefenseGames.passing_completions) + AVG(RankedTeamOffenseGames.passing_completions)) / 2 as passing_completions
    FROM RankedOppDefenseGames
    JOIN RankedTeamOffenseGames ON RankedTeamOffenseGames.rank = RankedOppDefenseGames.rank
    WHERE RankedOppDefenseGames.`rank` <= :weeks_back                    
""")

def calculate_team_expected_values_for_matchup(team_id, opp_id, season, week, weeks_back, conn):
    """
    Calculates the expected values for a team for a given matchup.

    Parameters:
    team_id (int): The team ID.
    opp_id (int): The opponent ID.
    season (int): The season.
    week (int): The week.
    weeks_back (int): The number of weeks back to get the average for.
    conn (MySQLConnection): The connection to use.

    Returns:
    pandas.DataFrame: A DataFrame containing the expected values for the team for the given matchup.
    """
    
    # get the expected values
    df = pd.read_sql(team_expected_values_query, con=conn.connection, params={
        'season': season,
        'week': week,
        'team_id': team_id,
        'opp_team_id': opp_id,
        'weeks_back': weeks_back,
    })
    return df

def get_total_score_data_expected_values(week, season, connection, weeks_back = 8):
    
    """
    Retrieves the total score data for NFL games within a specified range of years.

    Parameters:
    week (int): The week of the season.
    season (int): The season.
    connection (MySQLConnection): The connection to use.
    weeks_back (int): The number of weeks back to get the average for.

    Returns:
    pandas.DataFrame: A DataFrame containing the total score data for the specified range of years.
    """
    
    games_for_week = get_games_for_week(week, season, connection)
    
    # init dataframe
    data = None
    for index, game in games_for_week.iterrows():
        home_team_df = calculate_team_expected_values_for_matchup(game['home_team_id'], game['away_team_id'], game['season'], game['week'], weeks_back, connection)
        away_team_df = calculate_team_expected_values_for_matchup(game['away_team_id'], game['home_team_id'], game['season'], game['week'], weeks_back, connection)
        
        combined_df = home_team_df + away_team_df
        
        # add over_under and matchup columns
        combined_df['over_under'] = game['over_under']
        combined_df['matchup'] = f'{game["home_team_char_id"]} vs {game["away_team_char_id"]}'
        
        # add metadata columns
        if game['home_points_scored']:
            combined_df['total_points_scored'] = game['home_points_scored'] + game['away_points_scored']
        else:
            combined_df['total_points_scored'] = 0
        
        
        # append combined_df to df
        if data is None:
            data = combined_df
        else:
            data = pd.concat([data, combined_df])
    
    return data

def get_total_score_data_with_averages(week, season, connection, weeks_back = 8):
    """
    Retrieves the total score data for NFL games within a specified range of years.

    Parameters:
    week (int): The week of the season.
    season (int): The season.
    connection (MySQLConnection): The connection to use.
    weeks_back (int): The number of weeks back to get the average for.

    Returns:
    pandas.DataFrame: A DataFrame containing the total score data for the specified range of years.
    """
    
    games_for_week = get_games_for_week(week, season, connection)
    
    query = f"""
        WITH RankedBoxScores AS (
            SELECT
                box_scores.*,
                ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY season DESC, week DESC) as `row_number`
            FROM
                box_scores
            JOIN schedules ON box_scores.schedule_id = schedules.id
            WHERE
                team_id = %s AND (season < %s OR (season = %s AND week < %s))
        )
        SELECT
            {', '.join([f'AVG({col}) as {col}' for col in total_model_columns])},
            AVG(points_scored + points_allowed) as avg_total_points_scored
        FROM
            RankedBoxScores
        WHERE
            `row_number` <= {weeks_back}
    """
    
    # init dataframe
    data = pd.DataFrame(columns=['home_' + col for col in total_model_columns] + ['away_' + col for col in total_model_columns] + ['home_team_id', 'away_team_id', 'home_char_id', 'away_char_id', 'total_points_scored', 'matchup', 'over_under'])
    for index, game in games_for_week.iterrows():
        home_team_df = pd.read_sql(query, con=connection.connection, params=(game['home_team_id'], game['season'], game['season'], game['week'], ))
        away_team_df = pd.read_sql(query, con=connection.connection, params=(game['away_team_id'], game['season'], game['season'], game['week'], ))
        
        # apply home and away prefixes
        home_team_df.columns = ['home_' + col for col in home_team_df.columns]
        away_team_df.columns = ['away_' + col for col in away_team_df.columns]
        
        # combine dataframes
        combined_df = pd.concat([home_team_df, away_team_df], axis=1)
        
        # add metadata columns to combined_df
        combined_df['home_team_id'] = game['home_team_id']
        combined_df['away_team_id'] = game['away_team_id']
        combined_df['home_char_id'] = game['home_team_char_id']
        combined_df['away_char_id'] = game['away_team_char_id']
        combined_df['total_points_scored'] = game['home_points_scored'] + game['away_points_scored']
        combined_df['matchup'] = f'{game["home_team_char_id"]} vs {game["away_team_char_id"]}'
        combined_df['over_under'] = game['over_under']
        combined_df['spread'] = game['spread']
        if game['spread'] >= 0:
            combined_df['spread_covered'] = 1 if game['home_points_scored'] - game['away_points_scored'] >= game['spread'] else 0
        else:
            combined_df['spread_covered'] = 0 if game['home_points_scored'] - game['away_points_scored'] > game['spread'] else 1
        combined_df['over_under_result'] = 'over' if combined_df['total_points_scored'][0] >= game['over_under'] else 'under'
        
        # append combined_df to df
        data = pd.concat([data, combined_df])

    data['home_third_down_percentage'] = data['home_third_down_conversions'] / data['home_third_down_attempts']
    data['away_third_down_percentage'] = data['away_third_down_conversions'] / data['away_third_down_attempts']
    data['home_fourth_down_percentage'] = data['home_fourth_down_conversions'] / data['home_fourth_down_attempts']
    data['away_fourth_down_percentage'] = data['away_fourth_down_conversions'] / data['away_fourth_down_attempts']
    data['home_red_zone_percentage'] = data['home_red_zone_scores'] / data['home_red_zone_attempts']
    data['away_red_zone_percentage'] = data['away_red_zone_scores'] / data['away_red_zone_attempts']
    data['home_field_goal_percentage'] = data['home_field_goals_made'] / data['home_field_goals_attempted']
    data['away_field_goal_percentage'] = data['away_field_goals_made'] / data['away_field_goals_attempted']

    return data

score_model_columns = [
    "points_scored",
    "points_allowed",
    "rushing_yards",
    "passing_yards",
    "first_downs",
    "passing_first_downs",
    "rushing_first_downs",
    "punts_inside_20",
    "team_total_penalties",
    "penalty_yards_against",
    "turnovers",
    "third_down_attempts",
    "third_down_conversions",
    "fourth_down_attempts",
    "fourth_down_conversions",
    "red_zone_attempts",
    "red_zone_scores",
    "total_offensive_plays",
    "total_offensive_yards",
    "yards_per_play",
    "yards_per_pass_attempt",
    "passing_attempts",
    "passing_completions",
    "sacks_allowed",
    "sack_yards_lost",
    "punts",
    "rushing_attempts",
    "field_goals_made",
    "field_goals_attempted",
    "extra_points_made",
    "extra_points_attempted",
    "defense_qb_hits",
    'total_epa',
    'passing_epa',
    'rushing_epa',
    'receiving_epa',
    'time_of_possession'
]

def get_data_for_points_scored_model(start_year, end_year):
    """
    Retrieves data for a points scored model within a specified range of seasons.
    
    Parameters:
        start_year (int): The starting year of the range.
        end_year (int): The ending year of the range.
        
    Returns:
        pandas.DataFrame: The data containing various statistics for the points scored model.
    """
    
    query = f"""
        SELECT
            {', '.join([f'team.{col} as team_{col}' for col in score_model_columns])},
            {', '.join([f'opp.{col} as opp_{col}' for col in score_model_columns])},
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            team.home_team as is_home_team,
            team.points_scored as points_scored,
            over_under,
            case when team.team_id = schedules.home_team_id then schedules.spread else -schedules.spread end as spread
        FROM
            box_scores team
        JOIN box_scores opp ON team.opponent_id = opp.team_id AND team.schedule_id = opp.schedule_id
        JOIN schedules on team.schedule_id = schedules.id
        WHERE
            schedules.game_type = 'REG'
            AND (schedules.season >= {start_year} AND schedules.season <= {end_year})
    """
    connection = MySQLConnection()
    data = pd.read_sql(query, con=connection.connection)
    connection.close()
    
    # create percentage columns
    data['team_critical_situation_percentage'] = (data['team_third_down_conversions'] + data['team_fourth_down_conversions'] + data['team_red_zone_scores']) / (data['team_third_down_attempts'] + data['team_fourth_down_attempts'] + data['team_red_zone_attempts'])
    data['opp_critical_situation_percentage'] = (data['opp_third_down_conversions'] + data['opp_fourth_down_conversions'] + data['opp_red_zone_scores']) / (data['opp_third_down_attempts'] + data['opp_fourth_down_attempts'] + data['opp_red_zone_attempts'])

    # create sum columns
    # data['team_total_first_downs'] = data['team_rushing_first_downs'] + data['team_passing_first_downs'] + data['team_penalty_first_downs']
    # data['opp_total_first_downs'] = data['opp_rushing_first_downs'] + data['opp_passing_first_downs'] + data['opp_penalty_first_downs']

    # convert time of possession to seconds
    data['team_time_of_possession'] = data['team_time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
    # data['away_time_of_possession'] = data['away_time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
    
    data = data.dropna()
    
    return data

def get_data_for_points_scored_model_with_averages(week, season, connection, weeks_back = 8):
    """
    Retrieves data for a points scored model within a specified range of seasons.
    
    Parameters:
        week (int): The week of the season.
        season (int): The season.
        connection (MySQLConnection): The connection to use.
        weeks_back (int): The number of weeks back to get the average for.
        
    Returns:
        pandas.DataFrame: The data containing various statistics for the points scored model.
    """
    
    games_for_week = get_games_for_week(week, season, connection)
    
    # query = f"""
    #     WITH CurrentTeamPlayers AS (
    #         SELECT DISTINCT player_id
    #         FROM player_game_stats
    #         JOIN schedules ON player_game_stats.schedule_id = schedules.id
    #         WHERE
    #             team_id = %s AND season = %s AND week = %s
    #     )
    #     SELECT
    #         {', '.join([f'AVG({col}) as {col}' for col in score_model_columns])},
    #         AVG(points_scored) as avg_points_scored,
    #         AVG(points_allowed) as avg_points_allowed
    #     FROM (
    #         SELECT
    #             player_game_stats.*,
    #             ROW_NUMBER() OVER (PARTITION BY player_game_stats.player_id ORDER BY season DESC, week DESC) as `row_number`
    #         FROM
    #             player_game_stats
    #         JOIN schedules ON player_game_stats.schedule_id = schedules.id
    #         JOIN CurrentTeamPlayers ON player_game_stats.player_id = CurrentTeamPlayers.player_id
    #         WHERE
    #             season < %s OR (season = %s AND week < %s)
    #     ) RankedPlayerStats
    #     WHERE
    #         `row_number` <= {weeks_back}
    # """
    
    query = f"""
        WITH RankedBoxScores AS (
            SELECT
                box_scores.*,
                ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY season DESC, week DESC) as `row_number`
            FROM
                box_scores
            JOIN schedules ON box_scores.schedule_id = schedules.id
            WHERE
                team_id = %s AND (season < %s OR (season = %s AND week < %s))
        )
        SELECT
            {', '.join([f'AVG({col}) as {col}' for col in score_model_columns])},
            AVG(points_scored + points_allowed) as avg_total_points_scored
        FROM
            RankedBoxScores
        WHERE
            `row_number` <= {weeks_back}
    """
    
    # init dataframe
    data = pd.DataFrame(columns=['team_' + col for col in score_model_columns] + ['opp_' + col for col in score_model_columns] + ['team_id', 'opp_id', 'team_char_id', 'opp_char_id', 'points_scored', 'points_allowed', 'matchup', 'over_under', 'spread', 'is_home_team'])
    for index, game in games_for_week.iterrows():
        team_df = pd.read_sql(query, con=connection.connection, params=(game['home_team_id'], game['season'], game['season'], game['week'], ))
        opp_df = pd.read_sql(query, con=connection.connection, params=(game['away_team_id'], game['season'], game['season'], game['week'], ))
        
        # apply home and away prefixes
        team_df.columns = ['team_' + col for col in team_df.columns]
        opp_df.columns = ['opp_' + col for col in opp_df.columns]
        
        # combine dataframes
        combined_df = pd.concat([team_df, opp_df], axis=1)
        
        # add metadata columns to combined_df
        combined_df['team_id'] = game['home_team_id']
        combined_df['opp_id'] = game['away_team_id']
        combined_df['team_char_id'] = game['home_team_char_id']
        combined_df['opp_char_id'] = game['away_team_char_id']
        combined_df['points_scored'] = game['home_points_scored']
        combined_df['points_allowed'] = game['away_points_scored']
        combined_df['matchup'] = f'{game["home_team_char_id"]} vs {game["away_team_char_id"]}'
        combined_df['over_under'] = game['over_under']
        combined_df['spread'] = game['spread']
        combined_df['is_home_team'] = 1
        
        # append combined_df to df
        data = pd.concat([data, combined_df])
        
        # do the same for the away team
        team_df = pd.read_sql(query, con=connection.connection, params=(game['away_team_id'], game['season'], game['season'], game['week'], ))
        opp_df = pd.read_sql(query, con=connection.connection, params=(game['home_team_id'], game['season'], game['season'], game['week'], ))
        
        # apply home and away prefixes
        team_df.columns = ['team_' + col for col in team_df.columns]
        opp_df.columns = ['opp_' + col for col in opp_df.columns]
        
        # combine dataframes
        combined_df = pd.concat([team_df, opp_df], axis=1)
        
        # add metadata columns to combined_df
        combined_df['team_id'] = game['away_team_id']
        combined_df['opp_id'] = game['home_team_id']
        combined_df['team_char_id'] = game['away_team_char_id']
        combined_df['opp_char_id'] = game['home_team_char_id']
        combined_df['points_scored'] = game['away_points_scored']
        combined_df['points_allowed'] = game['home_points_scored']
        combined_df['matchup'] = f'{game["away_team_char_id"]} vs {game["home_team_char_id"]}'
        combined_df['over_under'] = game['over_under']
        combined_df['spread'] = game['spread']
        combined_df['is_home_team'] = 0
        
        # append combined_df to df
        data = pd.concat([data, combined_df])
    
    # create percentage columns
    data['team_critical_situation_percentage'] = (data['team_third_down_conversions'] + data['team_fourth_down_conversions'] + data['team_red_zone_scores']) / (data['team_third_down_attempts'] + data['team_fourth_down_attempts'] + data['team_red_zone_attempts'])
    data['opp_critical_situation_percentage'] = (data['opp_third_down_conversions'] + data['opp_fourth_down_conversions'] + data['opp_red_zone_scores']) / (data['opp_third_down_attempts'] + data['opp_fourth_down_attempts'] + data['opp_red_zone_attempts'])
    
    # create sum columns
    # data['team_total_first_downs'] = data['team_rushing_first_downs'] + data['team_passing_first_downs'] + data['team_penalty_first_downs']
    # data['opp_total_first_downs'] = data['opp_rushing_first_downs'] + data['opp_passing_first_downs'] + data['opp_penalty_first_downs']
    
    # convert time of possession to seconds
    # data['home_time_of_possession'] = data['home_time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
    # data['away_time_of_possession'] = data['away_time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
    
    # data = data.dropna()
    return data

spread_model_columns_home_favorite = [
    '(home.average_home_points_scored - away.average_away_points_scored) as points_difference',
    '(home.average_home_points_allowed - away.average_away_points_allowed) as points_allowed_difference',
    '(home.average_home_total_score + away.average_away_total_score) / 2 as total_score',
    '(home.average_home_passing_yards - away.average_away_passing_yards) as passing_yards_difference',
    '(home.average_home_rushing_yards - away.average_away_rushing_yards) as rushing_yards_difference',
    '(home.average_home_first_downs - away.average_away_first_downs) as first_downs_difference',
    '(home.average_third_down_conversions - away.average_third_down_conversions) as third_down_conversions_difference',
    '(home.average_home_redzone_attempts - away.average_away_redzone_attempts) as red_zone_attempts_difference',
    '(home.average_home_offensive_plays - away.average_away_offensive_plays) as offensive_plays_difference',
    '(home.average_home_yards_per_play - away.average_away_yards_per_play) as yards_per_play_difference',
    '(home.average_punts_inside_20 - away.average_punts_inside_20) as punts_inside_20_difference',
    '(home.average_fg_attempted - away.average_fg_attempted) as fg_attempted_difference',
]

spread_model_columns_away_favorite = [
    '(away.average_away_points_scored - home.average_home_points_scored) as points_difference',
    '(away.average_away_points_allowed - home.average_home_points_allowed) as points_allowed_difference',
    '(away.average_away_total_score + home.average_home_total_score) / 2 as total_score',
    '(away.average_away_passing_yards - home.average_home_passing_yards) as passing_yards_difference',
    '(away.average_away_rushing_yards - home.average_home_rushing_yards) as rushing_yards_difference',
    '(away.average_away_first_downs - home.average_home_first_downs) as first_downs_difference',
    '(away.average_third_down_conversions - home.average_third_down_conversions) as third_down_conversions_difference',
    '(away.average_away_redzone_attempts - home.average_home_redzone_attempts) as red_zone_attempts_difference',
    '(away.average_away_offensive_plays - home.average_home_offensive_plays) as offensive_plays_difference',
    '(away.average_away_yards_per_play - home.average_home_yards_per_play) as yards_per_play_difference',
    '(away.average_punts_inside_20 - home.average_punts_inside_20) as punts_inside_20_difference',
    '(away.average_fg_attempted - home.average_fg_attempted) as fg_attempted_difference',
]

def get_spread_model_data(start_year, end_year):
    """
    Retrieves the spread data for NFL games within a specified range of years.

    Parameters:
    start_year (int): The starting year of the range.
    end_year (int): The ending year of the range.

    Returns:
    pandas.DataFrame: A DataFrame containing the total score data for the specified range of years.
    """
    
    home_favorite_query = f"""
        SELECT
            {', '.join(spread_model_columns_home_favorite)},
            CASE WHEN favorite.points_scored - underdog.points_scored >= abs(spread) THEN 1 ELSE 0 END as spread_covered,
            favorite.points_scored + underdog.points_scored as result_total_points_scored,
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            over_under,
            schedules.id as schedule_id,
            schedules.week as week,
            spread
        FROM
            schedules
        JOIN box_scores as favorite ON CASE WHEN spread >= 0 THEN favorite.team_id = schedules.home_team_id ELSE favorite.team_id = schedules.away_team_id END AND favorite.schedule_id = schedules.id
        JOIN box_scores as underdog ON CASE WHEN spread < 0 THEN underdog.team_id = schedules.home_team_id ELSE underdog.team_id = schedules.away_team_id END AND underdog.schedule_id = schedules.id
        JOIN averaged_team_performances home ON home.team_id = schedules.home_team_id AND home.schedule_id = (SELECT schedule_id FROM averaged_team_performances atp JOIN schedules s ON s.id = atp.schedule_id WHERE team_id = schedules.home_team_id AND (s.season < schedules.season OR (s.season = schedules.season AND s.week < schedules.week)) ORDER BY s.season DESC, s.week DESC LIMIT 1)
        JOIN averaged_team_performances away ON away.team_id = schedules.away_team_id AND away.schedule_id = (SELECT schedule_id FROM averaged_team_performances atp JOIN schedules s ON s.id = atp.schedule_id WHERE team_id = schedules.away_team_id AND (s.season < schedules.season OR (s.season = schedules.season AND s.week < schedules.week)) ORDER BY s.season DESC, s.week DESC LIMIT 1)
        WHERE
            schedules.game_type = 'REG'
            AND (schedules.season >= {start_year} AND schedules.season <= {end_year})
            AND favorite.home_team = 1
    """
    away_favorite_query = f"""
        SELECT
            {', '.join(spread_model_columns_away_favorite)},
            CASE WHEN favorite.points_scored - underdog.points_scored >= abs(spread) THEN 1 ELSE 0 END as spread_covered,
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            over_under,
            schedules.id as schedule_id,
            schedules.week as week,
            abs(spread) as spread
        FROM
            schedules
        JOIN box_scores as favorite ON CASE WHEN spread >= 0 THEN favorite.team_id = schedules.home_team_id ELSE favorite.team_id = schedules.away_team_id END AND favorite.schedule_id = schedules.id
        JOIN box_scores as underdog ON CASE WHEN spread < 0 THEN underdog.team_id = schedules.home_team_id ELSE underdog.team_id = schedules.away_team_id END AND underdog.schedule_id = schedules.id
        JOIN averaged_team_performances home ON home.team_id = schedules.home_team_id AND home.schedule_id = (SELECT schedule_id FROM averaged_team_performances atp JOIN schedules s ON s.id = atp.schedule_id WHERE team_id = schedules.home_team_id AND (s.season < schedules.season OR (s.season = schedules.season AND s.week < schedules.week)) ORDER BY s.season DESC, s.week DESC LIMIT 1)
        JOIN averaged_team_performances away ON away.team_id = schedules.away_team_id AND away.schedule_id = (SELECT schedule_id FROM averaged_team_performances atp JOIN schedules s ON s.id = atp.schedule_id WHERE team_id = schedules.away_team_id AND (s.season < schedules.season OR (s.season = schedules.season AND s.week < schedules.week)) ORDER BY s.season DESC, s.week DESC LIMIT 1)
        WHERE
            schedules.game_type = 'REG'
            AND (schedules.season >= {start_year} AND schedules.season <= {end_year})
            AND favorite.home_team = 0
    """
    connection = MySQLConnection()
    data = pd.read_sql(home_favorite_query, con=connection.connection)
    away_data = pd.read_sql(away_favorite_query, con=connection.connection)
    connection.close()
    
    data = pd.concat([data, away_data])
    
    data = data.dropna()
    return data

def get_spread_model_data_for_week(week, season, connection):
    """
    Retrieves the spread data for a given week and season.

    Parameters:
    week (int): The week of the season.
    season (int): The season.
    connection (MySQLConnection): The connection to use.

    Returns:
    pandas.DataFrame: A DataFrame containing the spread data for the given week and season.
    """
    
    home_favorite_query = f"""
        WITH MostRecentTeamPerformances AS (
            SELECT
                averaged_team_performances.*,
                ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY season DESC, week DESC) as `row_number`
            FROM
                averaged_team_performances
            JOIN schedules ON averaged_team_performances.schedule_id = schedules.id
            WHERE
                (season < {season} OR (season = {season} AND week < {week}))
                AND schedules.game_type = 'REG'
        )
        SELECT
            {', '.join(spread_model_columns_home_favorite)},
            CONCAT(schedules.away_team_char_id, ' @ ', schedules.home_team_char_id) as matchup,
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            over_under,
            schedules.id as schedule_id,
            schedules.week as week,
            abs(spread) as spread
        FROM
            schedules
        JOIN MostRecentTeamPerformances home ON home.team_id = schedules.home_team_id AND home.row_number = 1
        JOIN MostRecentTeamPerformances away ON away.team_id = schedules.away_team_id AND away.row_number = 1
        WHERE
            schedules.game_type = 'REG'
            AND schedules.season = {season}
            AND schedules.week = {week}
            AND schedules.spread > 0
    """
    away_favorite_query = f"""
        WITH MostRecentTeamPerformances AS (
            SELECT
                averaged_team_performances.*,
                ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY season DESC, week DESC) as `row_number`
            FROM
                averaged_team_performances
            JOIN schedules ON averaged_team_performances.schedule_id = schedules.id
            WHERE
                (season < {season} OR (season = {season} AND week < {week}))
                AND schedules.game_type = 'REG'
        )
        SELECT
            {', '.join(spread_model_columns_away_favorite)},
            CONCAT(schedules.away_team_char_id, ' @ ', schedules.home_team_char_id) as matchup,
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            over_under,
            schedules.id as schedule_id,
            schedules.week as week,
            spread
        FROM
            schedules
        JOIN MostRecentTeamPerformances home ON home.team_id = schedules.home_team_id AND home.row_number = 1
        JOIN MostRecentTeamPerformances away ON away.team_id = schedules.away_team_id AND away.row_number = 1
        WHERE
            schedules.game_type = 'REG'
            AND schedules.season = {season}
            AND schedules.week = {week}
            AND schedules.spread <= 0
    """
    data = pd.read_sql(home_favorite_query, con=connection.connection)
    away_data = pd.read_sql(away_favorite_query, con=connection.connection)
    data = pd.concat([data, away_data])
    
    data = data.dropna()
    return data
    

over_under_column_selects = [
    '(home.average_home_points_scored + away.average_away_points_allowed) as home_points_scored',
    '(home.average_home_points_allowed + away.average_away_points_scored) as home_points_allowed',
    'home.average_home_points_scored + away.average_away_points_allowed as total_points_scored',
    '(home.average_home_total_score + away.average_away_total_score) / 2 as total_score',
    '(home.average_home_passing_yards + away.average_away_passing_yards) as passing_yards',
    '(home.average_home_rushing_yards + away.average_away_rushing_yards) as rushing_yards',
    '(home.average_home_first_downs + away.average_away_first_downs) as first_downs',
    '(home.average_third_down_conversions + away.average_third_down_conversions) as third_down_conversions',
    '(home.average_home_redzone_attempts + away.average_away_redzone_attempts) as red_zone_attempts',
    '(home.average_home_offensive_plays + away.average_away_offensive_plays) as offensive_plays',
    '(home.average_home_yards_per_play + away.average_away_yards_per_play) as yards_per_play',
    '(home.average_punts_inside_20 + away.average_punts_inside_20) as punts_inside_20',
    '(home.average_fg_attempted + away.average_fg_attempted) as fg_attempted',
    # '(home.passing_epa + away.passing_epa) / 2 as passing_epa',
    # '(home.rushing_epa + away.rushing_epa) / 2 as rushing_epa',
    # '(home.receiving_epa + away.receiving_epa) / 2 as receiving_epa',
    '(home.average_home_epa + away.average_away_epa) / 2 as total_epa',
]

def get_over_under_data(start_year, end_year):
    """
    Retrieves the over under data for NFL games within a specified range of years.

    Parameters:
    start_year (int): The starting year of the range.
    end_year (int): The ending year of the range.

    Returns:
    pandas.DataFrame: A DataFrame containing the total score data for the specified range of years.
    """
    
    query = f"""
        SELECT
            {', '.join(over_under_column_selects)},
            CASE WHEN favorite.points_scored + underdog.points_scored > over_under THEN 1 ELSE 0 END as over_under_covered,
            favorite.points_scored + underdog.points_scored - over_under as over_under_covered_by,
            favorite.points_scored + underdog.points_scored > over_under as over_under_result,
            favorite.points_scored + underdog.points_scored as result_total_points_scored,
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            over_under,
            schedules.id as schedule_id,
            schedules.week as week,
            spread
        FROM
            schedules
        JOIN box_scores as favorite ON CASE WHEN spread >= 0 THEN favorite.team_id = schedules.home_team_id ELSE favorite.team_id = schedules.away_team_id END AND favorite.schedule_id = schedules.id
        JOIN box_scores as underdog ON CASE WHEN spread < 0 THEN underdog.team_id = schedules.home_team_id ELSE underdog.team_id = schedules.away_team_id END AND underdog.schedule_id = schedules.id
        JOIN averaged_team_performances home ON home.team_id = schedules.home_team_id AND home.next_schedule_id = schedules.id
        JOIN averaged_team_performances away ON away.team_id = schedules.away_team_id AND away.next_schedule_id = schedules.id
        WHERE
            schedules.game_type = 'REG'
            AND (schedules.season >= {start_year} AND schedules.season <= {end_year})
    """
    connection = MySQLConnection()
    data = pd.read_sql(query, con=connection.connection)
    connection.close()
    
    data = data.dropna()
    
    # drop duplicate rows by schedule_id
    data = data.drop_duplicates(subset=['schedule_id'])
    
    return data

def get_over_under_data_for_week(week, season, connection):
    """
    Retrieves the over under data for a given week and season.

    Parameters:
    week (int): The week of the season.
    season (int): The season.
    connection (MySQLConnection): The connection to use.

    Returns:
    pandas.DataFrame: A DataFrame containing the over under data for the given week and season.
    """
    
    query = f"""
        WITH MostRecentTeamPerformances AS (
            SELECT
                averaged_team_performances.*,
                ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY season DESC, week DESC) as `row_number`
            FROM
                averaged_team_performances
            JOIN schedules ON averaged_team_performances.schedule_id = schedules.id
            WHERE
                (season < {season} OR (season = {season} AND week < {week}))
                AND schedules.game_type = 'REG'
        )
        SELECT
            {', '.join(over_under_column_selects)},
            schedules.home_team_char_id as home_team,
            schedules.away_team_char_id as away_team,
            over_under,
            schedules.id as schedule_id,
            schedules.week as week,
            spread
        FROM
            schedules
        JOIN MostRecentTeamPerformances home ON home.team_id = schedules.home_team_id AND home.row_number = 1
        JOIN MostRecentTeamPerformances away ON away.team_id = schedules.away_team_id AND away.row_number = 1
        WHERE
            schedules.game_type = 'REG'
            AND schedules.season = {season}
            AND schedules.week = {week}
    """
    data = pd.read_sql(query, con=connection.connection)
    
    data = data.dropna()
    
    # drop duplicate rows by schedule_id
    data = data.drop_duplicates(subset=['schedule_id'])
    
    # create matchup column
    data['matchup'] = data['away_team'] + ' @ ' + data['home_team']
    
    return data

def build_expected_results_for_score_moden_training(start_year, end_year, conn=None, weeks_back=6):
    
    
    should_close_connection = False
    if conn is None:
        conn = MySQLConnection()
        should_close_connection = True
    
    data = None
    
    for year in range(start_year, end_year + 1):
        for week in range(1, 18):
            # games for week
            games_for_week = get_games_for_week(week, 2023, connection=conn)
            
            for index, game in games_for_week.iterrows():
                home_team_off_stats = calculate_offense_stat_averages(game['home_team_id'], 2023, week, weeks_back=weeks_back, conn=conn)
                away_team_def_stats = calculate_defense_stat_averages(game['away_team_id'], 2023, week, weeks_back=weeks_back, conn=conn)
                home_team_def_stats = calculate_defense_stat_averages(game['home_team_id'], 2023, week, weeks_back=weeks_back, conn=conn)
                away_team_off_stats = calculate_offense_stat_averages(game['away_team_id'], 2023, week, weeks_back=weeks_back, conn=conn)
                
                # calculate the expected stats for the home team by taking the average of the home team's offensive stats and the away team's defensive stats
                home_team_general_expected_stats = (home_team_off_stats + away_team_def_stats) / 2
                away_team_general_expected_stats = (away_team_off_stats + home_team_def_stats) / 2

                # rename columns (columns that don't contain _allowed, append team_ to the start, otherwise append opp_ and drop _allowed)
                home_team_general_expected_stats.rename(columns=lambda x: 'team_' + x if '_allowed' not in x else 'opp_' + x.replace('_allowed', ''), inplace=True)
                away_team_general_expected_stats.rename(columns=lambda x: 'team_' + x if '_allowed' not in x else 'opp_' + x.replace('_allowed', ''), inplace=True)

                # rename opp_sacks_allowed to team_sacks_allowed
                home_team_general_expected_stats.rename(columns={'opp_sacks': 'team_sacks_allowed'}, inplace=True)
                away_team_general_expected_stats.rename(columns={'opp_sacks': 'team_sacks_allowed'}, inplace=True)

                # add other columns (spread, over_under, is_home_team, etc.)
                home_team_general_expected_stats['spread'] = game['spread']
                home_team_general_expected_stats['over_under'] = game['over_under']
                home_team_general_expected_stats['is_home_team'] = True
                home_team_general_expected_stats['team_id'] = game['home_team_id']
                home_team_general_expected_stats['team_char_id'] = game['home_team_char_id']
                home_team_general_expected_stats['points_scored'] = game['home_points_scored']

                away_team_general_expected_stats['spread'] = game['spread'] * -1
                away_team_general_expected_stats['over_under'] = game['over_under']
                away_team_general_expected_stats['is_home_team'] = False
                away_team_general_expected_stats['team_id'] = game['away_team_id']
                away_team_general_expected_stats['team_char_id'] = game['away_team_char_id']
                away_team_general_expected_stats['points_scored'] = game['away_points_scored']

                # concatenate dataframes
                if data is None:
                    data = home_team_general_expected_stats
                else:
                    data = pd.concat([data, home_team_general_expected_stats])
                
                data = pd.concat([data, away_team_general_expected_stats])
        
    if should_close_connection:
        conn.close()
        
    data.dropna(inplace=True)
    
    return data