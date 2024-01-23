from collections import Counter
from matplotlib import pyplot as plt
from MysqlConnection import MySQLConnection
from sqlalchemy import text
conn = MySQLConnection()
import pandas as pd
import numpy as np

# get all columns names from box_scores
one_box_score = pd.read_sql('select * from box_scores limit 1', con=conn.connection)
one_box_score.drop(['id', 'schedule_id', 'team_id', 'opponent_id', 'team_char_id'], axis=1, inplace=True)
columns = list(one_box_score.columns)

# load all schedules for 2023 with home and away stats and spread cover
query = text(f"""
    SELECT
        {', '.join([f'favorite.{col} + underdog.{col} as {col}' for col in columns])},
        CASE WHEN favorite.points_scored - underdog.points_scored > abs(spread) THEN 1 ELSE 0 END as spread_covered,
        CASE WHEN favorite.points_scored + underdog.points_scored > over_under THEN 1 ELSE 0 END as over_under_covered,
        favorite.points_scored + underdog.points_scored as total_score
    FROM
        schedules
    JOIN box_scores as favorite ON CASE WHEN spread >= 0 THEN favorite.team_id = schedules.home_team_id ELSE favorite.team_id = schedules.away_team_id END AND favorite.schedule_id = schedules.id
    JOIN box_scores as underdog ON CASE WHEN spread < 0 THEN underdog.team_id = schedules.home_team_id ELSE underdog.team_id = schedules.away_team_id END AND underdog.schedule_id = schedules.id
    WHERE
        season = 2023
""")
schedules = pd.read_sql(query, con=conn.connection)

# print(schedules)

# for column in schedules.columns:
#     print(column)

# convert time of possession to seconds
# schedules['time_of_possession'] = schedules['time_of_possession'].apply(lambda x: int(x.split(':')[0]) * 60 + int(x.split(':')[1]))

# plot points_scored against all other columns and give r squared
for column in schedules.columns:
    if column == 'spread_covered' or column == 'spread_covered_by' or column == 'total_score':
        continue
    
    # schedules.plot.scatter(x='points_scored', y=column)
    correlation = schedules['total_score'].corr(schedules[column])
    # plt.title(f"Correlation: {correlation}")

    # Calculate the line of best fit
    # m, b = np.polyfit(schedules['points_scored'], schedules[column], 1)
    # plt.plot(schedules['points_scored'], m * schedules['points_scored'] + b, color='red')

    if abs(correlation) > 0.2:
        print(f"{column}")

    # plt.show()
