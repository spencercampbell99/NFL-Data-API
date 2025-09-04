-- Returns aggregated RB stats for the season
-- Params:
-- - season: the season to query
-- - playerId: the player id to query

WITH pgs AS (
    SELECT
        player_id, game_id, pgs.team_id, boxscore_id, position, s.week,
        rushing_attempts, rushing_yards, rushing_touchdowns, rushing_first_downs, rushing_epa,
        targets, receptions, receiving_yards, receiving_touchdowns, receiving_first_downs, receiving_yards_after_catch, receiving_epa, fumbles_lost,
        fumbles,
        s.home_team_id = pgs.team_id AS is_home,
        s.division_game AS is_division_game
    FROM
        player_game_stats pgs
    JOIN
        schedules s ON s.id = pgs.game_id
    WHERE
        s.season = :season AND player_id = :playerId AND (rushing_attempts > 3 OR targets > 2)
),
agg AS (
    SELECT
        SUM(rushing_attempts) AS rushing_attempts,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,

        SUM(targets) AS targets,
        SUM(receptions) AS receptions,
        SUM(receiving_yards) AS receiving_yards,
        SUM(receiving_touchdowns) AS receiving_tds,
        SUM(receiving_first_downs) AS receiving_first_downs,
        SUM(receiving_yards_after_catch) AS receiving_yac,
        SUM(receiving_epa) AS receiving_epa,

        SUM(fumbles) AS fumbles,
        SUM(fumbles_lost) AS fumbles_lost,

        COUNT(*) AS total_games
    FROM
        pgs
),
agg_home AS (
    SELECT
        SUM(rushing_attempts) AS rushing_attempts,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,

        SUM(targets) AS targets,
        SUM(receptions) AS receptions,
        SUM(receiving_yards) AS receiving_yards,
        SUM(receiving_touchdowns) AS receiving_tds,
        SUM(receiving_first_downs) AS receiving_first_downs,
        SUM(receiving_yards_after_catch) AS receiving_yac,
        SUM(receiving_epa) AS receiving_epa,

        SUM(fumbles) AS fumbles,
        SUM(fumbles_lost) AS fumbles_lost,

        COUNT(*) AS total_games
    FROM
        pgs
    WHERE
        is_home
),
agg_away AS (
    SELECT
        SUM(rushing_attempts) AS rushing_attempts,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,

        SUM(targets) AS targets,
        SUM(receptions) AS receptions,
        SUM(receiving_yards) AS receiving_yards,
        SUM(receiving_touchdowns) AS receiving_tds,
        SUM(receiving_first_downs) AS receiving_first_downs,
        SUM(receiving_yards_after_catch) AS receiving_yac,
        SUM(receiving_epa) AS receiving_epa,

        SUM(fumbles) AS fumbles,
        SUM(fumbles_lost) AS fumbles_lost,

        COUNT(*) AS total_games
    FROM
        pgs
    WHERE
        NOT is_home
),
agg_division AS (
    SELECT
        SUM(rushing_attempts) AS rushing_attempts,
        SUM(rushing_yards) AS rushing_yards,
        SUM(rushing_touchdowns) AS rushing_tds,
        SUM(rushing_first_downs) AS rushing_first_downs,
        SUM(rushing_epa) AS rushing_epa,

        SUM(targets) AS targets,
        SUM(receptions) AS receptions,
        SUM(receiving_yards) AS receiving_yards,
        SUM(receiving_touchdowns) AS receiving_tds,
        SUM(receiving_first_downs) AS receiving_first_downs,
        SUM(receiving_yards_after_catch) AS receiving_yac,
        SUM(receiving_epa) AS receiving_epa,

        SUM(fumbles) AS fumbles,
        SUM(fumbles_lost) AS fumbles_lost,

        COUNT(*) AS total_games
    FROM
        pgs
    WHERE
        is_division_game
),
calc_agg AS (
    SELECT
        -- Rushing
        ROUND(rushing_attempts / total_games, 1) AS rushing_attempts,
        ROUND(rushing_yards / rushing_attempts, 1) AS rushing_yards_per_attempt,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards,
        ROUND(rushing_tds / total_games, 2) AS rushing_tds,
        ROUND(rushing_epa / total_games, 2) AS rushing_epa,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs,

        -- Receiving
        ROUND(targets / total_games, 1) AS targets,
        ROUND(receptions / total_games, 1) AS receptions,
        ROUND(receiving_yards / NULLIF(receptions, 0), 1) AS yards_per_reception,
        ROUND(receiving_yards / total_games, 1) AS receiving_yards,
        ROUND(receiving_tds / total_games, 2) AS receiving_tds,
        ROUND(receiving_epa / total_games, 2) AS receiving_epa,
        ROUND(receiving_first_downs / total_games, 1) AS receiving_first_downs,
        ROUND(receiving_yac / NULLIF(receptions, 0), 1) AS yac_per_reception,
        ROUND(receptions / NULLIF(targets, 0), 2) AS catch_rate,

        -- Fumbles
        ROUND(fumbles / total_games, 2) AS fumbles_per_game,
        ROUND(fumbles_lost / total_games, 2) AS fumbles_lost
    FROM
        agg
    WHERE
        total_games > 0
),
calc_agg_home AS (
    SELECT
        -- Rushing
        ROUND(rushing_attempts / total_games, 1) AS rushing_attempts_home,
        ROUND(rushing_yards / rushing_attempts, 1) AS rushing_yards_per_attempt_home,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards_home,
        ROUND(rushing_tds / total_games, 2) AS rushing_tds_home,
        ROUND(rushing_epa / total_games, 2) AS rushing_epa_home,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs_home,

        -- Receiving
        ROUND(targets / total_games, 1) AS targets_home,
        ROUND(receptions / total_games, 1) AS receptions_home,
        ROUND(receiving_yards / NULLIF(receptions, 0), 1) AS yards_per_reception_home,
        ROUND(receiving_yards / total_games, 1) AS receiving_yards_home,
        ROUND(receiving_tds / total_games, 2) AS receiving_tds_home,
        ROUND(receiving_epa / total_games, 2) AS receiving_epa_home,
        ROUND(receiving_first_downs / total_games, 1) AS receiving_first_downs_home,
        ROUND(receiving_yac / NULLIF(receptions, 0), 1) AS yac_per_reception_home,
        ROUND(receptions / NULLIF(targets, 0), 2) AS catch_rate_home,

        ROUND(fumbles / total_games, 2) AS fumbles_per_game_home,
        ROUND(fumbles_lost / total_games, 2) AS fumbles_lost_home
    FROM
        agg_home
    WHERE
        total_games > 0
),
calc_agg_away AS (
    SELECT
        -- Rushing
        ROUND(rushing_attempts / total_games, 1) AS rushing_attempts_away,
        ROUND(rushing_yards / rushing_attempts, 1) AS rushing_yards_per_attempt_away,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards_away,
        ROUND(rushing_tds / total_games, 2) AS rushing_tds_away,
        ROUND(rushing_epa / total_games, 2) AS rushing_epa_away,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs_away,

        -- Receiving
        ROUND(targets / total_games, 1) AS targets_away,
        ROUND(receptions / total_games, 1) AS receptions_away,
        ROUND(receiving_yards / NULLIF(receptions, 0), 1) AS yards_per_reception_away,
        ROUND(receiving_yards / total_games, 1) AS receiving_yards_away,
        ROUND(receiving_tds / total_games, 2) AS receiving_tds_away,
        ROUND(receiving_epa / total_games, 2) AS receiving_epa_away,
        ROUND(receiving_first_downs / total_games, 1) AS receiving_first_downs_away,
        ROUND(receiving_yac / NULLIF(receptions, 0), 1) AS yac_per_reception_away,
        ROUND(receptions / NULLIF(targets, 0), 2) AS catch_rate_away,

        ROUND(fumbles / total_games, 2) AS fumbles_per_game_away,
        ROUND(fumbles_lost / total_games, 2) AS fumbles_lost_away
    FROM
        agg_away
    WHERE
        total_games > 0
),
calc_agg_division AS (
    SELECT
        -- Rushing
        ROUND(rushing_attempts / total_games, 1) AS rushing_attempts_division,
        ROUND(rushing_yards / rushing_attempts, 1) AS rushing_yards_per_attempt_division,
        ROUND(rushing_yards / total_games, 1) AS rushing_yards_division,
        ROUND(rushing_tds / total_games, 2) AS rushing_tds_division,
        ROUND(rushing_epa / total_games, 2) AS rushing_epa_division,
        ROUND(rushing_first_downs / total_games, 1) AS rushing_first_downs_division,

        -- Receiving
        ROUND(targets / total_games, 1) AS targets_division,
        ROUND(receptions / total_games, 1) AS receptions_division,
        ROUND(receiving_yards / NULLIF(receptions, 0), 1) AS yards_per_reception_division,
        ROUND(receiving_yards / total_games, 1) AS receiving_yards_division,
        ROUND(receiving_tds / total_games, 2) AS receiving_tds_division,
        ROUND(receiving_epa / total_games, 2) AS receiving_epa_division,
        ROUND(receiving_first_downs / total_games, 1) AS receiving_first_downs_division,
        ROUND(receiving_yac / NULLIF(receptions, 0), 1) AS yac_per_reception_division,
        ROUND(receptions / NULLIF(targets, 0), 2) AS catch_rate_division,

        ROUND(fumbles / total_games, 2) AS fumbles_per_game_division,
        ROUND(fumbles_lost / total_games, 2) AS fumbles_lost_division
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
    JOIN calc_agg_division