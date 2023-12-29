import pandas as pd
import numpy as np
from sklearn.discriminant_analysis import StandardScaler
import tensorflow as tf
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from data_getters import get_spread_model_data

data = get_spread_model_data(2017, 2022)

# drop data with nas
data = data.dropna()

full_features = [
    'points_difference',
    # 'points_allowed_difference',
    'total_score',
    'rushing_yards_difference',
    # 'passing_yards_difference',
    'red_zone_attempts_difference',
    'first_downs_difference',
    # 'third_down_conversions_difference',
    # 'offensive_plays_difference',
    'yards_per_play_difference',
    'punts_inside_20_difference',
    # 'fg_attempted_difference',
    'spread',
    # 'over_under',
]

# create X and y
X = data[full_features]
y = data['spread_covered']

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

model = RandomForestClassifier(random_state=random_state, max_depth=10, min_samples_leaf=7, min_samples_split=8, n_estimators=100)

# test hyper params
# from sklearn.model_selection import RandomizedSearchCV
# from scipy.stats import randint

# param_dist = {
#     'max_depth': [None, 2, 4, 6, 10],
#     'min_samples_leaf': randint(1, 11),
#     'min_samples_split': randint(2, 11),
#     'n_estimators': [100, 200, 500]
# }

# random_search = RandomizedSearchCV(estimator=model, param_distributions=param_dist, cv=5, n_jobs=-1, verbose=0, n_iter=100, scoring="accuracy")
# random_search.fit(X_train, y_train)

# print(random_search.best_params_)

model.fit(X_train, y_train)

# print feature importances
for feature, importance in zip(full_features, model.feature_importances_):
    print(f'{feature}: {importance}')

# evaluate model accuracy
from sklearn.metrics import accuracy_score
y_pred = model.predict(X_test)

score = accuracy_score(y_test, y_pred)

print(f'Accuracy: {score}')

# save model with joblib
import joblib
joblib.dump(model, 'models/spread_model.joblib')
joblib.dump(full_features, 'models/spread_model_features.joblib')
joblib.dump(scaler, 'models/spread_model_scaler.joblib')

# get games from 2023
df = get_spread_model_data(2023, 2023)

df = df.dropna()

# # predict and get mse and mae
X = df[full_features]
y = df['spread_covered']

# scale data
X = scaler.fit_transform(X)

y_pred = model.predict(X)

# get accuracy
score = accuracy_score(y, y_pred)
print(f'Accuracy 2023: {score}')