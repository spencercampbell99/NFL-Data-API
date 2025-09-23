interface BasePlayerGameStat {
    player_id?: number;
    full_name?: string;
}

export interface PassingStats extends BasePlayerGameStat {
    passing_attempts: number;
    passing_completions: number;
    passing_yards: number;
    passing_air_yards: number;
    yards_per_pass_attempt: number;
    yards_per_pass_completion: number;
    passing_touchdowns: number;
    passing_interceptions: number;
    passing_sacks: number;
    passing_sack_yards: number;
    passing_sack_fumbles_lost: number;
    qb_rating: number;
    adjQBR: number;
    passer_rating: number;
    passing_first_downs: number;
    passing_yards_after_catch: number;
    passing_epa: number;
    passing_2pt_conversions: number;
    pacr: number;
    dakota: number;
}

export interface RushingStats extends BasePlayerGameStat {
    rushing_attempts: number;
    rushing_yards: number;
    yards_per_rush_attempt: number;
    rushing_touchdowns: number;
    rushing_long: number;
    rushing_first_downs: number;
    rushing_fumbles_lost: number;
    rushing_epa: number;
    rushing_2pt_conversions: number;
}

export interface ReceivingStats extends BasePlayerGameStat {
    receptions: number;
    targets: number;
    receiving_yards: number;
    yards_per_reception: number;
    receiving_touchdowns: number;
    receiving_long: number;
    receiving_first_downs: number;
    receiving_fumbles_lost: number;
    receiving_epa: number;
    receiving_2pt_conversions: number;
    receiving_yards_after_catch: number;
    receiving_air_yards: number;
    racr: number;
    target_share: number;
    wopr: number;
    ir_yards_share: number;
}

export interface FumblesStats extends BasePlayerGameStat {
    fumbles: number;
    fumbles_lost: number;
    fumbles_recovered: number;
}

export interface DefensiveStats extends BasePlayerGameStat {
    tackles: number;
    tackles_for_loss: number;
    fumbles_forced: number;
    sacks: number;
    qb_hits: number;
    defensive_touchdowns: number;
    interceptions: number;
    pass_defended: number;
    def_fumble_recovery_opp: number;
    def_safety_forced: number;
    def_penalty: number;
    def_penalty_yards: number;
}

export interface KickReturnStats extends BasePlayerGameStat {
    kick_returns: number;
    kick_return_yards: number;
    yards_per_kick_return: number;
    kick_return_touchdowns: number;
    kick_return_long: number;
}

export interface PuntStats extends BasePlayerGameStat {
    punts: number;
    punt_yards: number;
    yards_per_punt: number;
    punt_long: number;
    punts_inside_20: number;
    touchbacks: number;
}

export interface PuntReturnStats extends BasePlayerGameStat {
    punt_returns: number;
    punt_return_yards: number;
    yards_per_punt_return: number;
    punt_return_touchdowns: number;
    punt_return_long: number;
}

export interface FieldGoalStats extends BasePlayerGameStat {
    fg_made?: number;
    fg_missed?: number;
    fg_blocked?: number;
    fg_long?: number;
    fg_att?: number;
    fg_pct?: number;
    pat_made?: number;
    pat_missed?: number;
    pat_blocked?: number;
    pat_att?: number;
    pat_pct?: number;
    fg_made_distance?: number;
    fg_missed_distance?: number;
    gwfg_att?: number;
    gwfg_made?: number;
    gwfg_missed?: number;
    gwfg_blocked?: number;
}