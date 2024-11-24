import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn as sk
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import shap
from data_getters import get_winner_model_data
from keras.callbacks import EarlyStopping
import joblib

# Get data for 2014-2022 for training
data = get_winner_model_data(2014, 2023, weeks_back=3, keep_avg_columns=False, keep_expected_columns=True)

# Get feature columns
cols = data.columns

features_to_drop = [
    'game_id',
    'home_team_id',
    'away_team_id',
    'home_score',
    'away_score',
    'home_moneyline',
    'actual_spread',
    'away_moneyline',
    # 'spread',
    # 'over_under',
    'home_games_played_recent',
    'away_games_played_recent',
    'home_wins_recent',
    'away_wins_recent',
    'season',
    'week',
    'overall_week',
    'short_name',
    'home_team_char_id',
    'away_team_char_id',
    'home_avg_red_zone_scores_allowed',
    'home_avg_red_zone_scores',
    'away_avg_red_zone_scores_allowed',
    'away_avg_red_zone_scores',
    'home_avg_extra_points_attempted',
    'home_avg_extra_points_made',
    'away_avg_extra_points_attempted',
    'away_avg_extra_points_made',
    'home_avg_defense_special_teams_tds',
    'away_avg_defense_special_teams_tds',
    'home_expected_red_zone_scores',
    'away_expected_red_zone_scores',
    'home_expected_extra_points_made',
    'away_expected_extra_points_made',
    'home_expected_defense_special_teams_tds',
    'away_expected_defense_special_teams_tds',
    'home_expected_extra_points_attempted',
    'away_expected_extra_points_attempted',
    'home_expected_passing_epa',
    'away_expected_passing_epa',
    'home_expected_rushing_epa',
    'away_expected_rushing_epa',
    'favorite_win',
]

# any missing columsn remove from features_to_drop
features_to_drop = [feature for feature in features_to_drop if feature in cols]

# Drop unneeded features from the data
features = cols.drop(features_to_drop)

# convert home_ and away_ third down completion/attempt, fourth down, and red zone score/attempt to percentages
# data['home_expected_third_down_percentage'] = data['home_expected_third_down_conversions'] / data['home_expected_third_down_attempts']
# data['away_expected_third_down_percentage'] = data['away_expected_third_down_conversions'] / data['away_expected_third_down_attempts']

# data['home_expected_fourth_down_percentage'] = data['home_expected_fourth_down_conversions'] / data['home_expected_fourth_down_attempts']
# data['away_expected_fourth_down_percentage'] = data['away_expected_fourth_down_conversions'] / data['away_expected_fourth_down_attempts']

# data['home_expected_red_zone_percentage'] = data['home_expected_red_zone_scores'] / data['home_expected_red_zone_attempts']
# data['away_expected_red_zone_percentage'] = data['away_expected_red_zone_scores'] / data['away_expected_red_zone_attempts']

# manual feature setting
features = [
    'spread',
    # 'over_under',
    'home_win_rate_recent',
    'away_win_rate_recent',
    'home_expected_points_scored',
    'away_expected_points_scored',
    'home_expected_first_downs',
    'away_expected_first_downs',
    'home_expected_third_down_conversion_percentage',
    'away_expected_third_down_conversion_percentage',
    'home_expected_fourth_down_conversion_percentage',
    'away_expected_fourth_down_conversion_percentage',
    'home_expected_red_zone_conversion_percentage',
    'away_expected_red_zone_conversion_percentage',
    'home_expected_turnovers',
    'away_expected_turnovers',
    'home_expected_passing_epa',
    'away_expected_passing_epa',
    # 'home_expected_penalty_yards_against',
    # 'away_expected_penalty_yards_against',
    'home_expected_passing_yards',
    'away_expected_passing_yards',
    'home_expected_rushing_yards',
    'away_expected_rushing_yards',
    'home_expected_field_goals_made',
    'away_expected_field_goals_made',
    'home_expected_rolling_offense_power_score',
    'away_expected_rolling_offense_power_score',
    'home_expected_rolling_defense_power_score',
    'away_expected_rolling_defense_power_score',
]

# corr_matrix = data[features].corr()
# upper_triangle = corr_matrix.where(
#     np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
# )

# high_corr_to_drop = [column for column in upper_triangle.columns if any(upper_triangle[column] > 0.95)]

