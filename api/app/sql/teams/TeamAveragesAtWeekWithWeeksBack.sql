-- Get team rolling averages for given season, week, team, and window
-- :season
-- :week
-- :teamId
-- :windowBack
-- :limit
-- :offense
-- :defense
WITH schedulesToCheck as (
	SELECT
	    id, home_team_id, away_team_id, home_score, away_score, season, week
	FROM
	    schedules
	WHERE
	    (
	        ((:windowBack + 1) >= :week AND (
	            (season = :season AND week <= :week) OR 
	            (season = :season - 1 AND week >= 18 + :week - (:windowBack + 1))
	        )) OR
	        ((:windowBack + 1) < :week AND (week <= :week and week >= :week - (:windowBack + 1) and season = :season))
	    )
	    AND (home_team_id = :teamId OR away_team_id = :teamId)
	    AND game_type = 'REG' 
	LIMIT :limit -- limit to only given week + x previous
),
allBoxscores AS (
	SELECT
		schedule_id,
		team_id,
		opponent_id,
		points_scored,
		points_allowed,
		home_team,
		first_downs,
		passing_first_downs,
		rushing_first_downs,
		third_down_conversions,
		third_down_attempts,
		fourth_down_conversions,
		fourth_down_attempts,
		red_zone_attempts,
		red_zone_scores,
		total_drives,
		total_offensive_yards,
		total_offensive_plays,
		passing_yards,
		passing_attempts,
		passing_completions,
		interceptions_thrown,
		passing_epa,
		sacks_allowed,
		qb_hits_allowed,
		rushing_yards,
		rushing_attempts,
		rushing_epa,
		receiving_epa,
		total_epa,
		penalty_yards_against,
		fumbles_lost,
		defense_special_teams_tds,
		defense_interceptions,
		defense_sacks,
		defense_tackles_for_loss,
		defense_forced_fumbles,
		defense_fumble_recoveries,
		defense_qb_hits,
		defense_tackles,
		
		rolling_offense_power_score,
		rolling_defense_power_score
	FROM
		box_scores
	WHERE
		schedule_id IN (SELECT id FROM schedulesToCheck WHERE week < :week OR season < :season)
),
teamBs as (
	SELECT
		*
	FROM
		allBoxscores
	WHERE
		team_id = :teamId
),
opponentsBs as (
	SELECT
		*
	FROM
		allBoxscores
	WHERE
		team_id != :teamId
)
SELECT
	AVG(tb.points_scored) AS avg_points_scored,
    AVG(tb.first_downs) AS avg_first_downs,
    AVG(tb.passing_first_downs) AS avg_passing_first_downs,
    AVG(tb.rushing_first_downs) AS avg_rushing_first_downs,
    AVG(tb.third_down_conversions) AS avg_third_down_conversions,
    AVG(tb.third_down_attempts) AS avg_third_down_attempts,
    AVG(tb.fourth_down_conversions) AS avg_fourth_down_conversions,
    AVG(tb.fourth_down_attempts) AS avg_fourth_down_attempts,
    AVG(tb.red_zone_attempts) AS avg_red_zone_attempts,
    AVG(tb.red_zone_scores) AS avg_red_zone_scores,
    AVG(tb.total_drives) AS avg_total_drives,
    AVG(tb.total_offensive_yards) AS avg_total_offensive_yards,
    AVG(tb.total_offensive_plays) AS avg_total_offensive_plays,
    AVG(tb.passing_yards) AS avg_passing_yards,
    AVG(tb.passing_attempts) AS avg_passing_attempts,
    AVG(tb.passing_completions) AS avg_passing_completions,
    AVG(tb.interceptions_thrown) AS avg_interceptions_thrown,
    AVG(tb.passing_epa) AS avg_passing_epa,
    AVG(tb.sacks_allowed) AS avg_sacks_allowed,
    AVG(tb.qb_hits_allowed) AS avg_qb_hits_allowed,
    AVG(tb.rushing_yards) AS avg_rushing_yards,
    AVG(tb.rushing_attempts) AS avg_rushing_attempts,
    AVG(tb.rushing_epa) AS avg_rushing_epa,
    AVG(tb.receiving_epa) AS avg_receiving_epa,
    AVG(tb.total_epa) AS avg_total_epa,
    AVG(tb.penalty_yards_against) AS avg_penalty_yards_against,
    AVG(tb.fumbles_lost) AS avg_fumbles_lost,
    CASE WHEN SUM(tb.passing_attempts) != 0 THEN SUM(tb.passing_yards) / SUM(tb.passing_attempts) ELSE 0 END AS avg_yards_per_pass_attempt,
    CASE WHEN SUM(tb.passing_completions) != 0 THEN SUM(tb.passing_yards) / SUM(tb.passing_completions) ELSE 0 END AS avg_yards_per_pass_completion,
    CASE WHEN SUM(tb.rushing_attempts) != 0 THEN SUM(tb.rushing_yards) / SUM(tb.rushing_attempts) ELSE 0 END AS avg_yards_per_rush_attempt,
	AVG(tb.rolling_offense_power_score) AS avg_rolling_offense_power_score,
    
    -- Defensive
	AVG(tb.points_allowed) AS avg_points_allowed,
	AVG(ob.penalty_yards_against) AS avg_penalty_yards_forced,
	AVG(ob.first_downs) AS avg_first_downs_allowed,
	AVG(ob.passing_first_downs) AS avg_passing_first_downs_allowed,
	AVG(ob.rushing_first_downs) AS avg_rushing_first_downs_allowed,
	AVG(ob.third_down_conversions) AS avg_third_down_conversions_allowed,
	AVG(ob.third_down_attempts) AS avg_third_down_attempts_allowed,
	AVG(ob.fourth_down_conversions) AS avg_fourth_down_conversions_allowed,
	AVG(ob.fourth_down_attempts) AS avg_fourth_down_attempts_allowed,
	AVG(ob.red_zone_attempts) AS avg_red_zone_attempts_allowed,
	AVG(ob.red_zone_scores) AS avg_red_zone_scores_allowed,
	AVG(ob.total_drives) AS avg_total_drives_allowed,
	AVG(ob.total_offensive_yards) AS avg_total_offensive_yards_allowed,
	AVG(ob.total_offensive_plays) AS avg_total_offensive_plays_allowed,
	AVG(ob.passing_yards) AS avg_passing_yards_allowed,
	AVG(ob.passing_attempts) AS avg_passing_attempts_allowed,
	AVG(ob.passing_completions) AS avg_passing_completions_allowed,
	AVG(ob.rushing_yards) AS avg_rushing_yards_allowed,
	AVG(ob.rushing_attempts) AS avg_rushing_attempts_allowed,
	AVG(ob.rushing_epa) AS avg_rushing_epa_allowed,
	AVG(ob.receiving_epa) AS avg_receiving_epa_allowed,
	AVG(ob.total_epa) AS avg_total_epa_allowed,
	AVG(tb.defense_special_teams_tds) AS avg_defense_special_teams_tds,
	AVG(tb.defense_interceptions) AS avg_defense_interceptions,
	AVG(tb.defense_sacks) AS avg_defense_sacks,
	AVG(tb.defense_tackles_for_loss) AS avg_defense_tackles_for_loss,
	AVG(tb.defense_forced_fumbles) AS avg_defense_forced_fumbles,
	AVG(tb.defense_fumble_recoveries) AS avg_defense_fumble_recoveries,
	AVG(tb.defense_qb_hits) AS avg_defense_qb_hits,
	AVG(tb.defense_tackles) AS avg_defense_tackles,
	AVG(tb.rolling_defense_power_score) AS avg_rolling_defense_power_score,
	CASE WHEN SUM(ob.passing_attempts) != 0 THEN SUM(ob.passing_yards) / SUM(ob.passing_attempts) ELSE 0 END AS avg_yards_per_pass_attempt_allowed,
	CASE WHEN SUM(ob.passing_completions) != 0 THEN SUM(ob.passing_yards) / SUM(ob.passing_completions) ELSE 0 END AS avg_yards_per_pass_completion_allowed,
	CASE WHEN SUM(ob.rushing_attempts) != 0 THEN SUM(ob.rushing_yards) / SUM(ob.rushing_attempts) ELSE 0 END AS avg_yards_per_rush_attempt_allowed
FROM
	teamBs tb
LEFT JOIN opponentsBs ob
	ON (
		tb.opponent_id = ob.team_id AND tb.schedule_id = ob.schedule_id
	)