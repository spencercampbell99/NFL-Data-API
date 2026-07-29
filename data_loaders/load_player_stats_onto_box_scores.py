import pandas as pd

from SQLConnector import MySQLConnection
from sqlalchemy import text

years = list(range(2025, 2026))

find_boxscore_query = text("""
    SELECT id FROM box_scores WHERE schedule_id = :schedule_id AND team_id = :team_id
""")

grouped_player_stats_by_game_and_team = text("""
    select
        team_id,
        game_id,
        sum(coalesce(passing_epa, 0) + coalesce(rushing_epa, 0) + coalesce(receiving_epa, 0)) as total_epa,
        sum(coalesce(passing_epa, 0)) as passing_epa,
        sum(coalesce(rushing_epa, 0)) as rushing_epa,
        sum(coalesce(receiving_epa, 0)) as receiving_epa,
        sum(coalesce(tackles, 0)) as defense_tackles,
        sum(coalesce(tackles_for_loss, 0)) as defense_tackles_for_loss,
        sum(coalesce(fumbles_forced, 0)) as defense_forced_fumbles,
        sum(coalesce(sacks, 0)) as defense_sacks,
        sum(coalesce(qb_hits, 0)) as defense_qb_hits,
        sum(coalesce(interceptions, 0)) as defense_interceptions,
        sum(coalesce(pass_defended, 0)) as defense_passes_defended,
        sum(coalesce(defensive_touchdowns, 0)) as defense_special_teams_tds,
        -- sum(coalesce(def_fumble_recovery_opp, 0) + coalesce(passing_sacks_fumbles_lost, 0) + coalesce(rushing_fumbles_lost, 0) + coalesce(receiving_fumbles_lost, 0)) as fumbles_lost,
        sum(coalesce(def_safety_forced, 0)) as defense_safeties,
        sum(coalesce(fg_made, 0)) as field_goals_made,
        sum(coalesce(fg_missed, 0) + coalesce(fg_made, 0)) as field_goals_attempted,
        sum(coalesce(pat_made, 0)) as extra_points_made,
        sum(coalesce(pat_missed, 0) + coalesce(pat_made, 0)) as extra_points_attempted,
        sum(coalesce(punts, 0)) as punts,
        sum(coalesce(punt_yards, 0)) as punt_yards,
        CASE WHEN sum(coalesce(punt_yards, 0)) = 0 THEN NULL ELSE sum(coalesce(punts, 0)) / sum(coalesce(punt_yards, 0)) END as yards_per_punt,
        sum(coalesce(touchbacks, 0)) as touchbacks,
        sum(coalesce(punts_inside_20, 0)) as punts_inside_20
    from player_game_stats
    where season = :year
    group by team_id, game_id
""")

# update query
update_box_score_statement = text("""
    UPDATE box_scores
    SET total_epa = :total_epa, passing_epa = :passing_epa, rushing_epa = :rushing_epa, receiving_epa = :receiving_epa, defense_tackles = :defense_tackles, defense_tackles_for_loss = :defense_tackles_for_loss, defense_forced_fumbles = :defense_forced_fumbles, defense_sacks = :defense_sacks, defense_qb_hits = :defense_qb_hits, defense_interceptions = :defense_interceptions, defense_passes_defended = :defense_passes_defended, defense_special_teams_tds = :defense_special_teams_tds, defense_safeties = :defense_safeties, field_goals_made = :field_goals_made, field_goals_attempted = :field_goals_attempted, extra_points_made = :extra_points_made, extra_points_attempted = :extra_points_attempted, punts = :punts, punt_yards = :punt_yards, yards_per_punt = :yards_per_punt, touchbacks = :touchbacks, punts_inside_20 = :punts_inside_20
    WHERE schedule_id = :game_id AND team_id = :team_id
""")

def main():
    conn = MySQLConnection()
    try:
        for year in years:
            summed_player_stats = pd.read_sql(
                grouped_player_stats_by_game_and_team,
                conn.connection,
                params={'year': year}
            )

            # Force integer types for ids before SQL updates.
            summed_player_stats['team_id'] = summed_player_stats['team_id'].astype('int64')
            summed_player_stats['game_id'] = summed_player_stats['game_id'].astype('int64')

            total = len(summed_player_stats)
            print(f"Loading player stats into box scores for {year}")

            completed = 0
            for row in summed_player_stats.itertuples(index=False):
                team_id = int(row.team_id)
                game_id = int(row.game_id)

                if completed % 100 == 0:
                    pct = (completed / total * 100) if total else 100
                    print(f"{completed} / {total} ({pct:.2f}%)")

                boxscore = conn.connection.execute(
                    find_boxscore_query,
                    {'schedule_id': game_id, 'team_id': team_id}
                ).fetchone()

                if boxscore is None:
                    print(f"Boxscore not found for team {team_id} in game {game_id}")
                    completed += 1
                    continue

                # Build params dict explicitly (avoid float ids and keep None where appropriate)
                data = row._asdict()
                data['team_id'] = team_id
                data['game_id'] = game_id  # used as schedule_id in WHERE

                # Replace NaNs with 0 except yards_per_punt (keep None)
                for k, v in list(data.items()):
                    if k == 'yards_per_punt':
                        data[k] = None if pd.isna(v) else v
                    else:
                        data[k] = 0 if pd.isna(v) else v

                conn.connection.execute(update_box_score_statement, data)
                completed += 1

        conn.connection.commit()
        print("Done loading player stats into box scores")
    except Exception:
        conn.connection.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()