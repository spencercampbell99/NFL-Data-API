import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout
from keras.callbacks import EarlyStopping
import joblib
from data_getters import get_winner_model_data
import matplotlib.pyplot as plt

# Add new imports for handling sequences
from keras.preprocessing.sequence import TimeseriesGenerator

# Get data for 2014-2022 for training
data = get_winner_model_data(2014, 2022, weeks_back=4)

# print columns
cols = data.columns

# for col in cols:
#     print(col)
# exit()

features = cols

features_to_drop = [
    'game_id',
    'home_team_id',
    'away_team_id',
    'home_score',
    'away_score',
    'home_moneyline',
    'away_moneyline',
    'season',
    'week',
    'overall_week',
]

# drop any features that are not needed (i.e present in both arrays)
for feature in features_to_drop:
    features = features.drop(feature)

# Preprocessing (scaling)
scaler = StandardScaler()
scaled_data = scaler.fit_transform(data[features])

# Define the target: predicting home team win
target = 'favorite_win'

# Convert data to time series format
sequence_length = 5

# Adjust the generator creation
train_size = int(len(scaled_data) * 0.9)  # 90% for training

# Create TimeseriesGenerator for training and testing sets
train_generator = TimeseriesGenerator(
    scaled_data[:train_size], 
    data[target].values[:train_size], 
    length=sequence_length, 
    batch_size=32
)

test_generator = TimeseriesGenerator(
    scaled_data[train_size:], 
    data[target].values[train_size:], 
    length=sequence_length, 
    batch_size=32
)

# Define the LSTM model
model = Sequential()
model.add(LSTM(128, activation='relu', input_shape=(sequence_length, len(features))))
model.add(Dropout(0.2))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(1, activation='sigmoid'))  # Output layer for binary classification (0 or 1)

# Compile the model with binary crossentropy loss and accuracy metrics
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Early stopping to avoid overfitting
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

# Train the model
history = model.fit(train_generator, validation_data=test_generator, epochs=50, callbacks=[early_stopping])

# Evaluate the model on the test set
loss, accuracy = model.evaluate(test_generator)
print(f'Test Loss: {loss}')
print(f'Test Accuracy: {accuracy}')

# Get predictions (probabilities of home_win)
predictions = model.predict(test_generator)
predictions = (predictions > 0.5).astype(int)  # Convert probabilities to binary (1 or 0)

# True values for comparison
true_values = np.array([test_generator.targets[i] for i in range(len(test_generator))])

# Now let's train on 2014-2022 and test on 2023
# Load 2023 data for testing
test_data_2023 = get_winner_model_data(2023, 2023, weeks_back=4)

# Preprocess and scale 2023 data
scaled_test_data_2023 = scaler.transform(test_data_2023[features])

# Create TimeseriesGenerator for 2023 data
test_generator_2023 = TimeseriesGenerator(
    scaled_test_data_2023, 
    test_data_2023[target].values, 
    length=sequence_length, 
    batch_size=32
)

# Evaluate on 2023 data
loss_2023, accuracy_2023 = model.evaluate(test_generator_2023)
print(f'2023 Test Loss: {loss_2023}')
print(f'2023 Test Accuracy: {accuracy_2023}')

# Make predictions for 2023 games
predictions_2023 = model.predict(test_generator_2023)
predictions_2023 = (predictions_2023 > 0.5).astype(int)  # Convert to binary

# Visualize the comparison between predicted and actual values for 2023
true_values_2023 = np.array([test_generator_2023.targets[i] for i in range(len(test_generator_2023))])

print(true_values_2023)

# Show predicted home_win vs. actual home_win, percentage of correct predictions
correct_predictions = np.sum(predictions_2023 == true_values_2023)
total_predictions = len(true_values_2023)
print(f'Correct Predictions: {correct_predictions}/{total_predictions} ({correct_predictions/total_predictions:.2%})')