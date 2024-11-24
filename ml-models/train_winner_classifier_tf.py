import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.callbacks import EarlyStopping
from data_getters import get_winner_model_data
import matplotlib.pyplot as plt

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
    'actual_spread',
    'spread',
    'over_under',
    'home_moneyline',
    'actual_spread',
    'away_moneyline',
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

# override features
features = [
    # 'spread',
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

# Define the target: predicting whether the favorite team wins
target = 'favorite_win'

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

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(data[features], data[target], test_size=0.1, random_state=42)

# Preprocessing (scaling)
from sklearn.preprocessing import MinMaxScaler
# scaler = StandardScaler()
scaler = MinMaxScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Define the dense neural network model
model = Sequential()
model.add(Dense(128, activation='relu', input_shape=(len(features),)))
model.add(Dropout(0.1))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.1))
model.add(Dense(32, activation='relu'))
model.add(Dropout(0.1))
model.add(Dense(16, activation='relu'))
model.add(Dropout(0.1))
model.add(Dense(8, activation='relu'))
model.add(Dropout(0.1))
model.add(Dense(1, activation='sigmoid'))

# Compile the model with binary crossentropy loss and accuracy metrics
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Early stopping to avoid overfitting
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

# Train the model
history = model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=50, callbacks=[early_stopping])

# Evaluate the model on the test set
loss, accuracy = model.evaluate(X_test, y_test)
print(f'Test Loss: {loss}')
print(f'Test Accuracy: {accuracy}')

# Get predictions (probabilities of favorite win)
predictions = model.predict(X_test)
predictions = (predictions > 0.5).astype(int)  # Convert probabilities to binary (1 or 0)

# True values for comparison
true_values = y_test

# Show predicted vs. actual results
correct_predictions = np.sum(predictions.flatten() == true_values)
total_predictions = len(true_values)
print(f'Correct Predictions: {correct_predictions}/{total_predictions} ({correct_predictions/total_predictions:.2%})')

# Now let's train on 2014-2023 and test on 2024
# Load 2024 data for testing
test_data_2024 = get_winner_model_data(2024, 2024, weeks_back=3, keep_avg_columns=True, keep_expected_columns=True)

# Preprocess and scale 2024 data
scaled_test_data_2024 = scaler.transform(test_data_2024[features])

# Evaluate on 2024 data
loss_2024, accuracy_2024 = model.evaluate(scaled_test_data_2024, test_data_2024[target].values)
print(f'2024 Test Loss: {loss_2024}')
print(f'2024 Test Accuracy: {accuracy_2024}')

# Make predictions for 2024 games
predictions_2024 = model.predict(scaled_test_data_2024)
predictions_2024 = (predictions_2024 > 0.5).astype(int)  # Convert to binary

# Visualize the comparison between predicted and actual values for 2024
true_values_2024 = test_data_2024[target].values

correct_predictions_2024 = np.sum(predictions_2024.flatten() == true_values_2024)
total_predictions_2024 = len(true_values_2024)
print(f'Correct Predictions (2024): {correct_predictions_2024}/{total_predictions_2024} ({correct_predictions_2024/total_predictions_2024:.2%})')

# save model and features with joblib
import joblib

model_name = 'winner_classifier_tf'
print(f'Saving {model_name}...')
joblib.dump(model, f'models/{model_name}.joblib')
joblib.dump(features, f'models/{model_name}_features.joblib')

# save the scaler
joblib.dump(scaler, f'models/{model_name}_scaler.joblib')