-- Purpose: Analyze the model's performance for a given season. May also provide additional filters such as weeks, teams, or minimum predicted spread
-- Parameters:
--     season: The season to analyze
--     weeks: The weeks to analyze (optional)
--     teams: The teams to analyze (optional)
--     min_spread: The minimum spread to analyze (optional)

WITH GameData AS (
    SELECT
        mp.id,
        sch.week,
        sch.home_team_char_id,
        sch.away_team_char_id,
        sch.home_score > sch.away_score AS home_win,
        mp.home_team_score > mp.away_team_score AS predicted_home_win,
        sch.home_score,
        sch.away_score,
        mp.correct_winner,
        mp.correct_spread,
        mp.correct_over_under,
        mp.correct_underdog_win,
        sch.home_moneyline,
        sch.away_moneyline,
        sch.spread,
        ABS(mp.home_team_score + mp.away_team_score - sch.home_score - sch.away_score) AS total_error,
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
    WHERE
        sch.season = :season
        AND sch.game_type = 'REG'
        AND (:weeks IS NULL OR sch.week IN (:weeks))
        AND ABS(mp.away_team_score - mp.home_team_score) >= :min_spread
        AND (:teams IS NULL OR sch.home_team_id IN (:teams) OR sch.away_team_id IN (:teams))
), Stats AS (
    SELECT
        COUNT(*) AS total_games,
        COUNT(DISTINCT week) AS total_weeks,
        SUM(CASE WHEN correct_winner = true THEN 1 ELSE 0 END) AS correct_winner_count,
        SUM(CASE WHEN correct_spread = true THEN 1 ELSE 0 END) AS correct_spread_count,
        SUM(CASE WHEN correct_over_under = true THEN 1 ELSE 0 END) AS correct_over_under_count,
        SUM(total_error) AS total_error_sum,
        SUM(total_score) AS total_score_sum,
        AVG(total_error) AS avg_total_error,
        AVG(total_score) AS avg_total_score,
        SUM(CASE WHEN correct_winner = true THEN 1 ELSE 0 END) / COUNT(*) * 100 AS overall_correct_winner_rate,
        SUM(CASE WHEN (:teams IS NULL OR home_team_char_id IN (:teams)) AND correct_winner = true AND home_win = true THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN (:teams IS NULL OR home_team_char_id IN (:teams)) AND predicted_home_win = true THEN 1 ELSE 0 END), 0) * 100 AS home_correct_winner_rate,
        SUM(CASE WHEN (:teams IS NULL OR away_team_char_id IN (:teams)) AND correct_winner = true AND home_win = false THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN (:teams IS NULL OR away_team_char_id IN (:teams)) AND predicted_home_win = false THEN 1 ELSE 0 END), 0) * 100 AS away_correct_winner_rate,
        SUM(CASE WHEN correct_winner = true THEN decimal_odds * 1 ELSE 0 END) / (COUNT(*) * 1) * 100 - 100 AS total_return_rate_moneyline,
        SUM(CASE WHEN correct_over_under = true THEN 1.909 ELSE 0 END) / (COUNT(*)) * 100 - 100 AS total_return_over_under,
        SUM(CASE WHEN correct_spread = true THEN 1.909 ELSE 0 END) / (COUNT(*)) * 100 - 100 AS total_return_spread
    FROM
        GameData
), ROI_Calculations AS (
    SELECT
        week,
        (SUM(CASE WHEN correct_winner = true THEN decimal_odds ELSE 0 END) / COUNT(*)) * 100 - 100 AS roi_per_week_moneyline,
        (SUM(CASE WHEN correct_over_under = true THEN 1.909 ELSE 0 END) / COUNT(*)) * 100 - 100 AS roi_per_week_over_under,
        (SUM(CASE WHEN correct_spread = true THEN 1.909 ELSE 0 END) / COUNT(*)) * 100 - 100 AS roi_per_week_spread
    FROM
        GameData
    GROUP BY
        week
    ORDER BY
        week
)
SELECT
    s.total_games,
    s.total_weeks,
    s.correct_winner_count,
    s.correct_spread_count,
    s.correct_over_under_count,
    s.total_error_sum,
    s.total_score_sum,
    s.avg_total_error,
    s.avg_total_score,
    s.overall_correct_winner_rate,
    s.home_correct_winner_rate,
    s.away_correct_winner_rate,
    s.total_return_rate_moneyline,
    s.total_return_over_under,
    s.total_return_spread,
    GROUP_CONCAT(r.week ORDER BY r.week) AS weeks,
    GROUP_CONCAT(r.roi_per_week_moneyline ORDER BY r.week) AS roi_per_week_moneyline,
    GROUP_CONCAT(r.roi_per_week_over_under ORDER BY r.week) AS roi_per_week_over_under,
    GROUP_CONCAT(r.roi_per_week_spread ORDER BY r.week) AS roi_per_week_spread
FROM
    Stats s
JOIN
    ROI_Calculations r ON true
GROUP BY
    s.total_games,
    s.total_weeks,
    s.correct_winner_count,
    s.correct_spread_count,
    s.correct_over_under_count,
    s.total_error_sum,
    s.total_score_sum,
    s.avg_total_error,
    s.avg_total_score,
    s.overall_correct_winner_rate,
    s.home_correct_winner_rate,
    s.away_correct_winner_rate,
    s.total_return_rate_moneyline,
    s.total_return_over_under,
    s.total_return_spread;
