-- Returns aggregated qb stats for the season
-- Params:
-- - season: the season to query
-- - playerId: the player id to query

With pgs as (
	SELECT
		player_id, game_id, pgs.team_id, boxscore_id, position, s.week,
		passing_attempts, passing_completions, passing_yards, passing_air_yards, yards_per_pass_attempt, yards_per_pass_completion, passing_touchdowns, passing_interceptions, passing_sacks, passing_sack_yards, passing_sack_fumbles_lost, qb_rating, adjQBR, passer_rating, passing_first_downs, passing_yards_after_catch, passing_epa,
		passing_2pt_conversions, pacr, dakota,
        rushing_attempts, rushing_yards, rushing_touchdowns, rushing_first_downs, rushing_epa,
        s.home_team_id = pgs.team_id as is_home,
        s.division_game as is_division_game
	FROM
		player_game_stats pgs
    JOIN
        schedules s on s.id = pgs.game_id
	WHERE
		s.season = :season and player_id = :playerId and passing_attempts > 5
),
agg AS (
    SELECT
        SUM(passing_yards) AS passing_yards,
        SUM(passing_attempts) AS total_attempts,
        SUM(passing_completions) AS total_completions,
        SUM(passing_air_yards) AS total_air_yards,
        SUM(passing_touchdowns) AS passing_tds,
        SUM(passing_interceptions) AS interceptions,
        SUM(passing_sack_yards) AS total_sack_yards,
        SUM(passing_sack_fumbles_lost) AS total_sack_fumbles_lost,
        SUM(passing_first_downs) AS passing_first_downs,
        SUM(passing_yards_after_catch) AS total_yac,
        SUM(passing_epa) AS passing_epa,
        SUM(passing_2pt_conversions) AS total_2pt_conversions,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_attempts) AS total_rushing_attempts,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,
        COUNT(*) AS total_games
    FROM
        pgs
),
agg_home AS (
    SELECT
        SUM(passing_yards) AS passing_yards,
        SUM(passing_attempts) AS total_attempts,
        SUM(passing_completions) AS total_completions,
        SUM(passing_air_yards) AS total_air_yards,
        SUM(passing_touchdowns) AS passing_tds,
        SUM(passing_interceptions) AS interceptions,
        SUM(passing_sack_yards) AS total_sack_yards,
        SUM(passing_sack_fumbles_lost) AS total_sack_fumbles_lost,
        SUM(passing_first_downs) AS passing_first_downs,
        SUM(passing_yards_after_catch) AS total_yac,
        SUM(passing_epa) AS passing_epa,
        SUM(passing_2pt_conversions) AS total_2pt_conversions,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_attempts) AS total_rushing_attempts,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,
        COUNT(*) AS total_games
    FROM
        pgs
    WHERE
        is_home
),
agg_away AS (
    SELECT
        SUM(passing_yards) AS passing_yards,
        SUM(passing_attempts) AS total_attempts,
        SUM(passing_completions) AS total_completions,
        SUM(passing_air_yards) AS total_air_yards,
        SUM(passing_touchdowns) AS passing_tds,
        SUM(passing_interceptions) AS interceptions,
        SUM(passing_sack_yards) AS total_sack_yards,
        SUM(passing_sack_fumbles_lost) AS total_sack_fumbles_lost,
        SUM(passing_first_downs) AS passing_first_downs,
        SUM(passing_yards_after_catch) AS total_yac,
        SUM(passing_epa) AS passing_epa,
        SUM(passing_2pt_conversions) AS total_2pt_conversions,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_attempts) AS total_rushing_attempts,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,
        COUNT(*) AS total_games
    FROM
        pgs
    WHERE
        NOT is_home
),
agg_division AS (
    SELECT
        SUM(passing_yards) AS passing_yards,
        SUM(passing_attempts) AS total_attempts,
        SUM(passing_completions) AS total_completions,
        SUM(passing_air_yards) AS total_air_yards,
        SUM(passing_touchdowns) AS passing_tds,
        SUM(passing_interceptions) AS interceptions,
        SUM(passing_sack_yards) AS total_sack_yards,
        SUM(passing_sack_fumbles_lost) AS total_sack_fumbles_lost,
        SUM(passing_first_downs) AS passing_first_downs,
        SUM(passing_yards_after_catch) AS total_yac,
        SUM(passing_epa) AS passing_epa,
        SUM(passing_2pt_conversions) AS total_2pt_conversions,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_attempts) AS total_rushing_attempts,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,
        COUNT(*) AS total_games
    FROM
        pgs
    WHERE
        is_division_game
),
calc_agg AS (
    SELECT
        ROUND(
            (
                LEAST(GREATEST((total_completions / total_attempts - 0.3) * 5, 0), 2.375) +
                LEAST(GREATEST((passing_yards / total_attempts - 3) * 0.25, 0), 2.375) +
                LEAST(GREATEST((passing_tds / total_attempts) * 20, 0), 2.375) +
                LEAST(GREATEST(2.375 - (interceptions * 25) / total_attempts, 0), 2.375)
            ) / 6 * 100, 1) AS passer_rating,
        ROUND(passing_yards / total_attempts, 1) AS yards_per_attempt,
        ROUND(passing_yards / total_completions, 1) AS yards_per_completion,
        ROUND(total_air_yards / total_attempts, 1) AS air_yards_per_attempt,
        ROUND(total_air_yards / total_completions, 1) AS air_yards_per_completion,
        ROUND(passing_tds / total_attempts, 1) AS td_rate,
        ROUND((total_completions / total_attempts) * 100, 2) AS completion_rate,
        ROUND((passing_yards - total_air_yards) / NULLIF(total_completions, 0), 1) AS yards_after_catch_per_completion,
        ROUND(total_2pt_conversions / NULLIF(passing_tds, 0), 1) AS two_point_conversion_rate,
        ROUND(passing_epa / total_games, 1) AS passing_epa,
        ROUND(passing_yards / total_games, 1) AS passing_yards,
        ROUND(passing_tds / total_games, 1) AS passing_tds,
        ROUND(interceptions / total_games, 2) AS interceptions,

        -- Rushing Stats
        ROUND(rushing_yards / total_rushing_attempts, 1) AS rushing_yards_per_attempt,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards,
        ROUND(rushing_tds / total_games, 1) AS rushing_tds,
        ROUND(rushing_epa / total_games, 1) AS rushing_epa,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs
    FROM
        agg
    WHERE
        total_games > 0
),
calc_agg_home AS (
    SELECT
        ROUND(
            (
                LEAST(GREATEST((total_completions / total_attempts - 0.3) * 5, 0), 2.375) +
                LEAST(GREATEST((passing_yards / total_attempts - 3) * 0.25, 0), 2.375) +
                LEAST(GREATEST((passing_tds / total_attempts) * 20, 0), 2.375) +
                LEAST(GREATEST(2.375 - (interceptions * 25) / total_attempts, 0), 2.375)
            ) / 6 * 100, 1) AS passer_rating_home,
        ROUND(passing_yards / total_attempts, 1) AS yards_per_attempt_home,
        ROUND(passing_yards / total_completions, 1) AS yards_per_completion_home,
        ROUND(total_air_yards / total_attempts, 1) AS air_yards_per_attempt_home,
        ROUND(total_air_yards / total_completions, 1) AS air_yards_per_completion_home,
        ROUND(passing_tds / total_attempts, 1) AS td_rate_home,
        ROUND((total_completions / total_attempts) * 100, 2) AS completion_rate_home,
        ROUND((passing_yards - total_air_yards) / NULLIF(total_completions, 0), 1) AS yards_after_catch_per_completion_home,
        ROUND(passing_epa / total_games, 1) AS passing_epa_home,
        ROUND(passing_yards / total_games, 1) AS passing_yards_home,
        ROUND(passing_tds / total_games, 1) AS passing_tds_home,
        ROUND(interceptions / total_games, 2) AS interceptions_home,

        -- Rushing Stats
        ROUND(rushing_yards / total_rushing_attempts, 1) AS rushing_yards_per_attempt_home,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards_home,
        ROUND(rushing_tds / total_games, 1) AS rushing_tds_home,
        ROUND(rushing_epa / total_games, 1) AS rushing_epa_home,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs_home
    FROM
        agg_home
    WHERE
        total_games > 0
),
calc_agg_away AS (
    SELECT
        ROUND(
            (
                LEAST(GREATEST((total_completions / total_attempts - 0.3) * 5, 0), 2.375) +
                LEAST(GREATEST((passing_yards / total_attempts - 3) * 0.25, 0), 2.375) +
                LEAST(GREATEST((passing_tds / total_attempts) * 20, 0), 2.375) +
                LEAST(GREATEST(2.375 - (interceptions * 25) / total_attempts, 0), 2.375)
            ) / 6 * 100, 1) AS passer_rating_away,
        ROUND(passing_yards / total_attempts, 1) AS yards_per_attempt_away,
        ROUND(passing_yards / total_completions, 1) AS yards_per_completion_away,
        ROUND(total_air_yards / total_attempts, 1) AS air_yards_per_attempt_away,
        ROUND(total_air_yards / total_completions, 1) AS air_yards_per_completion_away,
        ROUND(passing_tds / total_attempts, 1) AS td_rate_away,
        ROUND((total_completions / total_attempts) * 100, 2) AS completion_rate_away,
        ROUND((passing_yards - total_air_yards) / NULLIF(total_completions, 0), 1) AS yards_after_catch_per_completion_away,
        ROUND(passing_epa / total_games, 1) AS passing_epa_away,
        ROUND(passing_yards / total_games, 1) AS passing_yards_away,
        ROUND(passing_tds / total_games, 1) AS passing_tds_away,
        ROUND(interceptions / total_games, 2) AS interceptions_away,

        -- Rushing Stats
        ROUND(rushing_yards / total_rushing_attempts, 1) AS rushing_yards_per_attempt_away,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards_away,
        ROUND(rushing_tds / total_games, 1) AS rushing_tds_away,
        ROUND(rushing_epa / total_games, 1) AS rushing_epa_away,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs_away
    FROM
        agg_away
    WHERE
        total_games > 0
),
calc_agg_division AS (
    SELECT
        ROUND(
        (
            LEAST(GREATEST((total_completions / total_attempts - 0.3) * 5, 0), 2.375) +
            LEAST(GREATEST((passing_yards / total_attempts - 3) * 0.25, 0), 2.375) +
            LEAST(GREATEST((passing_tds / total_attempts) * 20, 0), 2.375) +
            LEAST(GREATEST(2.375 - (interceptions * 25) / total_attempts, 0), 2.375)
            ) / 6 * 100, 1
        ) AS passer_rating_division,
        ROUND(passing_yards / total_attempts, 1) AS yards_per_attempt_division,
        ROUND(passing_yards / total_completions, 1) AS yards_per_completion_division,
        ROUND(total_air_yards / total_attempts, 1) AS air_yards_per_attempt_division,
        ROUND(total_air_yards / total_completions, 1) AS air_yards_per_completion_division,
        ROUND(passing_tds / total_attempts, 1) AS td_rate_division,
        ROUND((total_completions / total_attempts) * 100, 2) AS completion_rate_division,
        ROUND((passing_yards - total_air_yards) / NULLIF(total_completions, 0), 1) AS yards_after_catch_per_completion_division,
        ROUND(passing_epa / total_games, 1) AS passing_epa_division,
        ROUND(passing_yards / total_games, 1) AS passing_yards_division,
        ROUND(passing_tds / total_games, 1) AS passing_tds_division,
        ROUND(interceptions / total_games, 2) AS interceptions_division,

        -- Rushing Stats
        ROUND(rushing_yards / total_rushing_attempts, 1) AS rushing_yards_per_attempt_division,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards_division,
        ROUND(rushing_tds / total_games, 1) AS rushing_tds_division,
        ROUND(rushing_epa / total_games, 1) AS rushing_epa_division,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs_division
    FROM
        agg_division
    WHERE
        total_games > 0
)
SELECT
    *
FROM
    calc_agg
    JOIN calc_agg_home ON 1 = 1
    JOIN calc_agg_away ON 1 = 1
    JOIN calc_agg_division ON 1 = 1;