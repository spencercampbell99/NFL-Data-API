import Player from "@/interfaces/player.interface"
import BasicTable from "../tables/basicTable.component"
import { PlayerSeasonStatAveragesQB, PlayerSeasonStatAveragesRB } from "@/interfaces/playerSeasonStatAverages.interface";
import LeaguePositionAverages from "@/interfaces/leaguePositionAverages.interface";

const calcCompPerc = (leagueAverageStats: LeaguePositionAverages) => {
    if (!leagueAverageStats || !leagueAverageStats.passing_attempts || !leagueAverageStats.passing_completions) {
        return null;
    }
    return ((leagueAverageStats.passing_completions / leagueAverageStats.passing_attempts) * 100).toFixed(2);
}

const calcYardsPerRush = (leagueAverageStats: LeaguePositionAverages) => {
    if (!leagueAverageStats || !leagueAverageStats.rushing_attempts || !leagueAverageStats.rushing_yards) {
        return null;
    }
    return (leagueAverageStats.rushing_yards / leagueAverageStats.rushing_attempts).toFixed(2);
}

const calcCatchRate = (leagueAverageStats: LeaguePositionAverages) => {
    if (!leagueAverageStats || !leagueAverageStats.targets || !leagueAverageStats.receptions) {
        return null;
    }
    return ((leagueAverageStats.receptions / leagueAverageStats.targets) * 100).toFixed(2);
}

const QBSeasonStatsCard = ({ player }: { player: Player }) => {
    const stats = player.season_stats
        ? player.season_stats[0] as PlayerSeasonStatAveragesQB
        : null
    if (!stats) return null
    const leagueAverageStats = stats?.league_position_averages

    return (
        <div className="bg-gray-100 p-6 shadow-md w-full">
            <p className="text-md mb-4">Season Stats vs Field for {`${player.full_name}`} (previous season stats until current season is established)</p>
            <BasicTable
                columns={[
                    { header: 'Stat (Per Game)', key: 'stat', searchable: false, sortable: false },
                    { header: 'Overall', key: 'overall', searchable: false, sortable: false },
                    { header: 'League Average for Position', key: 'league_average', searchable: false, sortable: false },
                    { header: 'Home', key: 'home', searchable: false, sortable: false },
                    { header: 'Away', key: 'away', searchable: false, sortable: false },
                    { header: 'Division', key: 'division', searchable: false, sortable: false },
                ]}
                data={[
                    { stat: 'Passer Rating', overall: stats.passer_rating, league_average: leagueAverageStats?.passer_rating, home: stats.passer_rating_home, away: stats.passer_rating_away, division: stats.passer_rating_division },
                    { stat: 'Yards/Attempt', overall: stats.yards_per_attempt, league_average: leagueAverageStats?.yards_per_passing_attempt, home: stats.yards_per_attempt_home, away: stats.yards_per_attempt_away, division: stats.yards_per_attempt_division },
                    { stat: 'Yards/Completion', overall: stats.yards_per_completion, league_average: leagueAverageStats?.yards_per_passing_completion, home: stats.yards_per_completion_home, away: stats.yards_per_completion_away, division: stats.yards_per_completion_division },
                    { stat: 'Air Yards/Attempt', overall: stats.air_yards_per_attempt, league_average: leagueAverageStats?.air_yards_per_passing_attempt, home: stats.air_yards_per_attempt_home, away: stats.air_yards_per_attempt_away, division: stats.air_yards_per_attempt_division },
                    { stat: "Passing Yards", overall: stats.passing_yards, league_average: leagueAverageStats?.passing_yards, home: stats.passing_yards_home, away: stats.passing_yards_away, division: stats.passing_yards_division },
                    { stat: "Completion %", overall: stats.completion_rate, league_average: calcCompPerc(leagueAverageStats), home: stats.completion_rate_home, away: stats.completion_rate_away, division: stats.completion_rate_division },
                    { stat: "Passing TDs", overall: stats.passing_tds, league_average: leagueAverageStats?.passing_touchdowns, home: stats.passing_tds_home, away: stats.passing_tds_away, division: stats.passing_tds_division },
                    { stat: "Interceptions", overall: stats.interceptions, league_average: leagueAverageStats?.passing_interceptions, home: stats.interceptions_home, away: stats.interceptions_away, division: stats.interceptions_division },
                    
                    // Errors and Sacks
                    { stat: "Fumbles Lost", overall: stats.fumbles_lost, league_average: leagueAverageStats.fumbles_lost, home: stats.fumbles_lost_home, away: stats.fumbles_lost_away, division: stats.fumbles_lost_division },
                    { stat: "Total Sacks", overall: stats.total_sacks, league_average: leagueAverageStats.sacks_allowed, home: stats.total_sacks_home, away: stats.total_sacks_away, division: stats.total_sacks_division },

                    // Rushing
                    { stat: "Rushing Yards", overall: stats.rushing_yards, league_average: leagueAverageStats?.rushing_yards, home: stats.rushing_yards_home, away: stats.rushing_yards_away, division: stats.rushing_yards_division },
                    { stat: "Rushing TDs", overall: stats.rushing_tds, league_average: leagueAverageStats?.rushing_touchdowns, home: stats.rushing_tds_home, away: stats.rushing_tds_away, division: stats.rushing_tds_division },
                    { stat: "Yards/Rush Attempt", overall: stats.rushing_yards_per_attempt, league_average: calcYardsPerRush(leagueAverageStats), home: stats.rushing_yards_per_attempt_home, away: stats.rushing_yards_per_attempt_away, division: stats.rushing_yards_per_attempt_division },
                    { stat: "Rushing first downs", overall: stats.rushing_first_downs, league_average: 'Not supported', home: stats.rushing_first_downs_home, away: stats.rushing_first_downs_away, division: stats.rushing_first_downs_division },
                ]}
            />
        </div>
    )
}

