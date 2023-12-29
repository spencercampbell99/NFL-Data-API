WITH RankedGames AS (
    SELECT
        team.passing_first_downs as team_passing_first_downs,
        team.rushing_first_downs AS team_rushing_first_downs,
        team.third_down_conversions AS team_third_down_conversions,
        team.red_zone_attempts AS team_red_zone_attempts,
        team.passing_yards AS team_passing_yards,
        team.yards_per_pass_attempt AS team_yards_per_pass_attempt,
        team.sacks_allowed AS team_sacks_allowed,
        team.sack_yards_lost AS team_sack_yards_lost,
        team.rushing_yards AS team_rushing_yards,
        team.rushing_attempts AS team_rushing_attempts,
        team.turnovers AS team_turnovers,
        team.punts AS team_punts,
        opp.rushing_attempts AS opp_rushing_attempts,
        opp.defense_special_teams_qb_hits AS opp_defense_special_teams_qb_hits,
        ROW_NUMBER() OVER (PARTITION BY team.team_id ORDER BY season DESC, week DESC) AS `rank`
    FROM
        box_scores team
    JOIN schedules on schedules.id = team.schedule_id
    JOIN box_scores opp on opp.schedule_id = schedules.id AND opp.team_id != team.team_id
    WHERE
        (season < :season OR (season = :season AND week < :week)) AND team.team_id = :team_id
    LIMIT :weeks_back
)
SELECT 
    AVG(team_passing_first_downs) AS passing_first_downs,
    AVG(team_rushing_first_downs) AS rushing_first_downs,
    AVG(team_third_down_conversions) AS third_down_conversions,
    AVG(team_red_zone_attempts) AS red_zone_attempts,
    AVG(team_passing_yards) AS passing_yards,
    AVG(team_yards_per_pass_attempt) AS yards_per_pass_attempt,
    AVG(team_sacks_allowed) AS sacks_allowed,
    AVG(team_sack_yards_lost) AS sack_yards_lost,
    AVG(team_rushing_yards) AS rushing_yards,
    AVG(team_rushing_attempts) AS rushing_attempts,
    AVG(team_turnovers) AS turnovers,
    AVG(team_punts) AS punts,
    AVG(opp_rushing_attempts) AS rushing_attempts_allowed,
    AVG(opp_defense_special_teams_qb_hits) AS defense_special_teams_qb_hits_allowed
FROM RankedGames
WHERE `rank` <= :weeks_back