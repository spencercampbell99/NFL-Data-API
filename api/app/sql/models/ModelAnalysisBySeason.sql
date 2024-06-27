-- Purpose: Analyze the model's performance for a given season. May also provide additional filters such as weeks, teams, or minimum predicted spread
-- Parameters:
--     season: The season to analyze
--     weeks: The weeks to analyze (optional)
--     teams: The teams to analyze (optional)
--     min_spread: The minimum spread to analyze (optional)

WITH GameData AS (
    SELECT
        mp.id,
        sch.home_team_char_id,
        sch.away_team_char_id,
        CASE WHEN bs.home_team THEN bs.points_scored ELSE bs.points_allowed END AS home_score,
        CASE WHEN bs.home_team THEN bs.points_allowed ELSE bs.points_scored END AS away_score,
        mp.correct_winner,
        mp.correct_spread,
        mp.correct_over_under,
        mp.correct_underdog_win,
        sch.home_moneyline,
        sch.away_moneyline,
        sch.spread,
        ABS(sch.home_score - sch.away_score) AS total_error,
        (sch.home_score + sch.away_score) AS total_score,
        CASE
            WHEN sch.home_score > sch.away_score AND sch.home_moneyline < 0 THEN 100 / (ABS(sch.home_moneyline)) + 1
            WHEN sch.home_score < sch.away_score AND sch.away_moneyline < 0 THEN 100 / (ABS(sch.away_moneyline)) + 1
            WHEN sch.home_score > sch.away_score AND sch.home_moneyline > 0 THEN (sch.home_moneyline / 100) + 1
            WHEN sch.home_score < sch.away_score AND sch.away_moneyline > 0 THEN (sch.away_moneyline / 100) + 1
        END AS decimal_odds
    FROM
        model_predictions mp
    JOIN
        schedules sch ON mp.schedule_id = sch.id
    JOIN
        box_scores bs ON sch.id = bs.schedule_id
    WHERE
        sch.season = :season
        AND sch.game_type = 'REG'
        AND (:weeks IS NULL OR sch.week IN (:weeks))
        AND ABS(mp.away_team_score - mp.home_team_score) > :min_spread
        AND (:teams IS NULL OR sch.home_team_id IN (:teams) OR sch.away_team_id IN (:teams))
)
, Stats AS (
    SELECT
        COUNT(*) AS total_games,
        SUM(CASE WHEN correct_winner = true THEN 1 ELSE 0 END) AS correct_winner_count,
        SUM(CASE WHEN correct_spread = true THEN 1 ELSE 0 END) AS correct_spread_count,
        SUM(CASE WHEN correct_over_under = true THEN 1 ELSE 0 END) AS correct_over_under_count,
        SUM(total_error) AS total_error_sum,
        SUM(total_score) AS total_score_sum,
        AVG(total_error) AS avg_total_error,
        AVG(total_score) AS avg_total_score,
        SUM(CASE WHEN correct_winner = true THEN 1 ELSE 0 END) / COUNT(*) * 100 AS overall_correct_winner_rate,
        SUM(CASE WHEN (:teams IS NULL OR home_team_char_id IN (:teams)) AND correct_winner = true THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN (:teams IS NULL OR home_team_char_id IN (:teams)) THEN 1 ELSE 0 END), 0) * 100 AS home_correct_winner_rate,
        SUM(CASE WHEN (:teams IS NULL OR away_team_char_id IN (:teams)) AND correct_winner = true THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN (:teams IS NULL OR away_team_char_id IN (:teams)) THEN 1 ELSE 0 END), 0) * 100 AS away_correct_winner_rate,
        SUM(CASE WHEN correct_winner = true THEN decimal_odds * 1 ELSE 0 END) / (COUNT(*) * 1) * 100 - 100 AS total_return_rate_moneyline,
        SUM(CASE WHEN correct_over_under = true THEN 1.909 ELSE 0 END) / (COUNT(*)) * 100 - 100 AS total_return_over_under,
        SUM(CASE WHEN correct_spread = true THEN 1.909 ELSE 0 END) / (COUNT(*)) * 100 - 100 AS total_return_spread
    FROM
        GameData
)
SELECT
    total_games,
    correct_winner_count,
    correct_spread_count,
    correct_over_under_count,
    total_error_sum,
    total_score_sum,
    avg_total_error,
    avg_total_score,
    overall_correct_winner_rate,
    home_correct_winner_rate,
    away_correct_winner_rate,
    total_return_rate_moneyline,
    total_return_over_under,
    total_return_spread
FROM
    Stats;