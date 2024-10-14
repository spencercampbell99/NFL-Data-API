-- Pass params:
-- :start_season = 2019
-- :end_season = 2019
-- :weeks_back = 4
WITH season_weeks AS (
    -- Calculate the number of weeks per season
    SELECT 
        season, 
        MAX(week) AS max_week
    FROM 
        schedules
    WHERE 
        game_type = 'REG'
    GROUP BY 
        season
),
games AS (
	SELECT
		game.id as game_id, home_score, away_score, home_team_id, away_team_id, over_under, spread, home_moneyline, away_moneyline, season, week,
		CASE WHEN home_moneyline < away_moneyline THEN 1 ELSE 0 END as home_favorite,
		(SELECT COALESCE(SUM(sw.max_week), 0) FROM season_weeks sw WHERE sw.season < game.season) + game.week AS overall_week
	FROM
		schedules game
	WHERE
		game_type = 'REG' and (season <= :end_season AND season >= :start_season - 1)
),
all_boxscores as (
	SELECT
		bs.*,
		g.season,
		g.week,
		g.overall_week,
		ROW_NUMBER() OVER (PARTITION BY bs.team_id ORDER BY g.season, g.week) AS game_rank
	FROM
		box_scores bs
	JOIN games g on g.game_id = schedule_id
),
home_boxscores as (
	SELECT
		*
	FROM
		all_boxscores
	WHERE
		home_team = 1
),
away_boxscores as (
	SELECT
		*
	FROM
		all_boxscores
	WHERE
		home_team = 0
),
averaged_recent_stats as (
    SELECT
        curr.team_id AS team_id,
        curr.season,
        curr.week,
        curr.schedule_id AS game_id,
        
        -- Team's own stats (offensive performance)
        AVG(prev.points_scored) AS avg_points_scored,
        
        -- Downs and conversions
        AVG(prev.first_downs) AS avg_first_downs,
        AVG(prev.passing_first_downs) AS avg_passing_first_downs,
        AVG(prev.rushing_first_downs) AS avg_rushing_first_downs,
        AVG(prev.penalty_first_downs) AS avg_penalty_first_downs,
        AVG(prev.third_down_conversions) AS avg_third_down_conversions,
        AVG(prev.third_down_attempts) AS avg_third_down_attempts,
        AVG(prev.fourth_down_conversions) AS avg_fourth_down_conversions,
        AVG(prev.fourth_down_attempts) AS avg_fourth_down_attempts,
        AVG(prev.red_zone_attempts) AS avg_red_zone_attempts,
        AVG(prev.red_zone_scores) AS avg_red_zone_scores,

        -- Total yards and plays
        AVG(prev.total_drives) AS avg_total_drives,
        AVG(prev.total_offensive_plays) AS avg_total_offensive_plays,
        AVG(prev.total_offensive_yards) AS avg_total_offensive_yards,
        SUM(prev.total_offensive_yards) / SUM(prev.total_offensive_plays) as avg_yards_per_play,

        -- Passing stats
        AVG(prev.passing_yards) AS avg_passing_yards,
        AVG(prev.passing_attempts) AS avg_passing_attempts,
        AVG(prev.passing_completions) AS avg_passing_completions,
        SUM(prev.passing_yards) / SUM(prev.passing_attempts) AS avg_yards_per_pass_attempt,
        SUM(prev.passing_yards) / SUM(prev.passing_completions) AS avg_yards_per_pass_completion,
        AVG(prev.interceptions_thrown) AS avg_interceptions_thrown,
        AVG(prev.passing_epa) AS avg_passing_epa,

        -- O line/QB
        AVG(prev.sacks_allowed) AS avg_sacks_allowed,
        AVG(prev.sack_yards_lost) AS avg_sack_yards_lost,

        -- Rushing
        AVG(prev.rushing_yards) AS avg_rushing_yards,
        AVG(prev.rushing_attempts) AS avg_rushing_attempts,
        SUM(prev.rushing_yards) / SUM(prev.rushing_attempts) AS avg_yards_per_rush,
        AVG(prev.rushing_epa) AS avg_rushing_epa,

        -- Receiving EPA
        AVG(prev.receiving_epa) AS avg_receiving_epa,
        AVG(prev.total_epa) AS avg_total_epa,

        -- Penalties
        AVG(prev.team_total_penalties) AS avg_team_total_penalties,
        AVG(prev.penalty_yards_against) AS avg_penalty_yards_against,

        -- Offensive errors
        AVG(prev.turnovers) AS avg_turnovers,
        AVG(prev.fumbles_lost) AS avg_fumbles_lost,

        -- Defense and special teams
        AVG(prev.defense_special_teams_tds) AS avg_defense_special_teams_tds,

        -- Kicking stats
        AVG(prev.field_goals_made) AS avg_field_goals_made,
        AVG(prev.field_goals_attempted) AS avg_field_goals_attempted,
        AVG(prev.extra_points_made) AS avg_extra_points_made,
        AVG(prev.extra_points_attempted) AS avg_extra_points_attempted,
        AVG(prev.punts) AS avg_punts,
        AVG(prev.punt_yards) AS avg_punt_yards,
        AVG(prev.yards_per_punt) AS avg_yards_per_punt,
        AVG(prev.touchbacks) AS avg_touchbacks,
        AVG(prev.punts_inside_20) AS avg_punts_inside_20,
        
        -- Time of possession
        AVG(
		    (CONVERT(LEFT(prev.time_of_possession, 2), UNSIGNED INTEGER) * 60)  -- Extract minutes and convert to seconds
		    + CONVERT(RIGHT(prev.time_of_possession, 2), UNSIGNED INTEGER)      -- Extract seconds
		) AS avg_time_of_possession_in_seconds
    FROM
        all_boxscores curr
    JOIN
        all_boxscores prev ON 
            curr.team_id = prev.team_id
            AND prev.game_rank < curr.game_rank
            AND prev.game_rank >= curr.game_rank - :weeks_back 
    WHERE
        curr.season = :start_season
    GROUP BY
        curr.team_id, curr.season, curr.week, curr.schedule_id
),
averaged_recent_defensive_stats as (
    SELECT
        curr.team_id AS team_id,
        curr.season,
        curr.week,
        curr.schedule_id AS game_id,

        -- Opponent's stats (defensive performance metrics)
        AVG(opp.points_scored) AS avg_points_allowed,

        -- Opponent downs and conversions
        AVG(opp.first_downs) AS avg_first_downs_allowed,
        AVG(opp.passing_first_downs) AS avg_passing_first_downs_allowed,
        AVG(opp.rushing_first_downs) AS avg_rushing_first_downs_allowed,
        AVG(opp.penalty_first_downs) AS avg_penalty_first_downs_allowed,
        AVG(opp.third_down_conversions) AS avg_third_down_conversions_allowed,
        AVG(opp.third_down_attempts) AS avg_third_down_attempts_allowed,
        AVG(opp.fourth_down_conversions) AS avg_fourth_down_conversions_allowed,
        AVG(opp.fourth_down_attempts) AS avg_fourth_down_attempts_allowed,
        AVG(opp.red_zone_attempts) AS avg_red_zone_attempts_allowed,
        AVG(opp.red_zone_scores) AS avg_red_zone_scores_allowed,

        -- Opponent total yards and plays
        AVG(opp.total_drives) AS avg_total_drives_allowed,
        AVG(opp.total_offensive_plays) AS avg_total_offensive_plays_allowed,
        AVG(opp.total_offensive_yards) AS avg_total_offensive_yards_allowed,
        SUM(opp.total_offensive_yards) / SUM(opp.total_offensive_plays) as avg_yards_per_play_allowed,

        -- Opponent passing stats
        AVG(opp.passing_yards) AS avg_passing_yards_allowed,
        AVG(opp.passing_attempts) AS avg_passing_attempts_allowed,
        AVG(opp.passing_completions) AS avg_passing_completions_allowed,
        SUM(opp.passing_yards) / SUM(opp.passing_attempts)  AS avg_yards_per_pass_attempt_allowed,
        SUM(opp.passing_yards) / SUM(opp.passing_completions) AS avg_yards_per_pass_completion_allowed,
        AVG(opp.interceptions_thrown) AS avg_interceptions_forced,
        AVG(opp.passing_epa) AS avg_passing_epa_allowed,

        -- Opponent rushing
        AVG(opp.rushing_yards) AS avg_rushing_yards_allowed,
        AVG(opp.rushing_attempts) AS avg_rushing_attempts_allowed,
        SUM(opp.rushing_yards) / SUM(opp.rushing_attempts) AS avg_yards_per_rush_allowed,
        AVG(opp.rushing_epa) AS avg_rushing_epa_allowed,

        -- Penalties
        AVG(opp.team_total_penalties) AS avg_penalties_forced,
        AVG(opp.penalty_yards_against) AS avg_penalty_yards_forced,

        -- Kicking stats (if relevant to defense)
        AVG(opp.field_goals_made) AS avg_field_goals_allowed,
        AVG(opp.field_goals_attempted) AS avg_field_goals_attempted_against,
        AVG(opp.punts) AS avg_punts_forced,
        AVG(opp.punt_yards) AS avg_punt_yards_forced
    FROM
        all_boxscores curr
    JOIN
        all_boxscores opp
        ON curr.team_id = opp.opponent_id -- Link the opponent's box score
        AND opp.schedule_id IN (SELECT distinct schedule_id FROM all_boxscores abxs WHERE abxs.game_rank < curr.game_rank AND abxs.game_rank >= curr.game_rank - :weeks_back)
    WHERE
        curr.season = :start_season
    GROUP BY
        curr.team_id, curr.season, curr.week, curr.schedule_id
)
SELECT
    -- Game Columns
    g.game_id,
    g.home_team_id,
    g.away_team_id,
    g.home_score,
    g.away_score,
    g.over_under,
    g.spread,
    g.home_moneyline,
    g.away_moneyline,
    g.season,
    g.week,
    g.overall_week,
    g.home_favorite,
    CASE WHEN home_favorite = 1 THEN g.home_moneyline ELSE g.away_moneyline END as favorite_moneyline,
    CASE WHEN g.home_favorite = 1 THEN CASE WHEN g.home_score > g.away_score THEN 1 ELSE 0 END ELSE CASE WHEN g.away_score > g.home_score THEN 1 ELSE 0 END END as favorite_win,

    -- Home team offensive averaged recent stats
    ars_home.avg_points_scored AS home_avg_points_scored,
    ars_home.avg_first_downs AS home_avg_first_downs,
    ars_home.avg_passing_first_downs AS home_avg_passing_first_downs,
    ars_home.avg_rushing_first_downs AS home_avg_rushing_first_downs,
    ars_home.avg_penalty_first_downs AS home_avg_penalty_first_downs,
    ars_home.avg_third_down_conversions AS home_avg_third_down_conversions,
    ars_home.avg_third_down_attempts AS home_avg_third_down_attempts,
    ars_home.avg_fourth_down_conversions AS home_avg_fourth_down_conversions,
    ars_home.avg_fourth_down_attempts AS home_avg_fourth_down_attempts,
    ars_home.avg_red_zone_attempts AS home_avg_red_zone_attempts,
    ars_home.avg_red_zone_scores AS home_avg_red_zone_scores,
    ars_home.avg_total_drives AS home_avg_total_drives,
    ars_home.avg_total_offensive_plays AS home_avg_total_offensive_plays,
    ars_home.avg_total_offensive_yards AS home_avg_total_offensive_yards,
    ars_home.avg_yards_per_play AS home_avg_yards_per_play,
    ars_home.avg_passing_yards AS home_avg_passing_yards,
    ars_home.avg_passing_attempts AS home_avg_passing_attempts,
    ars_home.avg_passing_completions AS home_avg_passing_completions,
    ars_home.avg_yards_per_pass_attempt AS home_avg_yards_per_pass_attempt,
    ars_home.avg_yards_per_pass_completion AS home_avg_yards_per_pass_completion,
    ars_home.avg_interceptions_thrown AS home_avg_interceptions_thrown,
    ars_home.avg_passing_epa AS home_avg_passing_epa,
    ars_home.avg_sacks_allowed AS home_avg_sacks_allowed,
    ars_home.avg_sack_yards_lost AS home_avg_sack_yards_lost,
    ars_home.avg_rushing_yards AS home_avg_rushing_yards,
    ars_home.avg_rushing_attempts AS home_avg_rushing_attempts,
    ars_home.avg_yards_per_rush AS home_avg_yards_per_rush,
    ars_home.avg_rushing_epa AS home_avg_rushing_epa,
    ars_home.avg_receiving_epa AS home_avg_receiving_epa,
    ars_home.avg_total_epa AS home_avg_total_epa,
    ars_home.avg_team_total_penalties AS home_avg_team_total_penalties,
    ars_home.avg_penalty_yards_against AS home_avg_penalty_yards_against,
    ars_home.avg_turnovers AS home_avg_turnovers,
    ars_home.avg_fumbles_lost AS home_avg_fumbles_lost,
    ars_home.avg_defense_special_teams_tds AS home_avg_defense_special_teams_tds,
    ars_home.avg_field_goals_made AS home_avg_field_goals_made,
    ars_home.avg_field_goals_attempted AS home_avg_field_goals_attempted,
    ars_home.avg_extra_points_made AS home_avg_extra_points_made,
    ars_home.avg_extra_points_attempted AS home_avg_extra_points_attempted,
    ars_home.avg_punts AS home_avg_punts,
    ars_home.avg_punt_yards AS home_avg_punt_yards,
    ars_home.avg_yards_per_punt AS home_avg_yards_per_punt,
    ars_home.avg_touchbacks AS home_avg_touchbacks,
    ars_home.avg_punts_inside_20 AS home_avg_punts_inside_20,
    ars_home.avg_time_of_possession_in_seconds AS home_avg_time_of_possession_in_seconds,

    -- Home team defensive averaged recent stats
    ards_home.avg_points_allowed AS home_avg_points_allowed,
    ards_home.avg_first_downs_allowed AS home_avg_first_downs_allowed,
    ards_home.avg_passing_first_downs_allowed AS home_avg_passing_first_downs_allowed,
    ards_home.avg_rushing_first_downs_allowed AS home_avg_rushing_first_downs_allowed,
    ards_home.avg_penalty_first_downs_allowed AS home_avg_penalty_first_downs_allowed,
    ards_home.avg_third_down_conversions_allowed AS home_avg_third_down_conversions_allowed,
    ards_home.avg_third_down_attempts_allowed AS home_avg_third_down_attempts_allowed,
    ards_home.avg_fourth_down_conversions_allowed AS home_avg_fourth_down_conversions_allowed,
    ards_home.avg_fourth_down_attempts_allowed AS home_avg_fourth_down_attempts_allowed,
    ards_home.avg_red_zone_attempts_allowed AS home_avg_red_zone_attempts_allowed,
    ards_home.avg_red_zone_scores_allowed AS home_avg_red_zone_scores_allowed,
    ards_home.avg_total_drives_allowed AS home_avg_total_drives_allowed,
    ards_home.avg_total_offensive_plays_allowed AS home_avg_total_offensive_plays_allowed,
    ards_home.avg_total_offensive_yards_allowed AS home_avg_total_offensive_yards_allowed,
    ards_home.avg_yards_per_play_allowed AS home_avg_yards_per_play_allowed,
    ards_home.avg_passing_yards_allowed AS home_avg_passing_yards_allowed,
    ards_home.avg_passing_attempts_allowed AS home_avg_passing_attempts_allowed,
    ards_home.avg_passing_completions_allowed AS home_avg_passing_completions_allowed,
    ards_home.avg_yards_per_pass_attempt_allowed AS home_avg_yards_per_pass_attempt_allowed,
    ards_home.avg_yards_per_pass_completion_allowed AS home_avg_yards_per_pass_completion_allowed,
    ards_home.avg_interceptions_forced AS home_avg_interceptions_forced,
    ards_home.avg_passing_epa_allowed AS home_avg_passing_epa_allowed,
    ards_home.avg_rushing_yards_allowed AS home_avg_rushing_yards_allowed,
    ards_home.avg_rushing_attempts_allowed AS home_avg_rushing_attempts_allowed,
    ards_home.avg_yards_per_rush_allowed AS home_avg_yards_per_rush_allowed,
    ards_home.avg_rushing_epa_allowed AS home_avg_rushing_epa_allowed,
    ards_home.avg_penalties_forced AS home_avg_penalties_forced,
    ards_home.avg_penalty_yards_forced AS home_avg_penalty_yards_forced,
    ards_home.avg_field_goals_allowed AS home_avg_field_goals_allowed,
    ards_home.avg_field_goals_attempted_against AS home_avg_field_goals_attempted_against,
    ards_home.avg_punts_forced AS home_avg_punts_forced,
    ards_home.avg_punt_yards_forced AS home_avg_punt_yards_forced,

    -- Away team offensive averaged recent stats
    ars_away.avg_points_scored AS away_avg_points_scored,
    ars_away.avg_first_downs AS away_avg_first_downs,
    ars_away.avg_passing_first_downs AS away_avg_passing_first_downs,
    ars_away.avg_rushing_first_downs AS away_avg_rushing_first_downs,
    ars_away.avg_penalty_first_downs AS away_avg_penalty_first_downs,
    ars_away.avg_third_down_conversions AS away_avg_third_down_conversions,
    ars_away.avg_third_down_attempts AS away_avg_third_down_attempts,
    ars_away.avg_fourth_down_conversions AS away_avg_fourth_down_conversions,
    ars_away.avg_fourth_down_attempts AS away_avg_fourth_down_attempts,
    ars_away.avg_red_zone_attempts AS away_avg_red_zone_attempts,
    ars_away.avg_red_zone_scores AS away_avg_red_zone_scores,
    ars_away.avg_total_drives AS away_avg_total_drives,
    ars_away.avg_total_offensive_plays AS away_avg_total_offensive_plays,
    ars_away.avg_total_offensive_yards AS away_avg_total_offensive_yards,
    ars_away.avg_yards_per_play AS away_avg_yards_per_play,
    ars_away.avg_passing_yards AS away_avg_passing_yards,
    ars_away.avg_passing_attempts AS away_avg_passing_attempts,
    ars_away.avg_passing_completions AS away_avg_passing_completions,
    ars_away.avg_yards_per_pass_attempt AS away_avg_yards_per_pass_attempt,
    ars_away.avg_yards_per_pass_completion AS away_avg_yards_per_pass_completion,
    ars_away.avg_interceptions_thrown AS away_avg_interceptions_thrown,
    ars_away.avg_passing_epa AS away_avg_passing_epa,
    ars_away.avg_sacks_allowed AS away_avg_sacks_allowed,
    ars_away.avg_sack_yards_lost AS away_avg_sack_yards_lost,
    ars_away.avg_rushing_yards AS away_avg_rushing_yards,
    ars_away.avg_rushing_attempts AS away_avg_rushing_attempts,
    ars_away.avg_yards_per_rush AS away_avg_yards_per_rush,
    ars_away.avg_rushing_epa AS away_avg_rushing_epa,
    ars_away.avg_receiving_epa AS away_avg_receiving_epa,
    ars_away.avg_total_epa AS away_avg_total_epa,
    ars_away.avg_team_total_penalties AS away_avg_team_total_penalties,
    ars_away.avg_penalty_yards_against AS away_avg_penalty_yards_against,
    ars_away.avg_turnovers AS away_avg_turnovers,
    ars_away.avg_fumbles_lost AS away_avg_fumbles_lost,
    ars_away.avg_defense_special_teams_tds AS away_avg_defense_special_teams_tds,
    ars_away.avg_field_goals_made AS away_avg_field_goals_made,
    ars_away.avg_field_goals_attempted AS away_avg_field_goals_attempted,
    ars_away.avg_extra_points_made AS away_avg_extra_points_made,
    ars_away.avg_extra_points_attempted AS away_avg_extra_points_attempted,
    ars_away.avg_punts AS away_avg_punts,
    ars_away.avg_punt_yards AS away_avg_punt_yards,
    ars_away.avg_yards_per_punt AS away_avg_yards_per_punt,
    ars_away.avg_touchbacks AS away_avg_touchbacks,
    ars_away.avg_punts_inside_20 AS away_avg_punts_inside_20,
    ars_away.avg_time_of_possession_in_seconds AS away_avg_time_of_possession_in_seconds,

    -- Away team defensive averaged recent stats
    ards_away.avg_points_allowed AS away_avg_points_allowed,
    ards_away.avg_first_downs_allowed AS away_avg_first_downs_allowed,
    ards_away.avg_passing_first_downs_allowed AS away_avg_passing_first_downs_allowed,
    ards_away.avg_rushing_first_downs_allowed AS away_avg_rushing_first_downs_allowed,
    ards_away.avg_penalty_first_downs_allowed AS away_avg_penalty_first_downs_allowed,
    ards_away.avg_third_down_conversions_allowed AS away_avg_third_down_conversions_allowed,
    ards_away.avg_third_down_attempts_allowed AS away_avg_third_down_attempts_allowed,
    ards_away.avg_fourth_down_conversions_allowed AS away_avg_fourth_down_conversions_allowed,
    ards_away.avg_fourth_down_attempts_allowed AS away_avg_fourth_down_attempts_allowed,
    ards_away.avg_red_zone_attempts_allowed AS away_avg_red_zone_attempts_allowed,
    ards_away.avg_red_zone_scores_allowed AS away_avg_red_zone_scores_allowed,
    ards_away.avg_total_drives_allowed AS away_avg_total_drives_allowed,
    ards_away.avg_total_offensive_plays_allowed AS away_avg_total_offensive_plays_allowed,
    ards_away.avg_total_offensive_yards_allowed AS away_avg_total_offensive_yards_allowed,
    ards_away.avg_yards_per_play_allowed AS away_avg_yards_per_play_allowed,
    ards_away.avg_passing_yards_allowed AS away_avg_passing_yards_allowed,
    ards_away.avg_passing_attempts_allowed AS away_avg_passing_attempts_allowed,
    ards_away.avg_passing_completions_allowed AS away_avg_passing_completions_allowed,
    ards_away.avg_yards_per_pass_attempt_allowed AS away_avg_yards_per_pass_attempt_allowed,
    ards_away.avg_yards_per_pass_completion_allowed AS away_avg_yards_per_pass_completion_allowed,
    ards_away.avg_interceptions_forced AS away_avg_interceptions_forced,
    ards_away.avg_passing_epa_allowed AS away_avg_passing_epa_allowed,
    ards_away.avg_rushing_yards_allowed AS away_avg_rushing_yards_allowed,
    ards_away.avg_rushing_attempts_allowed AS away_avg_rushing_attempts_allowed,
    ards_away.avg_yards_per_rush_allowed AS away_avg_yards_per_rush_allowed,
    ards_away.avg_rushing_epa_allowed AS away_avg_rushing_epa_allowed,
    ards_away.avg_penalties_forced AS away_avg_penalties_forced,
    ards_away.avg_penalty_yards_forced AS away_avg_penalty_yards_forced,
    ards_away.avg_field_goals_allowed AS away_avg_field_goals_allowed,
    ards_away.avg_field_goals_attempted_against AS away_avg_field_goals_attempted_against,
    ards_away.avg_punts_forced AS away_avg_punts_forced,
    ards_away.avg_punt_yards_forced AS away_avg_punt_yards_forced
FROM
	games g
JOIN averaged_recent_stats ars_home ON ars_home.game_id = g.game_id AND ars_home.team_id = g.home_team_id
JOIN averaged_recent_defensive_stats ards_home ON ards_home.game_id = g.game_id AND ards_home.team_id = g.home_team_id
JOIN averaged_recent_stats ars_away ON ars_away.game_id = g.game_id AND ars_away.team_id = g.away_team_id
JOIN averaged_recent_defensive_stats ards_away ON ards_away.game_id = g.game_id AND ards_away.team_id = g.away_team_id
WHERE
	g.season = :start_season
ORDER BY g.season ASC, g.week ASC