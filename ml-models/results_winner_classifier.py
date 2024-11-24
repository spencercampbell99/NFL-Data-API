import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data_getters import get_winner_model_data, get_games_for_week
from simulation_testing import calculate_offense_stat_averages, calculate_defense_stat_averages
import joblib
from sqlalchemy import text
from kelly_functions import calculate_edge, calculate_kelly_criterion, normalize_kelly, american_to_decimal

from MysqlConnection import MySQLConnection
import signal
conn = MySQLConnection()

# load model from joblibn
sub_models_to_user = ['XGBoost', 'Random Forest', 'SVM', 'Logistic Regression']
xgboost = joblib.load(f'models/{sub_models_to_user[0]}_winner_classifier.joblib')
xgboost_features = joblib.load(f'models/{sub_models_to_user[0]}_winner_classifier_features.joblib')
random_forest = joblib.load(f'models/{sub_models_to_user[1]}_winner_classifier.joblib')
random_forest_features = joblib.load(f'models/{sub_models_to_user[1]}_winner_classifier_features.joblib')
svm = joblib.load(f'models/{sub_models_to_user[2]}_winner_classifier.joblib')
svm_features = joblib.load(f'models/{sub_models_to_user[2]}_winner_classifier_features.joblib')
log_reg = joblib.load(f'models/{sub_models_to_user[3]}_winner_classifier.joblib')
log_reg_features = joblib.load(f'models/{sub_models_to_user[3]}_winner_classifier_features.joblib')
model_name = 'winner_classifier_tf'
print(f'Loading {model_name}...')
tf = joblib.load(f'models/{model_name}.joblib')
tf_features = joblib.load(f'models/{model_name}_features.joblib')

# create standard scaler
xgboost_scaler = joblib.load(f'models/{sub_models_to_user[0]}_winner_classifier_scaler.joblib')
random_forest_scaler = joblib.load(f'models/{sub_models_to_user[1]}_winner_classifier_scaler.joblib')
svm_scaler = joblib.load(f'models/{sub_models_to_user[2]}_winner_classifier_scaler.joblib')
# log_reg_scaler = joblib.load(f'models/{sub_models_to_user[3]}_winner_classifier_scaler.joblib')
tf_scaler = joblib.load(f'models/{model_name}_scaler.joblib')

# matchups df with predictions
matchup_predictions = pd.DataFrame(columns=['matchup', 'schedule_id', 'week','home_team', 'away_team', 'favorite', 'predicted_winner', 'actual_winner', 'actual_home_score', 'actual_away_score', 'actual_total', 'home_moneyline', 'away_moneyline', 'correct_winner', 'predicted_underdog_win', 'actual_underdog_win', 'correct_underdog_win', 'perc_to_bet'])
matchup_predictions.set_index('matchup', inplace=True)

data_for_season = get_winner_model_data(2024, 2024, weeks_back=3, keep_avg_columns=True, keep_expected_columns=True, skip_drop_na=True)

