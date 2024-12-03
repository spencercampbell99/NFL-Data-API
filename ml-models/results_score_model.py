import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data_getters import get_data_for_points_scored_model_with_averages, get_games_for_week
from simulation_testing import calculate_offense_stat_averages, calculate_defense_stat_averages
import joblib
from sqlalchemy import text
from kelly_functions import calculate_edge, calculate_kelly_criterion, normalize_kelly, american_to_decimal

from MysqlConnection import MySQLConnection
import signal
conn = MySQLConnection()

# load model from joblibn
# model_name = 'points_scored_model'
model_name = 'points_scored_averages_model'
model_version = 'v2024.0'
# model_name = f'{model_name}_{model_version}'
print(f'Loading {model_name}...')
model = joblib.load(f'models/{model_name}.joblib')
model_features = joblib.load(f'models/{model_name}_features.joblib')

# create standard scaler
scaler = joblib.load(f'models/{model_name}_scaler.joblib')

# matchups df with predictions
matchup_predictions = pd.DataFrame(columns=['schedule_id', 'week', 'matchup', 'home_team', 'away_team', 'predicted_home_score', 'predicted_away_score', 'actual_home_score', 'actual_away_score', 'actual_total', 'correct_winner', 'predicted_total', 'over_under', 'predicted_over_under_result', 'actual_over_under_result', 'predicted_cover_spread', 'spread', 'correct_spread', 'predicted_underdog_win', 'actual_underdog_win', 'suggested_bet', 'home_moneyline', 'away_moneyline'])
matchup_predictions.set_index('matchup', inplace=True)

for week in range(14, 15):
    # data = get_data_for_points_scored_model_with_averages(week=week, season=2024, connection=conn, weeks_back=10)
    
    # make the index 0 -> length
    # data.reset_index(inplace=True)
    
    # games for week
    games_for_week = get_games_for_week(week, 2024, connection=conn)

    data = None
    
    for index, game in games_for_week.iterrows():
        home_team_off_stats = calculate_offense_stat_averages(game['home_team_id'], 2024, week, weeks_back=6, conn=conn)
        away_team_def_stats = calculate_defense_stat_averages(game['away_team_id'], 2024, week, weeks_back=6, conn=conn)
        home_team_def_stats = calculate_defense_stat_averages(game['home_team_id'], 2024, week, weeks_back=6, conn=conn)
        away_team_off_stats = calculate_offense_stat_averages(game['away_team_id'], 2024, week, weeks_back=6, conn=conn)
        
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

        away_team_general_expected_stats['spread'] = game['spread'] * -1
        away_team_general_expected_stats['over_under'] = game['over_under']
        away_team_general_expected_stats['is_home_team'] = False
        away_team_general_expected_stats['team_id'] = game['away_team_id']
        away_team_general_expected_stats['team_char_id'] = game['away_team_char_id']

        # concatenate dataframes
        if data is None:
            data = home_team_general_expected_stats
        else:
            data = pd.concat([data, home_team_general_expected_stats])
        
        data = pd.concat([data, away_team_general_expected_stats])
    
    # reset data index
    data.reset_index(inplace=True)
    
    # scale the data
    scaled_data = scaler.transform(data[model_features])
    
    predictions = model.predict(scaled_data)
    
    for index, game in data.iterrows():
        y_pred = round(np.mean(predictions[index]))
        
        # get actual points_scored

        # get matchup
        if game['is_home_team']:
            schedule_game = games_for_week[games_for_week['home_team_id'] == game['team_id']]
            matchup = f"{week}: " + schedule_game['short_name'].values[0]
        else:
            schedule_game = games_for_week[games_for_week['away_team_id'] == game['team_id']]
            matchup = f"{week}: " + schedule_game['short_name'].values[0]
        
        if schedule_game['home_score'].isna().values[0]:
            total_points_scored = 0
        else:
            total_points_scored = schedule_game['home_score'].values[0] + schedule_game['away_score'].values[0]
        
        # append or update matchup_predictions
        if matchup not in matchup_predictions.index:
            matchup_predictions.loc[matchup] = {
                'schedule_id': schedule_game['id'].values[0],
                'week': week,
                'home_team': schedule_game['home_team_char_id'].values[0],
                'away_team': schedule_game['away_team_char_id'].values[0],
                'predicted_home_score': y_pred if game['is_home_team'] else 0,
                'predicted_away_score': 0 if game['is_home_team'] else y_pred,
                'actual_home_score': schedule_game['home_score'].values[0],
                'actual_away_score': schedule_game['away_score'].values[0],
                'actual_total': total_points_scored,
                'correct_winner': None, # calculated later
                'predicted_cover_spread': None, # calculated later
                'spread': schedule_game['spread'].values[0],
                'correct_spread': None, # calculated later
                'predicted_total': y_pred,
                'over_under': schedule_game['over_under'].values[0],
                'predicted_over_under_result': None, # calculated later
                'actual_over_under_result': total_points_scored > schedule_game['over_under'].values[0],
                'predicted_underdog_win': None, # calculated later
                'actual_underdog_win': None, # calculated later
                'suggested_bet': None, # calculated later
                'home_moneyline': schedule_game['home_moneyline'].values[0],
                'away_moneyline': schedule_game['away_moneyline'].values[0]
            }
        else:
            if game['is_home_team']:
                matchup_predictions.loc[matchup, 'predicted_home_score'] = y_pred
            else:
                matchup_predictions.loc[matchup, 'predicted_away_score'] = y_pred
            matchup_predictions.loc[matchup, 'predicted_total'] += y_pred
        
