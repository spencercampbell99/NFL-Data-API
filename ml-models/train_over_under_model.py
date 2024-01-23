import pandas as pd
import numpy as np
from sklearn.discriminant_analysis import StandardScaler
import tensorflow as tf
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from data_getters import get_over_under_data

data = get_over_under_data(2019, 2022)

# drop data with nas
data = data.dropna()

full_features = [ # come from averages of recent games
    'passing_yards',
    'rushing_yards',
    'first_downs',
    'third_down_conversions',
    'offensive_plays',
    'punts_inside_20',
    'total_epa',
    'spread',
    'over_under'
]

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
# scaler = MinMaxScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

np.random.seed(random_state)
tf.random.set_seed(random_state)
random.seed(random_state)

model = RandomForestClassifier(random_state=random_state, n_estimators=800, min_samples_split=20, min_samples_leaf=10, max_depth=2)

from xgboost import XGBClassifier

model2 = XGBClassifier(random_state=random_state, n_estimators=900, learning_rate=0.001, max_depth=None, min_child_weight=2)
model2.fit(X_train, y_train)

# test hyper params
# from sklearn.model_selection import RandomizedSearchCV
# from scipy.stats import randint

# param_dist = {
#     'max_depth': [None, 2, 4, 6, 10],
#     'min_samples_leaf': [1, 2, 4, 6, 10, 20],
#     'min_samples_split': [2, 4, 6, 10, 20],
#     'n_estimators': [100, 200, 300, 400, 500, 600, 700, 800, 900]
# }

# random_search = RandomizedSearchCV(estimator=model, param_distributions=param_dist, cv=5, n_jobs=-1, verbose=0, n_iter=500, scoring="accuracy")
# random_search.fit(X_train, y_train)

# print(random_search.best_params_)

# # test model 2
# param_dist = {
#     'max_depth': [None, 2, 4, 6, 10],
#     'min_child_weight': [1, 2, 4, 6, 10, 20],
#     'n_estimators': [100, 200, 300, 400, 500, 600, 700, 800, 900],
#     'learning_rate': [0.001, 0.01, 0.1, 0.2, 0.3]
# }
# random_search = RandomizedSearchCV(estimator=model2, param_distributions=param_dist, cv=5, n_jobs=-1, verbose=0, n_iter=500, scoring="accuracy")
# random_search.fit(X_train, y_train)

# print(random_search.best_params_)

model.fit(X_train, y_train)

# evaluate model accuracy
from sklearn.metrics import accuracy_score, mean_squared_error
y_pred = model.predict(X_test)

score = accuracy_score(y_test, y_pred)

print(f'Accuracy: {score}')

# evaluate model 2 accuracy
y_pred2 = model2.predict(X_test)
score2 = accuracy_score(y_test, y_pred2)
print(f'Accuracy (XGBoost): {score2}')

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
print(f'Accuracy 2023: {score}')

# model 2
y_pred2 = model2.predict(X)
score2 = accuracy_score(y, y_pred2)
print(f'Accuracy 2023 (XGBoost): {score2}')

# save the one with higher score
# save model with joblib
import joblib
if score > score2:
    print('Saving model 1...')
    joblib.dump(model, 'models/over_under_model.joblib')
    joblib.dump(full_features, 'models/over_under_model_features.joblib')
    joblib.dump(scaler, 'models/over_under_model_scaler.joblib')
else:
    print('Saving model 2...')
    joblib.dump(model2, 'models/over_under_model.joblib')
    joblib.dump(full_features, 'models/over_under_model_features.joblib')
    joblib.dump(scaler, 'models/over_under_model_scaler.joblib')