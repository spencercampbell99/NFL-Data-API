import Player from "@/interfaces/player.interface"
import BasicTable from "../tables/basicTable.component"

const QBSeasonStatsCard = ({ player }: { player: Player }) => {
    const stats = player.season_stats ? player.season_stats[0] : null

    if (!stats) {
        return null
    }

    console.log(stats)

    const leagueAverageStats = stats?.league_position_averages

    const calcCompPerc = (leagueAverageStats: any) => {
        if (!leagueAverageStats || !leagueAverageStats.passing_attempts || !leagueAverageStats.passing_completions) {
            return null;
        }

        return ((leagueAverageStats.passing_completions / leagueAverageStats.passing_attempts) * 100).toFixed(2);
    }

    const calcYardsPerRush = (leagueAverageStats: any) => {
        if (!leagueAverageStats || !leagueAverageStats.rushing_attempts || !leagueAverageStats.rushing_yards) {
            return null;
        }

        return (leagueAverageStats.rushing_yards / leagueAverageStats.rushing_attempts).toFixed(2);
    }

    return (
        <div className="bg-gray-100 p-6 shadow-md w-full">
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
                    // { stat: "Passing EPA", overall: stats.passing_epa, league_average: leagueAverageStats?.passing_epa, home: stats.passing_epa_home, away: stats.passing_epa_away, division: stats.passing_epa_division },
                    // Rushing
                    { stat: "Rushing Yards", overall: stats.rushing_yards, league_average: leagueAverageStats?.rushing_yards, home: stats.rushing_yards_home, away: stats.rushing_yards_away, division: stats.rushing_yards_division },
                    { stat: "Rushing TDs", overall: stats.rushing_tds, league_average: leagueAverageStats?.rushing_touchdowns, home: stats.rushing_tds_home, away: stats.rushing_tds_away, division: stats.rushing_tds_division },
                    { stat: "Yards/Attempt", overall: stats.rushing_yards_per_attempt, league_average: calcYardsPerRush(leagueAverageStats), home: stats.rushing_yards_per_attempt_home, away: stats.rushing_yards_per_attempt_away, division: stats.rushing_yards_per_attempt_division },
                    { stat: "Rushing first downs", overall: stats.rushing_first_downs, league_average: 'Not supported', home: stats.rushing_first_downs_home, away: stats.rushing_first_downs_away, division: stats.rushing_first_downs_division },
                    // { stat: "Rushing EPA", overall: stats.rushing_epa, league_average: leagueAverageStats?.rushing_epa, home: stats.rushing_epa_home, away: stats.rushing_epa_away, division: stats.rushing_epa_division },
                ]}
            />
        </div>
    )
}

export {
    QBSeasonStatsCard
}