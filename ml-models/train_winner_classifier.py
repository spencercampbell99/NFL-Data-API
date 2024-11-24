import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import xgboost as xgb
import matplotlib.pyplot as plt
from data_getters import get_winner_model_data
import joblib
from sklearn.metrics import accuracy_score
from sklearn.model_selection import GridSearchCV

# Get data for 2014-2023 for training
data = get_winner_model_data(2011, 2023, weeks_back=3, keep_avg_columns=False, keep_expected_columns=True)

# Get feature columns
cols = data.columns

# features_to_drop = [
#     'game_id',
#     'home_team_id',
#     'away_team_id',
#     'home_score',
#     'away_score',
#     'actual_spread',
#     'home_moneyline',
#     'actual_spread',
#     'away_moneyline',
#     'season',
#     'week',
#     'spread',
#     'over_under',
#     'overall_week',
#     'short_name',
#     'home_team_char_id',
#     'away_team_char_id',
#     'home_avg_red_zone_scores_allowed',
#     'home_avg_red_zone_scores',
#     'away_avg_red_zone_scores_allowed',
#     'away_avg_red_zone_scores',
#     'home_avg_extra_points_attempted',
#     'home_avg_extra_points_made',
#     'away_avg_extra_points_attempted',
#     'away_avg_extra_points_made',
#     'home_avg_defense_special_teams_tds',
#     'away_avg_defense_special_teams_tds',
#     'home_expected_red_zone_scores',
#     'away_expected_red_zone_scores',
#     'home_expected_extra_points_made',
#     'away_expected_extra_points_made',
#     'home_expected_defense_special_teams_tds',
#     'away_expected_defense_special_teams_tds',
#     'home_expected_extra_points_attempted',
#     'away_expected_extra_points_attempted',
#     'home_expected_passing_epa',
#     'away_expected_passing_epa',
#     'home_expected_rushing_epa',
#     'away_expected_rushing_epa',
#     'favorite_win',
# ]

# any missing columsn remove from features_to_drop
# features_to_drop = [feature for feature in features_to_drop if feature in cols]

# Drop unneeded features from the data
# features = cols.drop(features_to_drop)

# feature override
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

# Define the target: predicting whether the favorite team wins
target = 'favorite_win'

# corr_matrix = data[features].corr()
# upper_triangle = corr_matrix.where(
#     np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
# )

# high_corr_to_drop = [column for column in upper_triangle.columns if any(upper_triangle[column] > 0.9)]

# features = features.drop(high_corr_to_drop)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(data[features], data[target], test_size=0.1, random_state=42)

# Preprocessing (scaling)
from sklearn.preprocessing import MinMaxScaler
# scaler = StandardScaler()
scaler = MinMaxScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Models to train
models = {
    "Random Forest": RandomForestClassifier(n_estimators=500, random_state=42, max_depth=10, bootstrap=False, min_samples_split=5, min_samples_leaf=2),
    # "Logistic Regression": LogisticRegression(max_iter=100, random_state=42, C=0.1, penalty='l1', solver='liblinear'),
    # "SVM": SVC(kernel='rbf', probability=True, random_state=42, gamma='scale', C=0.1),
    "XGBoost": xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42, colsample_bytree=0.9, learning_rate=0.1, max_depth=3, n_estimators=100, subsample=0.8)
}

# Load 2024 data for testing
test_data_2024 = get_winner_model_data(2024, 2024, weeks_back=3, keep_avg_columns=False, keep_expected_columns=True)

# Preprocess and scale 2024 data
scaled_test_data_2024 = scaler.transform(test_data_2024[features])

def train_and_save_model(model, model_name, param_grid=None):
    if param_grid:
        # Create the GridSearchCV object
        grid_search = GridSearchCV(estimator=model, param_grid=param_grid, 
                                cv=5, n_jobs=-1, verbose=0, scoring='accuracy')

        # Fit the grid search to the training data
        grid_search.fit(X_train, y_train)

        print(f"Training {model_name}...")

        # Output the best parameters and the best score
        print("Best Hyperparameters:", grid_search.best_params_)
        print("Best Cross-Validation Accuracy:", grid_search.best_score_)
        return

    # Evaluate the best model on the test data
    # best_rf = grid_search.best_estimator_
    model.fit(X_train, y_train)
    y_pred_test = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_pred_test)
    print(f'Test Accuracy: {test_accuracy:.4f}')
    
    print(f"Training {model_name}...")
    model.fit(X_train, y_train)
    
    # pritn feature importance
    # feature_importances = model.feature_importances_
    # feature_importances_df = pd.DataFrame({'feature': features, 'importance': feature_importances})
    # print(feature_importances_df.sort_values('importance', ascending=False))
    
    # Evaluate the model on the test set (2014-2023 split)
    accuracy = model.score(X_test, y_test)
    print(f'{model_name} Test Accuracy (2014-2023): {accuracy:.2%}')
    
    # Evaluate on 2024 data
    y_true_2024 = test_data_2024[target].values
    predictions_2024 = model.predict(scaled_test_data_2024)
    
    correct_predictions_2024 = np.sum(predictions_2024 == y_true_2024)
    total_predictions_2024 = len(y_true_2024)
    accuracy_2024 = correct_predictions_2024 / total_predictions_2024
    print(f'{model_name} Test Accuracy (2024): {accuracy_2024:.2%}')
    
    # Check distribution of target variable in train and test
    # print(f"Train target distribution:\n{pd.Series(y_train).value_counts(normalize=True)}")
    # print(f"Test target distribution:\n{pd.Series(y_test).value_counts(normalize=True)}")

    print(f"{model_name} completed.\n")

    # Save the model
    joblib.dump(model, f'models/{model_name}_winner_classifier.joblib')
    joblib.dump(features, f'models/{model_name}_winner_classifier_features.joblib')
    joblib.dump(scaler, f'models/{model_name}_winner_classifier_scaler.joblib')

# Train and save the models
train_and_save_model(models["Random Forest"], "Random_Forest",
    # param_grid={
    #     'n_estimators': [50, 100, 200],
    #     'max_depth': [None, 5, 10, 20],
    #     'min_samples_split': [2, 5, 10],
    #     'min_samples_leaf': [1, 2, 4],
    #     'bootstrap': [True, False]
    # }
)

train_and_save_model(models["Logistic Regression"], "Logistic_Regression",
    # param_grid={
    #     'C': [0.001, 0.01, 0.1, 1, 10],
    #     'penalty': ['l1', 'l2'],
    #     'solver': ['liblinear', 'saga']
    # }
)

train_and_save_model(models["SVM"], "SVM",
    # param_grid={
    #     'C': [0.1, 1, 10, 100],
    #     'gamma': ['scale', 'auto']
    # }
)

train_and_save_model(models["XGBoost"], "XGBoost",
    # param_grid={
    #     'n_estimators': [100, 200],
    #     'max_depth': [3, 5],
    #     'learning_rate': [0.1, 0.3],
    #     'subsample': [0.8, 0.9],
    #     'colsample_bytree': [0.8, 0.9]
    # }
)