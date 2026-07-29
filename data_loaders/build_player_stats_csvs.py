import pandas as pd

THIS_SEASON = 2025


def ask_yes_no(prompt):
    """Return True for 'y' and False for 'n'."""
    while True:
        response = input(prompt).strip().lower()
        if response in {'y', 'n'}:
            return response == 'y'
        print("Please enter 'y' or 'n'.")


def get_stats_player_week_url(year):
    return f'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_{year}.csv'


if not ask_yes_no("Ensure that you don't already have the data loaded into data_csvs before continuing. You may also choose to only update this years CSV. Do you want to continue? (y/n) "):
    exit()

update_only_this_year_csv = ask_yes_no("Do you want to update only this years CSV? (y/n) ")

if not update_only_this_year_csv:
    years_to_load = list(range(2005, THIS_SEASON))

    # initialize big csv for defense and special teams stats
    defense = pd.DataFrame()
    special_teams = pd.DataFrame()

    for year in years_to_load:
        print(f"Loading data for {year}")

        source_url = get_stats_player_week_url(year)
        print(source_url)

        all_data = pd.read_csv(source_url)

        def_data = all_data[all_data['position_group'].isin(['LB', 'DB', 'DL'])]
        st_data = all_data[all_data['position_group'] == 'SPEC']

        # combine with big csvs
        defense = pd.concat([defense, def_data])
        special_teams = pd.concat([special_teams, st_data])

    # save to csv
    defense.to_csv('data_csvs/defense.csv', index=False)
    special_teams.to_csv('data_csvs/special_teams.csv', index=False)

# load this years data
print(f"Loading data for {THIS_SEASON}")
all_data = pd.read_csv(get_stats_player_week_url(THIS_SEASON))

def_data = all_data[all_data['position_group'].isin(['LB', 'DB', 'DL'])]
st_data = all_data[all_data['position_group'] == 'SPEC']

# save to csv
def_data.to_csv('data_csvs/defense_' + str(THIS_SEASON) + '.csv', index=False)
st_data.to_csv('data_csvs/special_teams_' + str(THIS_SEASON) + '.csv', index=False)