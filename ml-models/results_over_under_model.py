import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sqlalchemy import text
from data_getters import get_over_under_data_for_week, get_games_for_week
import joblib

from MysqlConnection import MySQLConnection
conn = MySQLConnection()

# load model from joblib (xgboost)
model_name = 'over_under_model'
print(f'Loading {model_name}...')
model = joblib.load(f'models/{model_name}.joblib')
model_features = joblib.load(f'models/{model_name}_features.joblib')
scaler = joblib.load(f'models/{model_name}_scaler.joblib')

total_correct = 0
total_games = 0

# dataframe to hold results for updating db
results = pd.DataFrame(columns=['schedule_id', 'matchup', 'predicted_over_under_result', 'over_under_result', 'correct', 'line'])
results.set_index('matchup', inplace=True)

for week in range(4, 5):
    games_for_week = get_games_for_week(week=week, season=2024, connection=conn)
    games_for_week.set_index('short_name', inplace=True)
    
    data = get_over_under_data_for_week(week=week, season=2024, connection=conn)
    data.reset_index(inplace=True)
    
    X = data[model_features]
    X = scaler.transform(X)
    
    predictions = model.predict(X)
    
    for index, game in data.iterrows():
        y_pred = predictions[index]
        predicted_over_under_result = 'over' if y_pred else 'under'
        
        schedule_game = games_for_week.loc[game['matchup']]
        game_completed = schedule_game['home_points_scored'] is not None
        
        if game_completed:
            # get actual total
            actual_total = schedule_game['home_points_scored'] + schedule_game['away_points_scored']
            
            # get over/under
            over_under = game['over_under']
            
            # get actual o/u result and predicted o/u result
            actual_over_under_result = 'over' if actual_total > over_under else 'under' if actual_total != over_under else 'push'
        
            # update totals
            total_correct += 1 if actual_over_under_result != 'push' and actual_over_under_result == predicted_over_under_result else 0
            total_games += 1 if actual_over_under_result != 'push' else 0
        
        results.loc[game['matchup']] = {
            'schedule_id': game['schedule_id'],
            'predicted_over_under_result': predicted_over_under_result,
            'over_under_result': actual_over_under_result if game_completed else None,
            'correct': 'N/A' if not game_completed else 'yes' if actual_over_under_result == predicted_over_under_result else 'no' if actual_over_under_result != 'push' else 'push',
            'line': game['over_under']
        }

# print results
if total_games == 0:
    print('No games played')
else:
    print(f'Correct %: {total_correct / total_games}')

print(results)

# prediction table update query
update_query = text("""
    UPDATE model_predictions
    SET over_under = :predicted_over_under_result,
        correct_over_under = :correct_over_under
    WHERE schedule_id = :schedule_id
""")

should_update = input('Update database? (y/n): ')
if should_update == 'y':
    for index, row in results.iterrows():
        res = conn.connection.execute(update_query, {
            'predicted_over_under_result': row['predicted_over_under_result'].upper(),
            'correct_over_under': True if row['correct'] == 'yes' or row['correct'] == 'push' else False,
            'schedule_id': row['schedule_id']
        })
        if res.rowcount != 1:
            print(f'Error updating schedule_id {row["schedule_id"]}')
    
    print('Done updating database')
    conn.connection.commit()
    conn.close()