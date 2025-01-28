import LeaguePositionAverages from "@/interfaces/leaguePositionAverages.interface";

interface PlayerSeasonStatAveragesQB {
    passer_rating: number;
    yards_per_attempt: number;
    yards_per_completion: number;
    air_yards_per_attempt: number;
    air_yards_per_completion: number;
    td_rate: number;
    completion_rate: number;
    yards_after_catch_per_completion: number;
    two_point_conversion_rate: number;
    passing_epa: number;
    passing_yards: number;
    passing_tds: number;
    interceptions: number;
    rushing_yards_per_attempt: number;
    rushing_yards: number;
    rushing_tds: number;
    rushing_epa: number;
    rushing_first_downs: number;
    passer_rating_home: number;
    yards_per_attempt_home: number;
    yards_per_completion_home: number;
    air_yards_per_attempt_home: number;
    air_yards_per_completion_home: number;
    td_rate_home: number;
    completion_rate_home: number;
    yards_after_catch_per_completion_home: number;
    passing_epa_home: number;
    passing_yards_home: number;
    passing_tds_home: number;
    interceptions_home: number;
    rushing_yards_per_attempt_home: number;
    rushing_yards_home: number;
    rushing_tds_home: number;
    rushing_epa_home: number;
    rushing_first_downs_home: number;
    passer_rating_away: number;
    yards_per_attempt_away: number;
    yards_per_completion_away: number;
    air_yards_per_attempt_away: number;
    air_yards_per_completion_away: number;
    td_rate_away: number;
    completion_rate_away: number;
    yards_after_catch_per_completion_away: number;
    passing_epa_away: number;
    passing_yards_away: number;
    passing_tds_away: number;
    interceptions_away: number;
    rushing_yards_per_attempt_away: number;
    rushing_yards_away: number;
    rushing_tds_away: number;
    rushing_epa_away: number;
    rushing_first_downs_away: number;
    passer_rating_division: number;
    yards_per_attempt_division: number;
    yards_per_completion_division: number;
    air_yards_per_attempt_division: number;
    air_yards_per_completion_division: number;
    td_rate_division: number;
    completion_rate_division: number;
    yards_after_catch_per_completion_division: number;
    passing_epa_division: number;
    passing_yards_division: number;
    passing_tds_division: number;
    interceptions_division: number;
    rushing_yards_per_attempt_division: number;
    rushing_yards_division: number;
    rushing_tds_division: number;
    rushing_epa_division: number;
    rushing_first_downs_division: number;
    league_position_averages: LeaguePositionAverages;
}

export type {
    PlayerSeasonStatAveragesQB
}