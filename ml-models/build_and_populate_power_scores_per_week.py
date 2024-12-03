import pandas as pd
import numpy as np
# import tensorflow as tf
from data_getters import get_winner_model_data
from MysqlConnection import MySQLConnection
from sqlalchemy import text

data = get_winner_model_data(2024, 2024, weeks_back=6, keep_avg_columns=True, keep_expected_columns=False, skip_drop_na=True)

# for each data calculate home_avg_pass_percentage and away_avg_pass_percentage
data['home_avg_pass_percentage'] = data['home_avg_passing_completions'] / data['home_avg_passing_attempts']
data['away_avg_pass_percentage'] = data['away_avg_passing_completions'] / data['away_avg_passing_attempts']

# do same for third_down and red_zone and fourth_down
data['home_avg_third_down_percentage'] = data['home_avg_third_down_conversions'] / data['home_avg_third_down_attempts']
data['away_avg_third_down_percentage'] = data['away_avg_third_down_conversions'] / data['away_avg_third_down_attempts']

data['home_avg_fourth_down_percentage'] = data['home_avg_fourth_down_conversions'] / data['home_avg_fourth_down_attempts']
data['away_avg_fourth_down_percentage'] = data['away_avg_fourth_down_conversions'] / data['away_avg_fourth_down_attempts']

data['home_avg_red_zone_percentage'] = data['home_avg_red_zone_scores'] / data['home_avg_red_zone_attempts']
data['away_avg_red_zone_percentage'] = data['away_avg_red_zone_scores'] / data['away_avg_red_zone_attempts']

# and for field_goals percentage
data['home_avg_field_goal_percentage'] = data['home_avg_field_goals_made'] / data['home_avg_field_goals_attempted']
data['away_avg_field_goal_percentage'] = data['away_avg_field_goals_made'] / data['away_avg_field_goals_attempted']

# get allowed conversions
data['home_avg_third_down_percentage_allowed'] = data['home_avg_third_down_conversions_allowed'] / data['home_avg_third_down_attempts_allowed']
data['away_avg_third_down_percentage_allowed'] = data['away_avg_third_down_conversions_allowed'] / data['away_avg_third_down_attempts_allowed']

data['home_avg_fourth_down_percentage_allowed'] = data['home_avg_fourth_down_conversions_allowed'] / data['home_avg_fourth_down_attempts_allowed']
data['away_avg_fourth_down_percentage_allowed'] = data['away_avg_fourth_down_conversions_allowed'] / data['away_avg_fourth_down_attempts_allowed']

data['home_avg_red_zone_percentage_allowed'] = data['home_avg_red_zone_scores_allowed'] / data['home_avg_red_zone_attempts_allowed']
data['away_avg_red_zone_percentage_allowed'] = data['away_avg_red_zone_scores_allowed'] / data['away_avg_red_zone_attempts_allowed']

# all home columns are prefixed with 'home_'
home_columns = [col for col in data.columns if 'home_' in col]
away_columns = [col for col in data.columns if 'away_' in col]
home_columns.append('game_id')
away_columns.append('game_id')
meta_data_columns = [col for col in data.columns if col not in home_columns and col not in away_columns]

# split each row in data into two rows, one for home and one for away
home_data = data[meta_data_columns + home_columns]
away_data = data[meta_data_columns + away_columns]

# drop 'home_' and 'away_' prefixes
home_data.columns = [col.replace('home_', '') for col in home_data.columns]
away_data.columns = [col.replace('away_', '') for col in away_data.columns]

# column weights to apply
offense_weights = {
    'avg_points_scored': 3,
    'avg_first_downs': 1,
    'avg_third_down_percentage': 1.3,
    'avg_fourth_down_percentage': 1.5,
    'avg_red_zone_percentage': 2,
    'avg_turnovers': -3,
    'avg_passing_epa': 1.5,
    'avg_pass_percentage': 2,
    'avg_qb_hits_allowed': -1.5,
    'avg_pass_defended_allowed': -1.1,
    'avg_sack_yards_lost': -2,
    # 'avg_tackles_for_loss': 1.5,
    'avg_penalty_yards_against': -1.2,
    'avg_passing_yards': 1,
    'avg_rushing_yards': 1.25,
    'avg_yards_per_play': 1.5,
    'avg_field_goal_percentage': 1,
}

home_offensive_weights = {f'home_{k}': v for k, v in offense_weights.items()}
away_offensive_weights = {f'away_{k}': v for k, v in offense_weights.items()}

