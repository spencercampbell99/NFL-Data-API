import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from data_getters import get_total_score_data_expected_values
import joblib

from MysqlConnection import MySQLConnection
conn = MySQLConnection()

# load model from joblib (xgboost)
model_name = 'total_score_model'
print(f'Loading {model_name}...')
model = joblib.load(f'models/{model_name}.joblib')
model_features = joblib.load(f'models/{model_name}_features.joblib')

scaler = joblib.load(f'models/{model_name}_scaler.joblib')

total_correct = 0
total_result_offset = 0
total_absolute_result_offset = 0
total_vegas_offset = 0
total_absolute_vegas_offset = 0
total_games = 0

for week in range(5, 15):
    data = get_total_score_data_expected_values(week=week, season=2023, connection=conn, weeks_back=2)
    data.reset_index(inplace=True)
    
    # scale the data
    scaled_data = scaler.transform(data[model_features])
    
    predictions = model.predict(scaled_data)
    
    for index, game in data.iterrows():
        y_pred = predictions[index]
        
        # get actual game total
        actual_total = game['total_points_scored']
        
        # get over/under
        over_under = game['over_under']
        
        # get actual o/u result and predicted o/u result
        actual_over_under_result = 'over' if actual_total >= over_under else 'under'
        predicted_over_under_result = 'over' if y_pred >= over_under else 'under'
        
        # get offset
        offset = y_pred - actual_total
        vegas_offset = y_pred - over_under
        absolute_offset = abs(offset)
        absolute_vegas_offset = abs(vegas_offset)
        
        # update totals
        total_correct += 1 if actual_over_under_result == predicted_over_under_result else 0
        total_result_offset += offset
        total_absolute_result_offset += absolute_offset
        total_vegas_offset += vegas_offset
        total_absolute_vegas_offset += absolute_vegas_offset
        total_games += 1

# print results
print(f'Correct %: {total_correct / total_games}')
print(f'Average result offset: {total_result_offset / total_games}')
print(f'Average absolute result offset: {total_absolute_result_offset / total_games}')
print(f'Average vegas offset: {total_vegas_offset / total_games}')
print(f'Average absolute vegas offset: {total_absolute_vegas_offset / total_games}')