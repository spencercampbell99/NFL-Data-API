import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn as sk
from sklearn.discriminant_analysis import StandardScaler
import tensorflow as tf
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import shap
from data_getters import get_over_under_data

data = get_over_under_data(2022, 2022)

# drop data with nas
data = data.dropna()

# for col in data.columns:
#     print(col)

# sum columns

features = [
    'home_points_scored',
    'total_score',
    'rushing_yards',
    'first_downs',
    'third_down_conversions',
    'offensive_plays',
    'yards_per_play',
    'punts_inside_20',
    'fg_attempted',
    'spread',
    'over_under'
]

full_features = features

# create X and y
X = data[full_features]
y = data['over_under_result']

# split data into train and test
from sklearn.model_selection import train_test_split
import numpy as np
import random
random_state = 42
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)

# scale data
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

np.random.seed(random_state)
tf.random.set_seed(random_state)
random.seed(random_state)

model = RandomForestClassifier(random_state=random_state, max_depth=None, min_samples_leaf=1, min_samples_split=4, n_estimators=200)

# test hyper params
# from sklearn.model_selection import RandomizedSearchCV
# from scipy.stats import randint

# param_dist = {
#     'max_depth': [None, 2, 4, 6, 10],
#     'min_samples_leaf': randint(1, 11),
#     'min_samples_split': randint(2, 11),
#     'n_estimators': [100, 200, 500]
# }

# random_search = RandomizedSearchCV(estimator=model, param_distributions=param_dist, cv=5, n_jobs=-1, verbose=0, n_iter=250, scoring="accuracy")
# random_search.fit(X_train, y_train)

# print(random_search.best_params_)

model.fit(X_train, y_train)

# evaluate model accuracy
from sklearn.metrics import accuracy_score, mean_squared_error
y_pred = model.predict(X_test)

score = accuracy_score(y_test, y_pred)

print(f'Accuracy: {score}')

# save model with joblib
import joblib
# joblib.dump(model, 'models/over_under_model.joblib')
# joblib.dump(full_features, 'models/over_under_model_features.joblib')
# joblib.dump(scaler, 'models/over_under_model_scaler.joblib')

# get games from 2023
df = get_over_under_data(2023, 2023)

df = df.dropna()

# # predict and get mse and mae
X = df[full_features]
y = df['over_under_result']

# scale data
X = scaler.fit_transform(X)

y_pred = model.predict(X)

# get accuracy
score = accuracy_score(y, y_pred)
print(f'Accuracy: {score}')

# over_under_results = pd.DataFrame({
#     'home_team': df['home_team'],
#     'away_team': df['away_team'],
#     'total_points_scored': df['total_points_scored'],
#     'over_under': df['over_under'],
#     'predicted_total_points_scored': y_pred,
#     'over_under_predicted': np.where(y_pred >= df['over_under'], 'over', 'under'),
#     'over_under_actual': np.where(df['total_points_scored'] >= df['over_under'], 'over', 'under'),
# })

# # print % correct
# correct = 0
# for index, row in over_under_results.iterrows():
#     if row['over_under_predicted'] == row['over_under_actual']:
#         correct += 1
# print(f'% correct: {correct / len(over_under_results)}')