# loop through matchup_predictions and calculate correct_winner and predicted_over_under_result
for index, matchup in matchup_predictions.iterrows():
    spread = matchup['spread']
    predicted_spread = matchup['predicted_home_score'] - matchup['predicted_away_score']

    if predicted_spread < 0:
        # assume 65% win probability for chosen team
        edge = calculate_edge(0.65, matchup['away_moneyline'], convert_to_decimal=True)
        kelly = calculate_kelly_criterion(edge, matchup['away_moneyline'], convert_to_decimal=True)
        matchup_predictions.loc[index, 'suggested_bet'] = kelly
    else:
        edge = calculate_edge(0.65, matchup['home_moneyline'], convert_to_decimal=True)
        kelly = calculate_kelly_criterion(edge, matchup['home_moneyline'], convert_to_decimal=True)
        matchup_predictions.loc[index, 'suggested_bet'] = kelly

    # predicted cover spread
    matchup_predictions.loc[index, 'predicted_cover_spread'] = predicted_spread > spread if spread > 0 else predicted_spread < spread

    if matchup['actual_total'] == 0:
        continue
    
    # calculate correct_winner
    if matchup['predicted_home_score'] > matchup['predicted_away_score']:
        matchup_predictions.loc[index, 'correct_winner'] = matchup['actual_home_score'] > matchup['actual_away_score']
    else:
        matchup_predictions.loc[index, 'correct_winner'] = matchup['actual_away_score'] > matchup['actual_home_score']
    
    # calculate predicted_over_under_result
    matchup_predictions.loc[index, 'predicted_over_under_result'] = (matchup['predicted_total'] > matchup['over_under'] and matchup['actual_total'] > matchup['over_under']) or (matchup['predicted_total'] < matchup['over_under'] and matchup['actual_total'] < matchup['over_under'])

    result_spread = matchup['actual_home_score'] - matchup['actual_away_score']
    
    if spread > 0:
        matchup_predictions.loc[index, 'correct_spread'] = result_spread > spread and predicted_spread > spread or result_spread < spread and predicted_spread < spread
    else:
        matchup_predictions.loc[index, 'correct_spread'] = result_spread > spread and predicted_spread > abs(spread) or result_spread < spread and predicted_spread < abs(spread)
        
    # calculate predicted_underdog_win
    home_underdog = True if matchup['spread'] < 0 else False
    matchup_predictions.loc[index, 'predicted_underdog_win'] = matchup['predicted_away_score'] < matchup['predicted_home_score'] if home_underdog else matchup['predicted_home_score'] < matchup['predicted_away_score']
    matchup_predictions.loc[index, 'actual_underdog_win'] = matchup['actual_away_score'] < matchup['actual_home_score'] if home_underdog else matchup['actual_home_score'] < matchup['actual_away_score']

