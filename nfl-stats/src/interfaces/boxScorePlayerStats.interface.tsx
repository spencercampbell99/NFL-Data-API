export default interface BoxScorePlayerStats {
    passing: {
        [key: string]: number
    }
    rushing: {
        [key: string]: number
    }
    receiving: {
        [key: string]: number
    }
    defensive: {
        [key: string]: number
    }
    kicking: {
        [key: string]: number
    }
    punting: {
        [key: string]: number
    }
    kick_returns: {
        [key: string]: number
    }
    punt_returns: {
        [key: string]: number
    }
    fumbles: {
        [key: string]: number
    }
}