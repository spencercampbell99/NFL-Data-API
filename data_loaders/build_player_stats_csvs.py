import pandas as pd

# Ensure that the user wants to continue. If not, exit the program
def confirm():
    while True:
        response = input("Ensure that you don't already have the data loaded into data_csvs before continuing. You may also choose to only update this years CSV. Do you want to continue? (y/n) ")
        if response == 'y':
            return True
        else:
            return False

# See if the user wants to update only this years CSV
def update_only_this_year():
    while True:
        response = input("Do you want to update only this years CSV? (y/n) ")
        if response == 'y':
            return True
        else:
            return False

this_season = 2024
# Ensure that the user wants to continue. If not, exit the program
if not confirm():
    exit()

# See if the user wants to update only this years CSV
update_only_this_year_csv = update_only_this_year()

if not update_only_this_year_csv:
    years_to_load = list(range(2005, this_season))

    # initialize big csv for defense and special teams stats
    defense = pd.DataFrame()
    special_teams = pd.DataFrame()

    for year in years_to_load:
        print(f"Loading data for {year}")
        
        def_data = pd.read_csv('https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_def_' + str(year) + '.csv')
        kicking_data = pd.read_csv('https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_kicking_' + str(year) + '.csv')
        
        # combine with big csvs
        defense = pd.concat([defense, def_data])
        special_teams = pd.concat([special_teams, kicking_data])
    
    # save to csv
    defense.to_csv('data_csvs/defense.csv', index=False)
    special_teams.to_csv('data_csvs/special_teams.csv', index=False)
    
# load this years data
print(f"Loading data for {this_season}")
def_data = pd.read_csv('https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_def_' + str(this_season) + '.csv')
kicking_data = pd.read_csv('https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_kicking_' + str(this_season) + '.csv')

# save to csv
def_data.to_csv('data_csvs/defense_' + str(this_season) + '.csv', index=False)
kicking_data.to_csv('data_csvs/special_teams_' + str(this_season) + '.csv', index=False)