# for each week, normalize the kelly criterion and calculate the suggested bet
for week in matchup_predictions['week'].unique():
    week_data = matchup_predictions[(matchup_predictions['week'] == week) & (matchup_predictions['predicted_home_score'] != matchup_predictions['predicted_away_score'])]
    kelly_list = week_data['suggested_bet'].tolist()
    normalized_kelly = normalize_kelly(kelly_list)
    
    for index, matchup in week_data.iterrows():
        matchup_predictions.loc[index, 'suggested_bet'] = normalized_kelly.pop(0)
    
    # default tie predcitions to 0% bet
    tie_data = matchup_predictions[(matchup_predictions['week'] == week) & (matchup_predictions['predicted_home_score'] == matchup_predictions['predicted_away_score'])]
    for index, matchup in tie_data.iterrows():
        matchup_predictions.loc[index, 'suggested_bet'] = 0

prediction_insert_query = text(f"""
    INSERT INTO model_predictions 
        (schedule_id, 
        home_team_score, 
        away_team_score, 
        total_score,
        correct_winner_by_score,
        over_under,
        cover_spread,
        correct_underdog_win_by_score,
        suggested_moneyline_percent_bet_by_score,
        home_team_error,
        away_team_error,
        total_error,
        score_model_name) 
    VALUES 
        (:schedule_id, 
        :home_team_score, 
        :away_team_score, 
        :total_score,
        :correct_winner,
        :over_under,
        :cover_spread,
        :correct_underdog_win,
        :suggested_bet,
        :home_team_error,
        :away_team_error,
        :total_error,
        '{model_name}_{model_version}')
""")
prediction_update_query = text(f"""
    UPDATE model_predictions
    SET 
        -- home_team_score = home_team_score,
        -- away_team_score = away_team_score,
        -- total_score = total_score,
        -- home_win = home_win,
        -- underdog_win = underdog_win,
        correct_winner_by_score = :correct_winner,
        correct_underdog_win_by_score = :correct_underdog_win,
        over_under = :over_under,
        cover_spread = :cover_spread,
        suggested_moneyline_percent_bet_by_score = :suggested_bet,
        home_team_error = :home_team_error,
        away_team_error = :away_team_error,
        total_error = :total_error,
        score_model_name = '{model_name}_{model_version}'
    WHERE schedule_id = :schedule_id
""")

should_update_db = input('Update database? (y/n): ')

