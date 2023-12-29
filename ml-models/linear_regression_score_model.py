import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn as sk
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import shap
from data_getters import get_data_for_points_scored_model
from keras.callbacks import EarlyStopping
import joblib

features = [
    # 'first_downs',
    'team_passing_first_downs',
    'team_rushing_first_downs',
    'team_third_down_conversions',
    'team_red_zone_attempts',
    'team_passing_yards',
    'team_yards_per_pass_attempt',
    'team_sacks_allowed',
    'team_sack_yards_lost',
    'team_rushing_yards',
    'team_rushing_attempts',
    'team_turnovers',
    'team_punts',
    'opp_rushing_attempts',
    # 'opp_defense_special_teams_sacks',
    'opp_defense_special_teams_qb_hits',
]

# append home and away to each feature
full_features = features
    
full_features.append('spread')
full_features.append('over_under')
# full_features.append('is_home_team')

# drop some bad features
# full_features.remove('opp_critical_situation_percentage')
# full_features.remove('team_penalty_yards_against')

data = get_data_for_points_scored_model(2019, 2022)

# create test split
X_train, X_test, y_train, y_test = train_test_split(data[full_features], data['points_scored'], test_size=0.1, random_state=42)

# train SGD regressor
from sklearn.linear_model import SGDRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# set random state for reproducibility


reg = make_pipeline(StandardScaler(), SGDRegressor(max_iter=1000, tol=1e-3, random_state=42))
reg.fit(X_train, y_train)
reg.score(X_test, y_test)

# get and print mae
from sklearn.metrics import mean_absolute_error
y_pred = reg.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(mae)

# print coefficients with feture names
coef = reg.named_steps['sgdregressor'].coef_
for coef, feature in zip(coef, full_features):
    print(coef, feature)