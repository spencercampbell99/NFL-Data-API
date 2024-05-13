interface PassingStat {
        passing_attempts: number,
        passing_completions: number,
        passing_yards: number,
        passing_air_yards: number,
        yards_per_pass_attempt: number,
        yards_per_pass_completion: number,
        passing_touchdowns: number,
        passing_interceptions: number,
        passing_sacks: number,
        passing_sack_yards: number,
        passing_sack_fumbles_lost: number,
        qb_rating: number,
        adjQBR: number,
        passer_rating: number,
        passing_first_downs: number,
        passing_yards_after_catch: number,
        passing_epa: number,
        passing_2pt_conversions: number,
        pacr: number,
        dakota: number,
        full_name: string,
        team_name: string,
        team_id: number
}

interface RushingStat {
    rushing_attempts: number,
    rushing_yards: number,
    rushing_touchdowns: number,
    rushing_long: number,
    rushing_first_downs: number,
    rushing_epa: number,
    rushing_2pt_conversions: number,
    rushing_fumbles_lost: number,
    yards_per_rush_attempt: number,
    full_name: string,
    team_name: string,
    team_id: number
}

interface ReceivingStat {
    receptions: number,
    targets: number,
    receiving_yards: number,
    yards_per_reception: string,
    receiving_touchdowns: number,
    receiving_long: number,
    receiving_first_downs: number,
    receiving_fumbles_lost: number,
    receiving_epa: string,
    receiving_2pt_conversions: number,
    receiving_yards_after_catch: number,
    receiving_air_yards: number,
    racr: string,
    target_share: string,
    wopr: string,
    air_yards_share: string,
    full_name: string,
    team_name: string,
    team_id: number
}

interface DefensiveStat {
    tackles: number,
    tackles_for_loss: number,
    fumbles_forced: number,
    sacks: number,
    qb_hits: number,
    defensive_touchdowns: number,
    interceptions: number,
    pass_defended: number,
    def_fumble_recovery_opp: number,
    def_safety_forced: number,
    def_penalty: number,
    def_penalty_yards: number,
    full_name: string,
    team_name: string,
    team_id: number
}

interface KickingStat {
    fg_made: number,
    fg_missed: number,
    fg_blocked: number,
    fg_long: number,
    fg_att: number,
    fg_pct: string,
    pat_made: number,
    pat_missed: number,
    pat_blocked: number,
    pat_att: number,
    pat_pct: string,
    fg_made_distance: number,
    fg_missed_distance: number,
    gwfg_att: number,
    gwfg_made: number,
    gwfg_missed: number,
    gwfg_blocked: number,
    full_name: string,
    team_name: string,
    team_id: number
}

interface PuntingStat {
    punts: number,
    punt_yards: number,
    yards_per_punt: string,
    punt_long: number,
    punt_blocked: number,
    full_name: string,
    team_name: string,
    team_id: number
}

interface PuntReturnStat {
    punt_returns: number,
    punt_return_yards: number,
    yards_per_punt_return: string,
    punt_return_touchdowns: number,
    punt_return_long: number,
    full_name: string,
    team_name: string,
    team_id: number
}

interface FumbleStat {
    fumbles: number,
    fumbles_lost: number,
    fumbles_recovered: number,
    full_name: string,
    team_name: string,
    team_id: number
}

interface BoxScorePlayerStats {
    passing: Array<PassingStat>
    rushing: Array<RushingStat>
    receiving: Array<ReceivingStat>
    defensive: Array<DefensiveStat>
    kicking: Array<KickingStat>
    punting: Array<PuntingStat>
    kick_returns: Array<{
        [key: string]: any
    }>
    punt_returns: Array<PuntReturnStat>
    fumbles: Array<FumbleStat>
}

export type {BoxScorePlayerStats, PassingStat, RushingStat, ReceivingStat, DefensiveStat, KickingStat, PuntingStat, PuntReturnStat, FumbleStat};