for week in range(1, 13):
    # data = get_data_for_points_scored_model_with_averages(week=week, season=2024, connection=conn, weeks_back=10)
    
    # make the index 0 -> length
    # data.reset_index(inplace=True)
    
    # games for week
    games_for_week = get_games_for_week(week, 2024, connection=conn)

    data = data_for_season[data_for_season['week'] == week]
    
    # print each col for first row
    # for col in data.columns:
    #     print(f'{col}: {data[col].values[0]}')
    
    # reset data index
    data.reset_index(inplace=True)
    
    # scale the data
    xgboost_scaled_data = xgboost_scaler.transform(data[xgboost_features])
    # random_forest_scaled_data = random_forest_scaler.transform(data[random_forest_features])
    # svm_scaled_data = svm_scaler.transform(data[svm_features])
    # log_reg_scaled_data = log_reg_scaler.transform(data[log_reg_features])
    # tf_scaled_data = tf_scaler.transform(data[tf_features])
    
    xgboost_preds = xgboost.predict_proba(xgboost_scaled_data)[:, 1]
    # random_forest_preds = random_forest.predict_proba(random_forest_scaled_data)[:, 1]
    # svm_preds = svm.predict_proba(svm_scaled_data)[:, 1]
    # log_reg_preds = log_reg.predict_proba(log_reg_scaled_data)[:, 1]
    # tf_preds = tf.predict(tf_scaled_data)
    
    # linear representation
    # xgboost_preds = (xgboost_preds > 0.5).astype(int)
    # random_forest_preds = (random_forest_preds > 0.5).astype(int)
    # svm_preds = (svm_preds > 0.5).astype(int)
    # log_reg_preds = (log_reg_preds > 0.5).astype(int)
    # tf_preds = (tf_preds > 0.5).astype(int)
    
    # negative weighted for underdog representation
    # xgboost_preds = np.where(xgboost_preds < 0.5, -1.05, 1)
    # random_forest_preds = np.where(random_forest_preds < 0.5, -1.05, 1)
    # svm_preds = np.where(svm_preds < 0.5, -1.05, 1)
    # log_reg_preds = np.where(log_reg_preds < 0.5, -1.05, 1)
    # tf_preds = np.where(tf_preds < 0.5, -1.05, 1)
    
    # print(xgboost_preds)
    # print(random_forest_preds)
    # print(svm_preds)
    # print(log_reg_preds)
    
    for index, game in data.iterrows():
        xgboost_pred = np.mean(xgboost_preds[index])
        # random_forest_pred = np.mean(random_forest_preds[index])
        # svm_pred = np.mean(svm_preds[index])
        # log_reg_pred = np.mean(log_reg_preds[index])
        # tf_pred = np.mean(tf_preds[index])
        
        # print(f'Game {index} Predictions: {xgboost_pred}, {random_forest_pred}, {svm_pred}, {log_reg_pred}, {tf_pred}')
        
        y_pred = 0
        y_pred += xgboost_pred
        # y_pred += svm_pred
        # y_pred += log_reg_pred
        # y_pred += tf_pred
        # y_pred += random_forest_pred
        y_pred = y_pred / 1

        # get matchup
        schedule_game = games_for_week[games_for_week['home_team_id'] == game['home_team_id']]
        matchup = f"{week}: " + schedule_game['short_name'].values[0]
        
        if schedule_game['home_points_scored'].isna().values[0]:
            total_points_scored = 0
            actual_winner = None
        else:
            total_points_scored = schedule_game['home_points_scored'].values[0] + schedule_game['away_points_scored'].values[0]
            actual_winner = schedule_game['home_team_char_id'].values[0] if schedule_game['home_points_scored'].values[0] > schedule_game['away_points_scored'].values[0] else schedule_game['away_team_char_id'].values[0]

        y_pred = y_pred if y_pred < 0.7 else 0.7  # cap predictions to 70% confidence

        home_favorite = game['home_favorite'] == 1

        # calculate edge
        if home_favorite:
            edge = calculate_edge(y_pred, schedule_game['home_moneyline'].values[0])
            kelly = calculate_kelly_criterion(edge, schedule_game['home_moneyline'].values[0])
        else:
            edge = calculate_edge(y_pred, schedule_game['away_moneyline'].values[0])
            kelly = calculate_kelly_criterion(edge, schedule_game['away_moneyline'].values[0])

        # if kelly < 0:
        #     print(f'Negative Kelly Criterion for {matchup} with edge {edge} and kelly {kelly}')

        y_pred = 1 if y_pred > 0.5 else 0

        if home_favorite and y_pred == 1:
            predicted_winner = schedule_game['home_team_char_id'].values[0]
        elif game['home_favorite'] == 0 and y_pred == 0:
            predicted_winner = schedule_game['home_team_char_id'].values[0]
        elif home_favorite and y_pred == 0:
            predicted_winner = schedule_game['away_team_char_id'].values[0]
        else:
            predicted_winner = schedule_game['away_team_char_id'].values[0]

        underdog = schedule_game['away_team_char_id'].values[0] if schedule_game['home_moneyline'].values[0] < schedule_game['away_moneyline'].values[0] else schedule_game['home_team_char_id'].values[0]
        
        matchup_predictions.loc[matchup] = {
            'schedule_id': schedule_game['id'].values[0],
            'week': week,
            'home_team': schedule_game['home_team_char_id'].values[0],
            'away_team': schedule_game['away_team_char_id'].values[0],
            'favorite': schedule_game['home_team_char_id'].values[0] if home_favorite else schedule_game['away_team_char_id'].values[0],
            'predicted_winner': predicted_winner,
            'actual_winner': actual_winner,
            'actual_home_score': schedule_game['home_points_scored'].values[0],
            'actual_away_score': schedule_game['away_points_scored'].values[0],
            'actual_total': total_points_scored,
            'home_moneyline': schedule_game['home_moneyline'].values[0],
            'away_moneyline': schedule_game['away_moneyline'].values[0],
            'correct_winner': actual_winner == predicted_winner,
            'predicted_underdog_win': y_pred == 0,
            'actual_underdog_win': underdog == actual_winner,
            'correct_underdog_win': underdog == actual_winner and y_pred == 0,
            'perc_to_bet': kelly,
        }



# normalize kelly for each week
for week in matchup_predictions['week'].unique():
    kelly_list = matchup_predictions[matchup_predictions['week'] == week]['perc_to_bet'].tolist()
    normalized_kelly = normalize_kelly(kelly_list)
    matchup_predictions.loc[matchup_predictions['week'] == week, 'perc_to_bet'] = normalized_kelly

# prediction table update query
update_query = text("""
    UPDATE model_predictions
    SET home_win = :home_win,
        underdog_win = :underdog_win,
        suggested_moneyline_percent_bet = :perc_to_bet,
        win_model_name = 'Mixed Win Classifer Model v2024.0'
    WHERE schedule_id = :schedule_id
""")

should_update = input('Update database? (y/n): ')
if should_update == 'y':
    for index, row in matchup_predictions.iterrows():
        res = conn.connection.execute(update_query, {
            'home_win': row['predicted_winner'] == row['home_team'],
            'underdog_win': row['predicted_underdog_win'],
            'perc_to_bet': row['perc_to_bet'],
            'schedule_id': row['schedule_id']
        })
        if res.rowcount != 1:
            print(f'Error updating schedule_id {row["schedule_id"]}')
    
    print('Done updating database')
    conn.connection.commit()
    conn.close()

# print matchups for each week
weeks = matchup_predictions['week'].unique()
for week in weeks:
    print(f'Week {week}')
    print(matchup_predictions[matchup_predictions['week'] == week])

# calculate accuracy
correct_winner_accuracy = matchup_predictions['correct_winner'].sum() / len(matchup_predictions)
print(f'Correct Winner Accuracy: {correct_winner_accuracy}')

# calculate underdog accuracy
num_underdog_predictions = matchup_predictions['predicted_underdog_win'].sum()
correct_underdog_accuracy = matchup_predictions['correct_underdog_win'].sum() / num_underdog_predictions if num_underdog_predictions > 0 else 0
print(f'Correct Underdog Accuracy: {correct_underdog_accuracy}')