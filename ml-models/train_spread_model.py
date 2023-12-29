import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn as sk
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import shap
from data_getters import get_spread_model_data
from keras.callbacks import EarlyStopping
import joblib

features = [
    'first_downs',
    # 'rushing_first_downs',
    'third_down_conversions',
    # 'red_zone_attempts',
    'total_offensive_yards',
    'yards_per_play',
    'passing_attempts',
    'interceptions_thrown',
    'sacks_allowed',
    # 'rushing_attempts',
    'spread',
]

# append home and away to each feature
full_features = features

data = get_spread_model_data(2017, 2022)

# remove outliers with z-score > ?
z_scores = sk.preprocessing.scale(data['spread_covered_by'])
abs_z_scores = np.abs(z_scores)
filtered_entries = (z_scores < 2)
data = data[filtered_entries]

# create test split
X_train, X_test, y_train, y_test = train_test_split(data[full_features], data['spread_covered_by'], test_size=0.2, random_state=42)

# set random states
random_state = 42
np.random.seed(random_state)
tf.random.set_seed(random_state)

# scale data
# scaler = StandardScaler()
# X_train = scaler.fit_transform(X_train)
# X_test = scaler.transform(X_test)

# create model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(6, activation='relu', input_shape=(len(full_features),)),
    tf.keras.layers.Dropout(0.1),
    tf.keras.layers.Dense(1, activation='linear')
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# train model
early_stop = EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True)

model.fit(X_train, y_train, epochs=150, batch_size=8, validation_split=0.3, shuffle=True, verbose=1, callbacks=[early_stop])

# evaluate model
model.evaluate(X_test, y_test, verbose=1)

# print model summary
model.summary()

# Create an explainer with the model
# explainer = shap.DeepExplainer(model, X_train)

# Calculate SHAP values - this might take some time for large datasets
# shap_values = explainer.shap_values(X_train)

# Plot SHAP values for each feature
# Adjust the index in shap_values[0] to match the class you are interested in (if you have a multi-class problem)
# shap.summary_plot(shap_values[0], X_train, plot_type="bar")

# save model and features with joblib
model_name = 'spread_model'
print(f'Saving {model_name}...')
joblib.dump(model, f'models/{model_name}.joblib')
joblib.dump(full_features, f'models/{model_name}_features.joblib')

# save the scaler
# joblib.dump(scaler, f'models/{model_name}_scaler.joblib')