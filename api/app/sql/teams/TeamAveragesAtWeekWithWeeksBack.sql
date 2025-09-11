-- Get team rolling averages for given season, week, team, and window
-- :season
-- :week
-- :teamId
-- :windowBack
-- :limit
-- :offense
-- :defense
WITH teamSchedulesToCheck as (
	SELECT
	    id, home_team_id, away_team_id, home_score, away_score, season, week
	FROM
	    schedules
	WHERE
		((season = :season AND week <= :week) OR (season < :season AND season >= :season - 2))
	    AND game_type = 'REG'
		AND (home_team_id = :teamId OR away_team_id = :teamId)
	ORDER BY season DESC, week DESC
	LIMIT :limit -- limit to only given week + x previous
),
weekOpponentId as (
	SELECT
		CASE WHEN home_team_id = :teamId THEN away_team_id ELSE home_team_id END AS opponent_id
	FROM
		teamSchedulesToCheck
	WHERE
		season = :season AND week = :week
	ORDER BY season DESC, week DESC
	LIMIT 1
),
oppSchedulesToCheck as (
	SELECT
		*
	FROM
		schedules
	WHERE
		((season = :season AND week <= :week) OR (season < :season AND season >= :season - 2))
		AND (home_team_id = (SELECT opponent_id FROM weekOpponentId) OR away_team_id = (SELECT opponent_id FROM weekOpponentId))
		AND game_type = 'REG'
	ORDER BY season DESC, week DESC
	LIMIT :limit -- limit to only given week + x previous
),
allBoxscores AS (
	SELECT
		s.season as season,
		s.week as week,
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
	JOIN schedules s ON s.id = box_scores.schedule_id
	WHERE
		(schedule_id IN (SELECT id FROM teamSchedulesToCheck)
		OR (schedule_id IN (SELECT id FROM oppSchedulesToCheck) AND (team_id = (SELECT opponent_id FROM weekOpponentId) OR opponent_id = (SELECT opponent_id FROM weekOpponentId))))
		AND points_scored IS NOT NULL
	ORDER BY s.season DESC, s.week DESC
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
		ob.season, ob.week,
        ob.schedule_id,
        ob.team_id,       -- opponent team (to join with tb.opponent_id)
        ob.opponent_id,   -- the opponent's opponent (the offense we use for "allowed" stats)

        -- Allowed (use opponent’s opponents' offense)
        off.first_downs,
        off.passing_first_downs,
        off.rushing_first_downs,
        off.third_down_conversions,
        off.third_down_attempts,
        off.fourth_down_conversions,
        off.fourth_down_attempts,
        off.red_zone_attempts,
        off.red_zone_scores,
        off.total_drives,
        off.total_offensive_yards,
        off.total_offensive_plays,
        off.passing_yards,
        off.passing_attempts,
        off.passing_completions,
        off.passing_epa,
        off.rushing_yards,
        off.rushing_attempts,
        off.rushing_epa,
        off.receiving_epa,
        off.total_epa,

        -- Opponent defense (kept from opponent’s row)
        ob.defense_interceptions,
        ob.defense_sacks,
        ob.defense_qb_hits,
        ob.defense_forced_fumbles,
        ob.defense_fumble_recoveries,
        ob.defense_special_teams_tds,
        ob.defense_tackles_for_loss,
        ob.defense_tackles,
        ob.penalty_yards_against,
		ob.points_allowed,
		ob.rolling_defense_power_score
    FROM
        allBoxscores ob
        JOIN box_scores off
            ON off.schedule_id = ob.schedule_id
            AND off.team_id = ob.opponent_id
            AND off.opponent_id = ob.team_id
    WHERE
        ob.team_id = (SELECT opponent_id FROM weekOpponentId)
        AND ob.schedule_id IN (
            SELECT id FROM oppSchedulesToCheck WHERE week < :week OR season < :season
        )
), teamBsOrdered AS (
  SELECT
    tb.*,
    ROW_NUMBER() OVER (ORDER BY season DESC, week DESC, schedule_id DESC) AS rn
  FROM teamBs tb
),
opponentsBsOrdered AS (
  SELECT
    ob.*,
    ROW_NUMBER() OVER (ORDER BY season DESC, week DESC, schedule_id DESC) AS rn
  FROM opponentsBs ob
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
    AVG(tb.sacks_allowed) AS avg_sacks_suffered,
    AVG(tb.qb_hits_allowed) AS avg_qb_hits_suffered,
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
    AVG(tb.rolling_offense_power_score) AS avg_offense_power_score,
    
    -- Defensive (allowed from off, defense_* from ob)
    AVG(ob.points_allowed) AS avg_points_allowed,
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
    AVG(ob.defense_interceptions) AS avg_defense_interceptions,
    AVG(ob.passing_epa) AS avg_passing_epa_allowed,
    AVG(ob.defense_sacks) AS avg_defense_sacks,
    AVG(ob.defense_qb_hits) AS avg_defense_qb_hits,
    AVG(ob.rushing_yards) AS avg_rushing_yards_allowed,
    AVG(ob.rushing_attempts) AS avg_rushing_attempts_allowed,
    AVG(ob.rushing_epa) AS avg_rushing_epa_allowed,
    AVG(ob.receiving_epa) AS avg_receiving_epa_allowed,
    AVG(ob.total_epa) AS avg_total_epa_allowed,
    AVG(ob.penalty_yards_against) AS avg_defense_penalties_against,
    AVG(ob.defense_forced_fumbles) AS avg_defense_forced_fumbles,
    CASE WHEN SUM(ob.passing_attempts) != 0 THEN SUM(ob.passing_yards) / SUM(ob.passing_attempts) ELSE 0 END AS avg_yards_per_pass_attempt_allowed,
    CASE WHEN SUM(ob.passing_completions) != 0 THEN SUM(ob.passing_yards) / SUM(ob.passing_completions) ELSE 0 END AS avg_yards_per_pass_completion_allowed,
    CASE WHEN SUM(ob.rushing_attempts) != 0 THEN SUM(ob.rushing_yards) / SUM(ob.rushing_attempts) ELSE 0 END AS avg_yards_per_rush_attempt_allowed,
    AVG(ob.rolling_defense_power_score) AS avg_defense_power_score,
    AVG(ob.defense_fumble_recoveries) AS avg_defense_fumble_recoveries,
    AVG(ob.defense_special_teams_tds) AS avg_defense_special_teams_tds,
    AVG(ob.defense_tackles_for_loss) AS avg_defense_tackles_for_loss,
    AVG(ob.defense_tackles) AS avg_defense_tackles
FROM teamBsOrdered tb
JOIN opponentsBsOrdered ob
  ON tb.rn = ob.rn