import pandas as pd
import nfl_data_py as nfl

# Load the players data
years = list(range(2010, 2027))
players = nfl.import_seasonal_rosters(years)

# keep only the latest season entry for each player
players = players.sort_values(by='season')
players = players.drop_duplicates(subset=['player_id'], keep='last')

# Print the first few rows
print(players.columns)

# columns to keep
cols = [
    'team', 'player_id', 'position', 'depth_chart_position', 'jersey_number', 'status', 'player_name', 'first_name', 'last_name', 'birth_date', 'height', 'weight', 'college', 'espn_id',
    'headshot_url', 'rookie_year', 'draft_club', 'draft_number', 'season', 'years_exp'
]

players = players[cols]

# first_player = players.iloc[0]

# for col in players.columns:
#     print(f"{col}: {first_player[col]}")

from SQLConnector import MySQLConnection
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

ACTIVE_SEASON = 2025

def normalize_player_id(raw_player_id):
    if raw_player_id is None:
        return None

    player_id = str(raw_player_id).strip()
    if player_id.startswith('00-'):
        player_id = player_id[3:]

    if player_id == '' or not player_id.isnumeric():
        return None

    # Canonicalize numeric IDs so values like '0000045' match DB id 45.
    return str(int(player_id))

# insert statement
insert_statement = text(f"""
    INSERT INTO players (id, position, jersey_number, active, full_name, first_name, last_name, date_of_birth, height, weight, college, espn_id, headshot_url, rookie_year, draft_club, draft_number, experience)
    VALUES (:player_id, :position, :jersey_number, :active, :player_name, :first_name, :last_name, :birth_date, :height, :weight, :college, :espn_id, :headshot_url, :rookie_year, :draft_club, :draft_number, :years_exp)
""")

conn = MySQLConnection()

try:
    existing_player_ids = {
        normalize_player_id(row[0])
        for row in conn.connection.execute(text("SELECT id FROM players")).fetchall()
        if row[0] is not None
    }

    complete = 0
    inserted = 0
    skipped_existing = 0
    skipped_invalid_id = 0

    # Insert the data into the database
    for _, row in players.iterrows():
        if complete % 100 == 0:
            print(f"Processing player {complete} of {len(players)}")
        complete += 1

        # replace any nan values with None
        row = row.where(pd.notnull(row), None)

        if row['player_name'] is None:
            continue  # probably not an important player

        # if season = ACTIVE_SEASON then player is active
        row['active'] = row['season'] == ACTIVE_SEASON
        row.drop(['season', 'status'], inplace=True)

        # Convert birth_date to string if it's a Timestamp
        if row['birth_date'] is not None and hasattr(row['birth_date'], 'strftime'):
            row['birth_date'] = row['birth_date'].strftime('%Y-%m-%d')

        # for college take only character preceeding any existing ;
        row['college'] = row['college'].split(';')[0] if row['college'] is not None else None

        player_id = normalize_player_id(row['player_id'])
        if player_id is None:
            skipped_invalid_id += 1
            continue

        if player_id in existing_player_ids:
            skipped_existing += 1
            continue

        row['player_id'] = player_id
        print(f"Inserting player {row['player_name']} into the database")
        try:
            conn.connection.execute(insert_statement, row.to_dict())
            existing_player_ids.add(player_id)
            inserted += 1
        except IntegrityError as exc:
            # Skip duplicates that may still happen due to race/canonicalization edge cases.
            if '1062' in str(exc):
                skipped_existing += 1
                existing_player_ids.add(player_id)
                continue
            raise

    conn.connection.commit()
    print(
        f"Done. Inserted={inserted}, SkippedExisting={skipped_existing}, "
        f"SkippedInvalidId={skipped_invalid_id}"
    )
finally:
    conn.close()