# features = features.drop(high_corr_to_drop)

# Define the target: predicting whether the favorite team wins
target = 'actual_spread'

# remove outliers with z_score > 2.5
# z_scores = sk.preprocessing.scale(y_train)
# abs_z_scores = np.abs(z_scores)
# filtered_entries = (abs_z_scores < 2.5)
# X_train = X_train[filtered_entries]
# y_train = y_train[filtered_entries]

# plot line of best fit for each feature and r squared
feature_correlations = {}
for feature in features:
    # continue
    # plt.figure(figsize=(10, 10))
    # sns.regplot(x=X_train[feature], y=y_train, line_kws={'color': 'red'})
    # plt.title(f'{feature} vs. Points Scored')
    # plt.show()
    
    # print r squared
    r_squared = np.corrcoef(data[feature], data[target])[0, 1] ** 2
    print(f'{feature} r squared: {r_squared}')
    
    feature_correlations[feature] = r_squared
    
# drop all features with r squared < 0.1
# for feature in features:
#     if feature_correlations[feature] < 0.01:
#         features = features.drop(feature)

# print(features)

# create test split
X_train, X_test, y_train, y_test = train_test_split(data[features], data[target], test_size=0.1, random_state=42)

# z_scores = sk.preprocessing.scale(y_train)
# abs_z_scores = np.abs(z_scores)
# filtered_entries = (abs_z_scores < 2.5)
# X_train = X_train[filtered_entries]
# y_train = y_train[filtered_entries]

# set random states
random_state = 42
np.random.seed(random_state)
tf.random.set_seed(random_state)

# scale data
from sklearn.preprocessing import MinMaxScaler
# scaler = StandardScaler()
scaler = MinMaxScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# create model
# model = tf.keras.models.Sequential([
#     tf.keras.layers.Dense(128, activation='relu', input_shape=(len(features),)),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.Dense(64, activation='relu'),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.Dense(32, activation='relu'),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.Dense(16, activation='relu'),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.Dense(1, activation='linear')
# ])


model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(len(features),),
                          kernel_regularizer=tf.keras.regularizers.l2(0.01)),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(64, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.01)),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(32, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.01)),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(16, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.01)),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(1, activation='linear')
])

model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.01),
              loss='mse',
              metrics=['mae']
            )

# train model
early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

model.fit(X_train, y_train, epochs=500, batch_size=8, validation_split=0.1, verbose=1, callbacks=[early_stop])

# evaluate model
model.evaluate(X_test, y_test, verbose=1)

# print model summary
model.summary()

# test against 2024
test_data_2024 = get_winner_model_data(2024, 2024, weeks_back=3, keep_avg_columns=True, keep_expected_columns=True)
print(test_data_2024)
X_2024 = test_data_2024[features]
y_2024 = test_data_2024[target]

X_2024 = scaler.transform(X_2024)
model.evaluate(X_2024, y_2024, verbose=1)

# for each 2024 game, see if predicted spread predicts the correct winner and correct spread
correct_winner = 0
total_games = 0
correct_spread = 0

test_data_2024.reset_index(inplace=True)
predictions = model.predict(X_2024)

for index, game in test_data_2024.iterrows():
    predicted_spread = round(np.mean(predictions[index]))
    
    correct_spread += 1 if (predicted_spread > game['spread'] and game['actual_spread'] > game['spread']) or (predicted_spread < game['spread'] and game['actual_spread'] < game['spread']) else 0
    
    if (predicted_spread > 0 and game['actual_spread'] > 0) or (predicted_spread < 0 and game['actual_spread'] < 0):
        correct_winner += 1
    
    total_games += 1
    
    print(f'Predicted spread: {predicted_spread}, Actual spread: {game["actual_spread"]}, Winner: {game["short_name"]}, Correct: {predicted_spread > 0 and game["actual_spread"] > 0 or predicted_spread < 0 and game["actual_spread"] < 0}')

print(f'Correct winner: {correct_winner}/{total_games}')
print(f'Correct spread: {correct_spread}/{total_games}')

# save model and features with joblib
model_name = 'single_game_points_scored_model'
print(f'Saving {model_name}...')
joblib.dump(model, f'models/{model_name}.joblib')
joblib.dump(features, f'models/{model_name}_features.joblib')

# save the scaler
joblib.dump(scaler, f'models/{model_name}_scaler.joblib')