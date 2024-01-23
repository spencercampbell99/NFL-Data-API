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

# print(data[['team_char_id', 'third_down_conversions', 'points_scored']].head(16))

# calculate p-values for passing yards for each week
weeks = data['week'].unique()

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

stat_to_check = 'passing_yards'
plot_stuff = False

stat_to_check_in_coefs = stat_to_check in features_coefs.keys()

for week in weeks:
    # get all box scores for the week
    week_data = data[data['week'] == week][stat_to_check]
    week_char_ids = data[data['week'] == week]['team_char_id']
    week_points_scored = data[data['week'] == week]['points_scored']
    
    p_values = []
    z_scores = []
    z_squared = []
    t_scores = []
    special_stat = []
    
    for yards in week_data:
        # calculate p-value for each box score
        t_stat, p_value = stats.ttest_1samp(week_data, yards)
        p_values.append(p_value)
        t_scores.append(t_stat)

        # calculate z-score for each box score
        z_scores.append((yards - week_data.mean()) / week_data.std())
        z_squared.append(z_scores[-1] ** 2)
        
        if stat_to_check_in_coefs:
            special_stat.append(features_coefs[stat_to_check] ** z_scores[-1])
        
        # p_z_scores.append(p_value * np.sign(z_scores[-1]))
        # p_z_scores.append([p_value, (yards - week_data.mean()) / week_data.std()])
    
    # normalize week_data
    normalized_week_data = (week_data - week_data.mean()) / week_data.std()
    
    
    if plot_stuff:
        # plot p-values
        plt.bar(week_char_ids, p_z_scores)
        plt.title(f'P-values for {stat_to_check} and Points Scored in Week ' + str(week))
        plt.xlabel('Team Char ID')
        plt.ylabel('P-value')

        # Add points scored to the plot
        plt.twinx()
        plt.plot(week_char_ids, week_points_scored, 'r-', marker='o', label='Points Scored')
        plt.ylabel('Points Scored')

        # Add legend
        plt.legend()

        # Add points scored values
        for i, j in zip(week_char_ids, week_points_scored):
            plt.annotate(str(j), xy=(i, j), xytext=(0, 10), textcoords='offset points')

        plt.show()
    
    # calculate r quared between raw stats and points scored
    raw_stat_r_squared = np.corrcoef(week_data, week_points_scored)[0][1] ** 2
    
    # print r squared between p-values and points scored
    print(f'Week {week} R^2: {round(np.corrcoef(special_stat, week_points_scored)[0][1] ** 2, 2)} - {round(raw_stat_r_squared, 2)}')
    
    # plt.bar(week_char_ids, p_values, 0.4, label="P")
    # plt.title(f'P-values and Z-scores for {stat_to_check} in Week ' + str(week))
    # plt.xlabel('Team Char ID')
    # plt.ylabel('P-value')
    # plt.legend()
    
    # # Add points scored to the plot
    # plt.twinx()
    # plt.plot(week_char_ids, z_scores, 'r-', marker='o', label='Z')
    # plt.ylabel('Z score')
    
    # plt.show()