defense_weights = {
    'avg_points_allowed': -5,
    'avg_sack_yards_lost_forced': 1.3,
    'avg_tackles_for_loss_forced': 1.2,
    'avg_defense_qb_hits_forced': 1.1,
    'avg_interceptions_forced': 1.2,
    'avg_fumbles_forced': 1.3,
    # 'avg_pass_defended': 1.5,
    'avg_yards_per_rush_allowed': 1.3,
    'avg_yards_per_pass_attempt_allowed': 1.2,
    'avg_defense_pass_defended_forced': 1.1,
    'avg_third_down_percentage_allowed': -1.3,
    'avg_fourth_down_percentage_allowed': -1.5,
    'avg_red_zone_percentage_allowed': -1.6,
}

home_defensive_weights = {f'home_{k}': v for k, v in defense_weights.items()}
away_defensive_weights = {f'away_{k}': v for k, v in defense_weights.items()}

# update query for box_scores table
update_query = text(f"""
    UPDATE box_scores
    SET rolling_offense_power_score = :rolling_offense_power_score, rolling_defense_power_score = :rolling_defense_power_score
    WHERE schedule_id = :schedule_id and team_id = :team_id         
""")

# stablish connection to db
connection = MySQLConnection()

# get all distinct seasons
seasons = data['season'].unique()
weeks = data['week'].unique()

# power_scores = pd.DataFrame()

for season in seasons:
    for week in weeks:
        print(f'Calculating power scores for season {season} week {week}...')
        
        # get all games for the season and week
        season_week_data = home_data[(home_data['season'] == season) & (home_data['week'] == week)]
        season_week_data = pd.concat([season_week_data, away_data[(away_data['season'] == season) & (away_data['week'] == week)]], ignore_index=True)
        
        # replace NaN values with 0
        season_week_data.fillna(0, inplace=True)
        
        # convert all weighted stats to z-scores against entire field
        for col in offense_weights.keys():
            std = season_week_data[col].std()
            if std == 0:
                season_week_data[col] = 0
            else:
                season_week_data[col] = (season_week_data[col] - season_week_data[col].mean()) / season_week_data[col].std()

        for col in defense_weights.keys():
            std = season_week_data[col].std()
            if std == 0:
                season_week_data[col] = 0
            else:
                season_week_data[col] = (season_week_data[col] - season_week_data[col].mean()) / season_week_data[col].std()
        
        # For each game, calculate the total offense and defense scores for home and away teams
        for index, row in season_week_data.iterrows():
            # Sum weighted z-scores for offense and defense for home and away teams
            offense_score = sum(row[col] * weight for col, weight in offense_weights.items())
            defense_score = sum(row[col] * weight for col, weight in defense_weights.items())

            # if offense_score is nan print row
            # if np.isnan(offense_score):
            #     for col, weight in offense_weights.items():
            #         print(col, row[col], weight)

            # print team char id and the defense stat scores
            # print(row['team_char_id'], row[['avg_points_allowed', 'avg_sack_yards_lost_forced', 'avg_tackles_for_loss_forced', 'avg_defense_qb_hits_forced', 'avg_interceptions_forced', 'avg_fumbles_forced', 'avg_yards_per_rush_allowed', 'avg_yards_per_pass_attempt_allowed', 'avg_defense_pass_defended_forced', 'avg_third_down_percentage_allowed', 'avg_fourth_down_percentage_allowed', 'avg_red_zone_percentage_allowed']])
            
            # # apply offense and defense weights to the cols in the row
            # for col, weight in offense_weights.items():
            #     row[col] = row[col] * weight

            # # Apply defense weights to the columns in the row
            # for col, weight in defense_weights.items():
            #     row[col] = row[col] * weight     

            # print(row['team_char_id'], row[['avg_points_allowed', 'avg_sack_yards_lost_forced', 'avg_tackles_for_loss_forced', 'avg_defense_qb_hits_forced', 'avg_interceptions_forced', 'avg_fumbles_forced', 'avg_yards_per_rush_allowed', 'avg_yards_per_pass_attempt_allowed', 'avg_defense_pass_defended_forced', 'avg_third_down_percentage_allowed', 'avg_fourth_down_percentage_allowed', 'avg_red_zone_percentage_allowed']])

            # new_row = pd.DataFrame([{
            #     'team_char_id': row['team_char_id'],
            #     'season': row['season'],
            #     'week': row['week'],
            #     'offense_power_score': offense_score,
            #     'defense_power_score': defense_score
            # }])
            # power_scores = pd.concat([power_scores, new_row], ignore_index=True)

            # update box_scores table with rolling_offense_power_score and rolling_defense_power_score
            connection.connection.execute(update_query, {
                'rolling_offense_power_score': offense_score,
                'rolling_defense_power_score': defense_score,
                'schedule_id': row['game_id'],
                'team_id': row['team_id']
            })
            

connection.connection.commit()
connection.close()

# print sorted offense with team char id, then sorted defense with team char id
# print(power_scores.sort_values('offense_power_score', ascending=False)[['team_char_id', 'offense_power_score']])
# print(power_scores.sort_values('defense_power_score', ascending=False)[['team_char_id', 'defense_power_score']])