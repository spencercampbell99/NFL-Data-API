from collections import Counter
from matplotlib import pyplot as plt
from MysqlConnection import MySQLConnection
from sqlalchemy import text
conn = MySQLConnection()
import pandas as pd
import numpy as np

# load all 2023 box_scores
box_scores = pd.read_sql('select box_scores.* from box_scores  join schedules on schedules.id = box_scores.schedule_id join box_scores opp on opp.team_id = box_scores.opponent_id and opp.schedule_id = box_scores.schedule_id where season = 2023', con=conn.connection)
opp_box_scores = pd.read_sql('select opp.* from box_scores  join schedules on schedules.id = box_scores.schedule_id join box_scores opp on opp.team_id = box_scores.opponent_id and opp.schedule_id = box_scores.schedule_id where season = 2023', con=conn.connection)

# drop non stat columns
box_scores.drop(['id', 'schedule_id', 'team_id', 'opponent_id', 'team_char_id'], axis=1, inplace=True)
opp_box_scores.drop(['id', 'schedule_id', 'team_id', 'opponent_id', 'team_char_id'], axis=1, inplace=True)

# convert time of possession to seconds
box_scores['time_of_possession'] = box_scores['time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))
opp_box_scores['time_of_possession'] = opp_box_scores['time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))

# plot points_scored against all other columns and give r squared
for column in box_scores.columns:
    if column == 'points_scored':
        continue
    
    # box_scores.plot.scatter(x='points_scored', y=column)
    correlation = box_scores['points_scored'].corr(box_scores[column])
    # plt.title(f"Correlation: {correlation}")

    # Calculate the line of best fit
    # m, b = np.polyfit(box_scores['points_scored'], box_scores[column], 1)
    # plt.plot(box_scores['points_scored'], m * box_scores['points_scored'] + b, color='red')

    if abs(correlation) > 0.3:
        print(f"{column}")

    # plt.show()
    
for column in opp_box_scores:
    if column == 'points_scored':
        continue
    
    # box_scores.plot.scatter(x='points_scored', y=column)
    correlation = box_scores['points_scored'].corr(opp_box_scores[column])
    # plt.title(f"Correlation: {correlation}")

    # Calculate the line of best fit
    # m, b = np.polyfit(box_scores['points_scored'], box_scores[column], 1)
    # plt.plot(box_scores['points_scored'], m * box_scores['points_scored'] + b, color='red')

    if abs(correlation) > 0.3:
        print(f"opp_{column}")

    # plt.show()