if should_update_db == 'y':
    for index, matchup in matchup_predictions.iterrows():
        if matchup['actual_total'] == 0:
            data = {
                'schedule_id': matchup['schedule_id'],
                'home_team_score': matchup['predicted_home_score'],
                'away_team_score': matchup['predicted_away_score'],
                'total_score': matchup['predicted_total'],
                'over_under': 'OVER' if matchup['predicted_total'] > matchup['over_under'] else 'UNDER',
                'cover_spread': matchup['predicted_cover_spread'],
                'suggested_bet': matchup['suggested_bet'],
                
                # rest are null for non completed game
                'home_win': None,
                'underdog_win': None,
                'correct_winner': None,
                'correct_underdog_win': None,
                'home_team_error': None,
                'away_team_error': None,
                'total_error': None
            }
        else:
            data = {
                'schedule_id': matchup['schedule_id'],
                'home_team_score': matchup['predicted_home_score'],
                'away_team_score': matchup['predicted_away_score'],
                'total_score': matchup['predicted_total'],
                'over_under': 'OVER' if matchup['predicted_total'] > matchup['over_under'] else 'UNDER',
                'cover_spread': matchup['predicted_cover_spread'],
                # 'home_win': matchup['predicted_home_score'] > matchup['predicted_away_score'],
                # 'underdog_win': matchup['predicted_underdog_win'],
                'correct_winner': matchup['correct_winner'],
                'correct_underdog_win': matchup['predicted_underdog_win'] and matchup['actual_underdog_win'] if matchup['predicted_underdog_win'] else None,
                'home_team_error': matchup['predicted_home_score'] - matchup['actual_home_score'] if matchup['actual_home_score'] is not None else None,
                'away_team_error': matchup['predicted_away_score'] - matchup['actual_away_score'] if matchup['actual_away_score'] is not None else None,
                'total_error': matchup['predicted_total'] - matchup['actual_total'] if matchup['actual_total'] != 0 else None,
                'suggested_bet': matchup['suggested_bet']
            }
        
        # see if entry with that schedule id exists
        exists = conn.connection.execute(text('SELECT * FROM model_predictions WHERE schedule_id = :schedule_id'), {'schedule_id': matchup['schedule_id']}).fetchone()
        
        if exists:
            update_data = {
                'schedule_id': matchup['schedule_id'],
                'correct_winner': matchup['correct_winner'],
                'correct_underdog_win': matchup['predicted_underdog_win'] and matchup['actual_underdog_win'] if matchup['predicted_underdog_win'] else None,
                'over_under': 'OVER' if matchup['predicted_total'] > matchup['over_under'] else 'UNDER',
                'cover_spread': matchup['predicted_cover_spread'],
                'home_team_error': matchup['predicted_home_score'] - matchup['actual_home_score'] if matchup['actual_home_score'] is not None else None,
                'away_team_error': matchup['predicted_away_score'] - matchup['actual_away_score'] if matchup['actual_away_score'] is not None else None,
                'total_error': matchup['predicted_total'] - matchup['actual_total'] if matchup['actual_total'] else None,
                'suggested_bet': matchup['suggested_bet']
            }
            res = conn.connection.execute(prediction_update_query, update_data)
            if res.rowcount != 1:
                print(f'Error updating {matchup["schedule_id"]}')
            else:
                print(f'Updated {matchup["schedule_id"]}')
        else:
            res = conn.connection.execute(prediction_insert_query, data)
            if res.rowcount != 1:
                print(f'Error inserting {matchup["schedule_id"]}')
            else:
                print(f'Inserted {matchup["schedule_id"]}')
    
    print('Done updating database')
    conn.connection.commit()

# partition by weeks and print each week
weeks = matchup_predictions['week'].unique()
for week in weeks:
    print(f'Week {week}')
    print(matchup_predictions[matchup_predictions['week'] == week])

# calculate accuracy
correct_winner_accuracy = matchup_predictions['correct_winner'].sum() / len(matchup_predictions)
print(f'Correct Winner Accuracy: {correct_winner_accuracy}')

over_under_accuracy = matchup_predictions['predicted_over_under_result'].sum() / len(matchup_predictions)
print(f'Over Under Accuracy: {over_under_accuracy}')

spread_accuracy = matchup_predictions['correct_spread'].sum() / len(matchup_predictions)
print(f'Spread Accuracy: {spread_accuracy}')

# calculate average error
matchup_predictions['home_error'] = matchup_predictions['predicted_home_score'] - matchup_predictions['actual_home_score']
matchup_predictions['away_error'] = matchup_predictions['predicted_away_score'] - matchup_predictions['actual_away_score']
matchup_predictions['absolute_home_error'] = matchup_predictions['home_error'].abs()
matchup_predictions['absolute_away_error'] = matchup_predictions['away_error'].abs()

print(f'Average Home Error: {matchup_predictions["home_error"].mean()}')
print(f'Average Away Error: {matchup_predictions["away_error"].mean()}')

print(f'Average Absolute Home Error: {matchup_predictions["absolute_home_error"].mean()}')
print(f'Average Absolute Away Error: {matchup_predictions["absolute_away_error"].mean()}')