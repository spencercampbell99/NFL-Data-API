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
    fumbles_lost: number;
    total_sacks: number;

    // Home
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
    fumbles_lost_home: number;
    total_sacks_home: number;

    // Away
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
    fumbles_lost_away: number;
    total_sacks_away: number;

    // Division
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
    fumbles_lost_division: number;
    total_sacks_division: number;

    league_position_averages: LeaguePositionAverages;
}

interface PlayerSeasonStatAveragesRB {
    rushing_yards: number;
    rushing_tds: number;
    rushing_attempts: number;
    rushing_yards_per_attempt: number;
    rushing_epa: number;
    rushing_first_downs: number;
    receiving_yards: number;
    receiving_tds: number;
    receptions: number;
    targets: number;
    yards_per_reception: number;
    yac_per_reception: number;
    receiving_epa: number;
    receiving_first_downs: number;
    receiving_fumbles: number;
    fumbles_lost: number;
    fumbles_per_game: number;

    // Home
    rushing_yards_home: number;
    rushing_tds_home: number;
    rushing_attempts_home: number;
    rushing_yards_per_attempt_home: number;
    rushing_epa_home: number;
    rushing_first_downs_home: number;
    receiving_yards_home: number;
    receiving_tds_home: number;
    receptions_home: number;
    targets_home: number;
    yards_per_reception_home: number;
    yac_per_reception_home: number;
    receiving_epa_home: number;
    receiving_first_downs_home: number;
    fumbles_per_game_home: number;
    fumbles_lost_home: number;

    // Away
    rushing_yards_away: number;
    rushing_tds_away: number;
    rushing_attempts_away: number;
    rushing_yards_per_attempt_away: number;
    rushing_epa_away: number;
    rushing_first_downs_away: number;
    receiving_yards_away: number;
    receiving_tds_away: number;
    receptions_away: number;
    targets_away: number;
    yards_per_reception_away: number;
    yac_per_reception_away: number;
    receiving_epa_away: number;
    receiving_first_downs_away: number;
    fumbles_lost_away: number;
    fumbles_per_game_away: number;

    // Division
    rushing_yards_division: number;
    rushing_tds_division: number;
    rushing_attempts_division: number;
    rushing_yards_per_attempt_division: number;
    rushing_epa_division: number;
    rushing_first_downs_division: number;
    receiving_yards_division: number;
    receiving_tds_division: number;
    receptions_division: number;
    targets_division: number;
    yards_per_reception_division: number;
    yac_per_reception_division: number;
    receiving_epa_division: number;
    receiving_first_downs_division: number;
    fumbles_lost_division: number;
    fumbles_per_game_division: number;

    league_position_averages: LeaguePositionAverages;
}

export type {
    PlayerSeasonStatAveragesQB,
    PlayerSeasonStatAveragesRB
}