import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn as sk
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import shap
from data_getters import build_expected_results_for_score_moden_training
from keras.callbacks import EarlyStopping
import joblib

features = [
    'team_passing_first_downs',
    'team_rushing_first_downs',
    'team_red_zone_attempts',
    'team_total_offensive_yards',
    'team_yards_per_play',
    'team_passing_yards',
    'team_yards_per_pass_attempt',
    'team_passing_epa',
    'team_sacks_allowed',
    'team_rushing_attempts',
    'team_rushing_epa',
    'team_receiving_epa',
    'team_total_epa',
    'team_turnovers',
    'team_time_of_possession',
    'team_win_rate',
    'opp_win_rate',
    # 'opp_turnovers'
]

# append home and away to each feature
full_features = features
    
full_features.append('spread')
full_features.append('over_under')
# full_features.append('is_home_team')

# drop some bad features
# full_features.remove('opp_critical_situation_percentage')
# full_features.remove('team_penalty_yards_against')

data = build_expected_results_for_score_moden_training(2023, 2023)

# create test split
X_train, X_test, y_train, y_test = train_test_split(data[full_features], data['points_scored'], test_size=0.1, random_state=42)

# remove outliers with z_score > 2.5
# z_scores = sk.preprocessing.scale(y_train)
# abs_z_scores = np.abs(z_scores)
# filtered_entries = (abs_z_scores < 2.5)
# X_train = X_train[filtered_entries]
# y_train = y_train[filtered_entries]

# plot line of best fit for each feature and r squared
for feature in full_features:
    # continue
    # plt.figure(figsize=(10, 10))
    # sns.regplot(x=X_train[feature], y=y_train, line_kws={'color': 'red'})
    # plt.title(f'{feature} vs. Points Scored')
    # plt.show()
    
    # print r squared
    r_squared = np.corrcoef(data[feature], data['points_scored'])[0, 1] ** 2
    print(f'{feature} r squared: {r_squared}')


exit()
# set random states
random_state = 42
np.random.seed(random_state)
tf.random.set_seed(random_state)

# scale data
from sklearn.preprocessing import MinMaxScaler
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# create model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=(len(full_features),)),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(1, activation='linear')
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# train model
early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

model.fit(X_train, y_train, epochs=150, batch_size=8, validation_split=0.1, shuffle=True, verbose=0, callbacks=[early_stop])

# evaluate model
model.evaluate(X_test, y_test, verbose=1)

# print model summary
model.summary()

# save model and features with joblib
model_name = 'points_scored_averages_model'
version = 'v2024.1'
print(f'Saving {model_name}...')
joblib.dump(model, f'models/{model_name}_{version}.joblib')
joblib.dump(full_features, f'models/{model_name}_{version}_features.joblib')

# save the scaler
joblib.dump(scaler, f'models/{model_name}_{version}_scaler.joblib')