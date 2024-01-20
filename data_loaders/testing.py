import pandas as pd
import nfl_data_py as nfl

data = nfl.import_weekly_data([2023])

print(data.head())

print(data.columns)