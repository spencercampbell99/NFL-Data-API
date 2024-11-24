import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score
from data_getters import get_winner_model_data

# Load the models and their associated features/scalers
sub_models_to_user = ['XGBoost', 'Random Forest', 'SVM', 'Logistic Regression']

# Load individual models
xgboost = joblib.load(f'models/{sub_models_to_user[0]}_winner_classifier.joblib')
random_forest = joblib.load(f'models/{sub_models_to_user[1]}_winner_classifier.joblib')
svm = joblib.load(f'models/{sub_models_to_user[2]}_winner_classifier.joblib')
log_reg = joblib.load(f'models/{sub_models_to_user[3]}_winner_classifier.joblib')

# Load the TensorFlow model separately
tf_model_name = 'winner_classifier_tf'
tf = joblib.load(f'models/{tf_model_name}.joblib')

# Load features used by each model
xgboost_features = joblib.load(f'models/{sub_models_to_user[0]}_winner_classifier_features.joblib')
random_forest_features = joblib.load(f'models/{sub_models_to_user[1]}_winner_classifier_features.joblib')
svm_features = joblib.load(f'models/{sub_models_to_user[2]}_winner_classifier_features.joblib')
log_reg_features = joblib.load(f'models/{sub_models_to_user[3]}_winner_classifier_features.joblib')
tf_features = joblib.load(f'models/{tf_model_name}_features.joblib')

# Load scalers for each model
xgboost_scaler = joblib.load(f'models/{sub_models_to_user[0]}_winner_classifier_scaler.joblib')
random_forest_scaler = joblib.load(f'models/{sub_models_to_user[1]}_winner_classifier_scaler.joblib')
tf_scaler = joblib.load(f'models/{tf_model_name}_scaler.joblib')

data = get_winner_model_data(2011, 2023, weeks_back=3, keep_avg_columns=False, keep_expected_columns=True)

target = 'favorite_win'

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(data[xgboost_features], data[target], test_size=0.1, random_state=42)

# Scale the data
X_test_scaled = xgboost_scaler.transform(X_test)

# Make predictions using each model
xgboost_predictions = xgboost.predict_proba(X_test_scaled)[:, 1]
random_forest_predictions = random_forest.predict_proba(X_test_scaled)[:, 1]
tf_predictions = tf.predict(X_test_scaled)

avg_predictions = (xgboost_predictions + random_forest_predictions + tf_predictions) / 3

def american_to_decimal(odds):
    if odds > 0:
        return odds / 100 + 1
    else:
        return 1 - (100 / odds)

# Calculate EV for favorite and underdog based on predicted probabilities and odds
def calculate_ev(prob, odds):
    payout = american_to_decimal(odds)
    return (prob * (payout - 1)) - ((1 - prob) * 1)

# Add EV calculations for both the favorite and the underdog
X_test['favorite_ev'] = calculate_ev(avg_predictions, X_test['favorite_moneyline'])
X_test['underdog_ev'] = calculate_ev(1 - avg_predictions, X_test['underdog_moneyline'])

# Select the higher EV between favorite and underdog
X_test['best_ev'] = np.maximum(X_test['favorite_ev'], X_test['underdog_ev'])

# Create a target column based on which bet would have been more profitable historically
X_test['profit_target'] = np.where(X_test['favorite_ev'] > X_test['underdog_ev'], 1, 0)

# Split the data into training and testing sets based on the new target ('profit_target')
X_train_ev, X_test_ev, y_train_ev, y_test_ev = train_test_split(X_test[xgboost_features], X_test['profit_target'], test_size=0.1, random_state=42)

# Train the new betting model using the averaged probabilities and calculated EV
betting_model = RandomForestClassifier(n_estimators=100, random_state=42)
betting_model.fit(X_train_ev, y_train_ev)

# Evaluate the betting model on the test set
y_pred_ev = betting_model.predict(X_test_ev)
ev_accuracy = accuracy_score(y_test_ev, y_pred_ev)

print(f"Betting Model Test Accuracy: {ev_accuracy:.2%}")

# Load 2024 data for evaluation
test_data_2024 = get_winner_model_data(2024, 2024, weeks_back=3, keep_avg_columns=False, keep_expected_columns=True)

# Preprocess and scale 2024 data using the same scalers as before
X_2024_scaled = xgboost_scaler.transform(test_data_2024[xgboost_features])

# Make predictions using the betting model for the 2024 season
test_data_2024['predicted_bet'] = betting_model.predict(X_2024_scaled)

# Calculate the EV for both favorites and underdogs using the predicted probabilities from the averaged model
test_data_2024['predicted_prob'] = (xgboost.predict_proba(X_2024_scaled)[:, 1] +
                                    random_forest.predict_proba(X_2024_scaled)[:, 1] +
                                    tf.predict(X_2024_scaled).flatten()) / 3

test_data_2024['favorite_ev'] = calculate_ev(test_data_2024['predicted_prob'], test_data_2024['favorite_moneyline'])
test_data_2024['underdog_ev'] = calculate_ev(1 - test_data_2024['predicted_prob'], test_data_2024['underdog_moneyline'])

# Determine which bet has the highest EV
test_data_2024['best_bet_ev'] = np.where(test_data_2024['predicted_bet'] == 1, test_data_2024['favorite_ev'], test_data_2024['underdog_ev'])

# Calculate the actual outcome of the bets
test_data_2024['actual_profit'] = np.where(
    (test_data_2024['predicted_bet'] == 1) & (test_data_2024['favorite_win'] == 1),
    american_to_decimal(test_data_2024['favorite_moneyline']) - 1,
    np.where(
        (test_data_2024['predicted_bet'] == 0) & (test_data_2024['favorite_win'] == 0),
        american_to_decimal(test_data_2024['underdog_moneyline']) - 1,
        -1
    )
)

# Calculate total profit and percentage return
total_profit = test_data_2024['actual_profit'].sum()
total_bets = len(test_data_2024)
percentage_return = (total_profit / total_bets) * 100

print(f"Total Profit from 2024 Bets: {total_profit:.2f} units")
print(f"Percentage Return on Bets: {percentage_return:.2f}%")

# Analyze how often the model chose the favorite vs. the underdog
favorite_bets = test_data_2024[test_data_2024['predicted_bet'] == 1].shape[0]
underdog_bets = test_data_2024[test_data_2024['predicted_bet'] == 0].shape[0]

print(f"Number of Favorite Bets: {favorite_bets}")
print(f"Number of Underdog Bets: {underdog_bets}")

# Optional: Show breakdown of profit by favorite and underdog bets
favorite_profit = test_data_2024.loc[test_data_2024['predicted_bet'] == 1, 'actual_profit'].sum()
underdog_profit = test_data_2024.loc[test_data_2024['predicted_bet'] == 0, 'actual_profit'].sum()

print(f"Total Profit from Favorite Bets: {favorite_profit:.2f} units")
print(f"Total Profit from Underdog Bets: {underdog_profit:.2f} units")
