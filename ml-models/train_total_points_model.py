import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
import seaborn as sns
import sklearn as sk
from sklearn.discriminant_analysis import StandardScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from xgboost import XGBRegressor
import shap
from data_getters import get_over_under_data
from keras.callbacks import EarlyStopping

data = get_over_under_data(2013, 2022)

# drop data with nas
data = data.dropna()

# for col in data.columns:
#     print(col)

# sum columns

features = [
    'total_score',
    'rushing_yards',
    'first_downs',
    'third_down_conversions',
    'offensive_plays',
    'yards_per_play',
    'punts_inside_20',
    'over_under',
]

# create full_features by appending home and away to each feature
# full_features = []
# for feature in features:
#     full_features.append(f'home_{feature}')
#     full_features.append(f'away_{feature}')

full_features = features

# create X and y
X = data[full_features]
y = data['result_total_points_scored']

# set random states
random_state = 42
np.random.seed(random_state)
tf.random.set_seed(random_state)

# create test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=random_state)

# scale data
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# create model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(8, activation='relu', input_shape=(len(full_features),)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(1, activation='linear')
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# train model
early_stop = EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True)

model.fit(X_train, y_train, epochs=150, batch_size=4, validation_split=0.1, shuffle=True, verbose=1, callbacks=[early_stop])

# evaluate model
model.evaluate(X_test, y_test, verbose=1)

# print model summary
model.summary()

# do a hyperparameter search
# from sklearn.model_selection import RandomizedSearchCV

# param_grid = {
#     "n_estimators": np.arange(100, 1001, 100),
#     "learning_rate": np.linspace(0.01, 0.3, 10),
#     "max_depth": np.arange(3, 11, 1),
#     "min_child_weight": np.arange(1, 6, 1),
#     "gamma": np.linspace(0, 0.5, 6),
#     "subsample": np.linspace(0.5, 1, 6),
#     "colsample_bytree": np.linspace(0.5, 1, 6),
#     "reg_alpha": np.linspace(0, 1, 11),
#     "reg_lambda": np.linspace(0, 1, 11),
#     'random_state': [random_state]
# }

# grid = RandomizedSearchCV(model, param_grid, n_iter=1000, verbose=0, n_jobs=-1, random_state=random_state, cv=5, scoring='neg_mean_absolute_error')
# grid.fit(X_train, y_train)
# print(grid.best_params_)
# print(grid.best_estimator_)

# print mae
print(f"MAE: {sk.metrics.mean_absolute_error(y_test, model.predict(X_test))}")

# get data for 2023
data_2023 = get_over_under_data(2023, 2023)

# scale data
X = data_2023[full_features]
y = data_2023['result_total_points_scored']

X = scaler.transform(X)

# predict 2023
predictions = model.predict(X).flatten()

# print mae
print(f"MAE 2023: {sk.metrics.mean_absolute_error(y, predictions)}")

# save model with joblib
import joblib
model_name = 'total_score_model'
joblib.dump(model, f'models/{model_name}.joblib')
joblib.dump(features, f'models/{model_name}_features.joblib')

# save scaler
joblib.dump(scaler, f'models/{model_name}_scaler.joblib')