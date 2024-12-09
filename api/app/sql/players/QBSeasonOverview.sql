-- Returns aggregated qb stats for the season
-- Params:
-- - season: the season to query
-- - playerId: the player id to query

With pgs as (
	SELECT
		player_id, game_id, pgs.team_id, boxscore_id, position, s.week,
		passing_attempts, passing_completions, passing_yards, passing_air_yards, yards_per_pass_attempt, yards_per_pass_completion, passing_touchdowns, passing_sacks, passing_sack_yards, passing_sack_fumbles_lost, qb_rating, adjQBR, passer_rating, passing_first_downs, passing_yards_after_catch, passing_epa,
		passing_2pt_conversions, pacr, dakota,
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
        SUM(passing_yards) AS total_yards,
        SUM(passing_attempts) AS total_attempts,
        SUM(passing_completions) AS total_completions,
        SUM(passing_air_yards) AS total_air_yards,
        SUM(passing_touchdowns) AS total_tds,
        SUM(passing_sacks) AS total_sacks,
        SUM(passing_sack_yards) AS total_sack_yards,
        SUM(passing_sack_fumbles_lost) AS total_sack_fumbles_lost,
        SUM(passing_first_downs) AS total_first_downs,
        SUM(passing_yards_after_catch) AS total_yac,
        SUM(passing_epa) AS total_epa,
        SUM(passing_2pt_conversions) AS total_2pt_conversions,
        COUNT(*) AS total_games
    FROM
        pgs
),
agg_home AS (
    SELECT
        SUM(passing_yards) AS total_yards_home,
        SUM(passing_attempts) AS total_attempts_home,
        SUM(passing_completions) AS total_completions_home,
        SUM(passing_air_yards) AS total_air_yards_home,
        SUM(passing_touchdowns) AS total_tds_home,
        SUM(passing_sacks) AS total_sacks_home,
        COUNT(*) AS total_games_home
    FROM
        pgs
    WHERE
        is_home
),
agg_away AS (
    SELECT
        SUM(passing_yards) AS total_yards_away,
        SUM(passing_attempts) AS total_attempts_away,
        SUM(passing_completions) AS total_completions_away,
        SUM(passing_air_yards) AS total_air_yards_away,
        SUM(passing_touchdowns) AS total_tds_away,
        SUM(passing_sacks) AS total_sacks_away,
        COUNT(*) AS total_games_away
    FROM
        pgs
    WHERE
        NOT is_home
),
agg_division AS (
    SELECT
        SUM(passing_yards) AS total_yards_division,
        SUM(passing_attempts) AS total_attempts_division,
        SUM(passing_completions) AS total_completions_division,
        SUM(passing_air_yards) AS total_air_yards_division,
        SUM(passing_touchdowns) AS total_tds_division,
        SUM(passing_sacks) AS total_sacks_division,
        COUNT(*) AS total_games_division
    FROM
        pgs
    WHERE
        is_division_game
),
calc_agg AS (
    SELECT
        (
            LEAST(GREATEST((total_completions / total_attempts - 0.3) * 5, 0), 2.375) +
            LEAST(GREATEST((total_yards / total_attempts - 3) * 0.25, 0), 2.375) +
            LEAST(GREATEST((total_tds / total_attempts) * 20, 0), 2.375) +
            LEAST(GREATEST(2.375 - (total_sacks * 25) / total_attempts, 0), 2.375)
        ) / 6 * 100 AS passer_rating,
        total_yards / total_attempts AS yards_per_attempt,
        total_yards / total_completions AS yards_per_completion,
        total_air_yards / total_attempts AS air_yards_per_attempt,
        total_air_yards / total_completions AS air_yards_per_completion
    FROM
        agg
),
calc_agg_home AS (
    SELECT
        (
            LEAST(GREATEST((total_completions_home / total_attempts_home - 0.3) * 5, 0), 2.375) +
            LEAST(GREATEST((total_yards_home / total_attempts_home - 3) * 0.25, 0), 2.375) +
            LEAST(GREATEST((total_tds_home / total_attempts_home) * 20, 0), 2.375) +
            LEAST(GREATEST(2.375 - (total_sacks_home * 25) / total_attempts_home, 0), 2.375)
        ) / 6 * 100 AS passer_rating_home,
        total_yards_home / total_attempts_home AS yards_per_attempt_home,
        total_yards_home / total_completions_home AS yards_per_completion_home,
        total_air_yards_home / total_attempts_home AS air_yards_per_attempt_home,
        total_air_yards_home / total_completions_home AS air_yards_per_completion_home,
        total_tds_home / total_attempts_home AS td_rate_home,
        total_completions_home / total_attempts_home AS completion_rate_home,
        (total_yards_home - total_air_yards_home) / NULLIF(total_completions_home, 0) AS yards_after_catch_per_completion_home
    FROM
        agg_home
),
calc_agg_away AS (
    SELECT
        (
            LEAST(GREATEST((total_completions_away / total_attempts_away - 0.3) * 5, 0), 2.375) +
            LEAST(GREATEST((total_yards_away / total_attempts_away - 3) * 0.25, 0), 2.375) +
            LEAST(GREATEST((total_tds_away / total_attempts_away) * 20, 0), 2.375) +
            LEAST(GREATEST(2.375 - (total_sacks_away * 25) / total_attempts_away, 0), 2.375)
        ) / 6 * 100 AS passer_rating_away,
        total_yards_away / total_attempts_away AS yards_per_attempt_away,
        total_yards_away / total_completions_away AS yards_per_completion_away,
        total_air_yards_away / total_attempts_away AS air_yards_per_attempt_away,
        total_air_yards_away / total_completions_away AS air_yards_per_completion_away,
        total_tds_away / total_attempts_away AS td_rate_away,
        total_completions_away / total_attempts_away AS completion_rate_away,
        (total_yards_away - total_air_yards_away) / NULLIF(total_completions_away, 0) AS yards_after_catch_per_completion_away
    FROM
        agg_away
),
calc_agg_division AS (
    SELECT
        (
            LEAST(GREATEST((total_completions_division / total_attempts_division - 0.3) * 5, 0), 2.375) +
            LEAST(GREATEST((total_yards_division / total_attempts_division - 3) * 0.25, 0), 2.375) +
            LEAST(GREATEST((total_tds_division / total_attempts_division) * 20, 0), 2.375) +
            LEAST(GREATEST(2.375 - (total_sacks_division * 25) / total_attempts_division, 0), 2.375)
        ) / 6 * 100 AS passer_rating_division,
        total_yards_division / total_attempts_division AS yards_per_attempt_division,
        total_yards_division / total_completions_division AS yards_per_completion_division,
            total_air_yards_division / total_attempts_division AS air_yards_per_attempt_division,
        total_air_yards_division / total_completions_division AS air_yards_per_completion_division,
        total_tds_division / total_attempts_division AS td_rate_division,
        total_completions_division / total_attempts_division AS completion_rate_division,
        (total_yards_division - total_air_yards_division) / NULLIF(total_completions_division, 0) AS yards_after_catch_per_completion_division
    FROM
        agg_division
)
SELECT
    *
FROM
    calc_agg
    JOIN calc_agg_home ON 1 = 1
    JOIN calc_agg_away ON 1 = 1
    JOIN calc_agg_division ON 1 = 1;