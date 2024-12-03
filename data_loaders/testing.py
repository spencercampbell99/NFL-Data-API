import pandas as pd
import nfl_data_py as nfl

data = nfl.import_players()

print(data.head())

print(data.columns)

# print all values of first player
first_player = data.iloc[0]

for col in data.columns:
    print(f"{col}: {first_player[col]}")