const RBSeasonStatsCard = ({ player }: { player: Player }) => {
    const stats = player.season_stats
        ? player.season_stats[0] as PlayerSeasonStatAveragesRB
        : null
    if (!stats) return null
    const leagueAverageStats = stats?.league_position_averages

    function catchRate (stats: PlayerSeasonStatAveragesRB, location?: 'home' | 'away' | 'division') {
        const targetCount = location ? stats[`targets_${location}` as keyof PlayerSeasonStatAveragesRB] as number : stats.targets;
        const receptionCount = location ? stats[`receptions_${location}` as keyof PlayerSeasonStatAveragesRB] as number : stats.receptions;
        if (!targetCount || !receptionCount) {
            return null;
        }
        return ((receptionCount / targetCount) * 100).toFixed(1);
    }

    return (
        <div className="bg-gray-100 p-6 shadow-md w-full">
            <p className="text-md mb-4">Season Stats vs Field for {`${player.full_name}`} (previous season stats until current season is established)</p>
            <BasicTable
                columns={[
                    { header: 'Stat (Per Game)', key: 'stat', searchable: false, sortable: false },
                    { header: 'Overall', key: 'overall', searchable: false, sortable: false },
                    { header: 'League Average for Position', key: 'league_average', searchable: false, sortable: false },
                    { header: 'Home', key: 'home', searchable: false, sortable: false },
                    { header: 'Away', key: 'away', searchable: false, sortable: false },
                    { header: 'Division', key: 'division', searchable: false, sortable: false },
                ]}
                data={[
                    // Rushing
                    { stat: "Rushing Attempts", overall: stats.rushing_attempts, league_average: leagueAverageStats?.rushing_attempts, home: stats.rushing_attempts_home, away: stats.rushing_attempts_away, division: stats.rushing_attempts_division },
                    { stat: "Rushing Yards", overall: stats.rushing_yards, league_average: leagueAverageStats?.rushing_yards, home: stats.rushing_yards_home, away: stats.rushing_yards_away, division: stats.rushing_yards_division },
                    { stat: "Rushing TDs", overall: stats.rushing_tds, league_average: leagueAverageStats?.rushing_touchdowns, home: stats.rushing_tds_home, away: stats.rushing_tds_away, division: stats.rushing_tds_division },
                    { stat: "Yards/Rush Attempt", overall: stats.rushing_yards_per_attempt, league_average: calcYardsPerRush(leagueAverageStats), home: stats.rushing_yards_per_attempt_home, away: stats.rushing_yards_per_attempt_away, division: stats.rushing_yards_per_attempt_division },
                    { stat: "Rushing EPA", overall: stats.rushing_epa, league_average: leagueAverageStats?.rushing_epa, home: stats.rushing_epa_home, away: stats.rushing_epa_away, division: stats.rushing_epa_division },
                    { stat: "Rushing first downs", overall: stats.rushing_first_downs, league_average: 'Not supported', home: stats.rushing_first_downs_home, away: stats.rushing_first_downs_away, division: stats.rushing_first_downs_division },
                    { stat: "Fumbles", overall: stats.fumbles_per_game, league_average: leagueAverageStats?.fumbles, home: stats.fumbles_per_game_home, away: stats.fumbles_per_game_away, division: stats.fumbles_per_game_division },
                    { stat: "Fumbles Lost", overall: stats.fumbles_lost, league_average: leagueAverageStats?.fumbles_lost, home: stats.fumbles_lost_home, away: stats.fumbles_lost_away, division: stats.fumbles_lost_division },
                    // Receiving
                    { stat: "Receptions", overall: stats.receptions, league_average: leagueAverageStats?.receptions, home: stats.receptions_home, away: stats.receptions_away, division: stats.receptions_division },
                    { stat: "Targets", overall: stats.targets, league_average: leagueAverageStats?.targets, home: stats.targets_home, away: stats.targets_away, division: stats.targets_division },
                    { stat: "Receiving Yards", overall: stats.receiving_yards, league_average: leagueAverageStats?.receiving_yards, home: stats.receiving_yards_home, away: stats.receiving_yards_away, division: stats.receiving_yards_division },
                    { stat: "Receiving TDs", overall: stats.receiving_tds, league_average: leagueAverageStats?.receiving_touchdowns, home: stats.receiving_tds_home, away: stats.receiving_tds_away, division: stats.receiving_tds_division },
                    { stat: "Yards/Reception", overall: stats.yards_per_reception, league_average: leagueAverageStats?.yards_per_reception, home: stats.yards_per_reception_home, away: stats.yards_per_reception_away, division: stats.yards_per_reception_division },
                    { stat: "Receiving EPA", overall: stats.receiving_epa, league_average: leagueAverageStats?.receiving_epa, home: stats.receiving_epa_home, away: stats.receiving_epa_away, division: stats.receiving_epa_division },
                    { stat: "Receiving first downs", overall: stats.receiving_first_downs, league_average: 'Not supported', home: stats.receiving_first_downs_home, away: stats.receiving_first_downs_away, division: stats.receiving_first_downs_division },
                    { stat: "Yards After Catch/Reception", overall: stats.yac_per_reception, league_average: 'Not supported', home: stats.yac_per_reception_home, away: stats.yac_per_reception_away, division: stats.yac_per_reception_division },
                    { stat: "Catch Rate (%)", overall: catchRate(stats), league_average: calcCatchRate(leagueAverageStats), home: catchRate(stats, 'home'), away: catchRate(stats, 'away'), division: catchRate(stats, 'division') },
                ]}
            />
        </div>
    )
}

export {
    QBSeasonStatsCard,
    RBSeasonStatsCard
}