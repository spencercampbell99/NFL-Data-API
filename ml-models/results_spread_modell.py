import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sqlalchemy import text
from data_getters import get_spread_model_data_for_week, get_games_for_week
import joblib

from MysqlConnection import MySQLConnection
conn = MySQLConnection()

# load model from joblib (xgboost)
model_name = 'spread_model'
print(f'Loading {model_name}...')
model = joblib.load(f'models/{model_name}.joblib')
model_features = joblib.load(f'models/{model_name}_features.joblib')
scaler = joblib.load(f'models/{model_name}_scaler.joblib')

total_correct = 0
total_games = 0

# dataframe to hold results for updating db
results = pd.DataFrame(columns=['schedule_id', 'matchup', 'predicted_spread_result', 'spread_result', 'correct', 'line'])
results.set_index('matchup', inplace=True)

for week in range(4, 5):
    games_for_week = get_games_for_week(week=week, season=2024, connection=conn)
    games_for_week.set_index('short_name', inplace=True)
    
    data = get_spread_model_data_for_week(week=week, season=2024, connection=conn)
    data.reset_index(inplace=True)
    
    X = data[model_features]
    X = scaler.transform(X)
    
    predictions = model.predict(X)
    
    for index, game in data.iterrows():
        y_pred = predictions[index]
        predicted_spread_result = 'cover' if y_pred else 'not_cover'
        
        schedule_game = games_for_week.loc[game['matchup']]
        game_completed = schedule_game['home_points_scored'] is not None
        
        if game_completed:
            # get actual total
            actual_spread = schedule_game['home_points_scored'] - schedule_game['away_points_scored']
            spread = game['spread']
            
            # get actual o/u result and predicted o/u result
            if spread >= 0:
                actual_spread_result = 'cover' if actual_spread > spread else 'not_cover' if actual_spread != spread else 'push'
            else:
                actual_spread_result = 'cover' if actual_spread < spread else 'not_cover' if actual_spread != spread else 'push'
        
            # update totals
            total_correct += 1 if actual_spread_result != 'push' and actual_spread_result == predicted_spread_result else 0
            total_games += 1 if actual_spread_result != 'push' else 0
        
        results.loc[game['matchup']] = {
            'schedule_id': game['schedule_id'],
            'predicted_spread_result': predicted_spread_result,
            'spread_result': actual_spread_result if game_completed else None,
            'correct': 'N/A' if not game_completed else 'yes' if actual_spread_result == predicted_spread_result else 'no' if actual_spread_result != 'push' else 'push',
            'line': game['spread']
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
    SET cover_spread = :predicted_spread_result,
        correct_spread = :correct_spread
    WHERE schedule_id = :schedule_id
""")

should_update = input('Update database? (y/n): ')
if should_update == 'y':
    for index, row in results.iterrows():
        res = conn.connection.execute(update_query, {
            'predicted_spread_result': row['predicted_spread_result'].upper() == 'COVER',
            'correct_spread': True if row['correct'] == 'yes' else False,
            'schedule_id': row['schedule_id']
        })
        if res.rowcount != 1:
            print(f'Error updating schedule_id {row["schedule_id"]}')
    
    print('Done updating database')
    conn.connection.commit()
    conn.close()