from collections import Counter
from matplotlib import pyplot as plt
from matplotlib.pylab import norm
from scipy import stats
from MysqlConnection import MySQLConnection
from sqlalchemy import text
conn = MySQLConnection()
import pandas as pd
import numpy as np
import numpy as np

# get all box scores for 2023
query = text("SELECT box_scores.*, week, season FROM box_scores JOIN schedules on schedules.id = box_scores.schedule_id WHERE season = 2023 ORDER BY week ASC")
data = pd.read_sql(query, conn.connection)

features_coefs = {
    'passing_first_downs': 1.5285072219308058,
    'rushing_first_downs': 0.5541503712179643,
    'third_down_conversions': 0.7494697196992546,
    'red_zone_attempts': 2.6885252837842413,
    'passing_yards': -0.782712970540092,
    'yards_per_pass_attempt': 4.235795839045554,
    'sacks_allowed': -0.01541669822940117,
    'sack_yards_lost': -0.07809528559447797,
    'rushing_yards': 2.2676362517409556,
    'rushing_attempts': -0.8886392144862788,
    'turnovers': -1.157713429955479,
    'punts': 0.6257555170686746,
    # 'opp_rushing_attempts': -0.4873604991944854,
    # 'opp_defense_special_teams_qb_hits': -0.12691653950059845,
    # 'spread': 0.7649359979796952,
    # 'over_under': 0.7381265848861227
}

weeks = data['week'].unique()

stats_to_include = list(features_coefs.keys())

for week in weeks:
    if week != 14:
        continue
    # take z_score and raise it to the power of the coefficient for each stat and sum it for each team on the week
    
    # get all box scores for the week
    week_data = data[data['week'] == week]
    
    # calculate z-scores for each stat
    z_scores = []
    for stat in stats_to_include:
        z_scores.append((week_data[stat] - week_data[stat].mean()) / week_data[stat].std())
    
    # calculate the offensive performance for each team
    offensive_performances = []
    for index, row in week_data.iterrows():
        offensive_performance = 0
        for i in range(len(stats_to_include)):
            offensive_performance += z_scores[i][index] * features_coefs[stats_to_include[i]]
        offensive_performances.append(offensive_performance)
    
    # add the offensive performance to the dataframe
    week_data['offensive_performance'] = offensive_performances

    # get the offensive performance for each team
    week_char_ids = week_data['team_char_id'].unique()
    week_offensive_performances = []
    for char_id in week_char_ids:
        week_offensive_performances.append(week_data[week_data['team_char_id'] == char_id]['offensive_performance'].sum())
        
    # plot the offensive performances
    plt.bar(week_char_ids, week_offensive_performances)
    plt.title(f'Offensive Performances in Week ' + str(week))
    plt.xlabel('Team Char ID')
    plt.ylabel('Offensive Performance')
    plt.show()