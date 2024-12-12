'use client'

import React from "react"
import PlayerService from "@/services/Player.service"
import Player from "@/interfaces/player.interface"
import BasicTable from "@/components/tables/basicTable.component"

const BasicPlayerInfoCard = ({ player }: { player: Player }) => {
    return (
        <div className="bg-gray-100 p-6 shadow-md w-full flex items-center justify-between">
            <div className="flex items-center">
                <div className="ml-4">
                    <h1 className="text-xl font-bold text-gray-800">{player.full_name}</h1>
                    <p className="text-gray-600">
                        {player.position} • #{player.jersey_number} • {player.team.team}
                    </p>
                    <p className="text-sm text-gray-500">College: {player.college}</p>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-4 text-sm text-gray-700">
                <div>
                    <p className="font-semibold">Height:</p>
                    <p>{Math.floor(player.height ? player.height / 12 : 0)}' {player.height ? player.height % 12 : 0}"</p>
                </div>
                <div>
                    <p className="font-semibold">Weight:</p>
                    <p>{player.weight} lbs</p>
                </div>
                <div>
                    <p className="font-semibold">DOB:</p>
                    <p>{player.date_of_birth ? new Date(player.date_of_birth.replace(' ', 'T')).toLocaleDateString() : 'Not found'}</p>
                </div>
                <div>
                    <p className="font-semibold">Experience:</p>
                    <p>{player.experience} years</p>
                </div>
                <div>
                    <p className="font-semibold">Draft Year:</p>
                    <p>{player.rookie_year}</p>
                </div>
                <div>
                    <p className="font-semibold">Draft Pick:</p>
                    <p>{player.draft_number}</p>
                </div>
            </div>
        </div>
    )
}

const SeasonStatsCard = ({ player }: { player: Player }) => {
    const stats = player.season_stats[0]

    if (!stats) {
        return null
    }

    const leagueAverageStats = stats?.league_position_averages
    return (
        <div className="bg-gray-100 p-6 shadow-md w-full">
            <BasicTable
                columns={[
                    { header: 'Stat', key: 'stat', searchable: false, sortable: false },
                    { header: 'Overall', key: 'overall', searchable: false, sortable: false },
                    { header: 'League Average', key: 'league_average', searchable: false, sortable: false },
                    { header: 'Home', key: 'home', searchable: false, sortable: false },
                    { header: 'Away', key: 'away', searchable: false, sortable: false },
                    { header: 'Division', key: 'division', searchable: false, sortable: false },
                ]}
                data={[
                    { stat: 'Passer Rating', overall: stats.passer_rating, league_average: leagueAverageStats?.passer_rating, home: stats.passer_rating_home, away: stats.passer_rating_away, division: stats.passer_rating_division },
                    { stat: 'Yards/Attempt', overall: stats.yards_per_attempt, league_average: leagueAverageStats?.yards_per_passing_attempt, home: stats.yards_per_attempt_home, away: stats.yards_per_attempt_away, division: stats.yards_per_attempt_division },
                    { stat: 'Yards/Completion', overall: stats.yards_per_completion, league_average: leagueAverageStats?.yards_per_passing_completion, home: stats.yards_per_completion_home, away: stats.yards_per_completion_away, division: stats.yards_per_completion_division },
                    { stat: 'Air Yards/Attempt', overall: stats.air_yards_per_attempt, league_average: leagueAverageStats?.air_yards_per_passing_attempt, home: stats.air_yards_per_attempt_home, away: stats.air_yards_per_attempt_away, division: stats.air_yards_per_attempt_division },
                ]}
            />
        </div>
    )
}

const PlayerProfilePage = () => {
    const [player, setPlayer] = React.useState<Player|null>(null)

    React.useEffect(() => {
        const playerId = window.location.pathname.split('/').pop()
        if (playerId) {
            PlayerService.getPlayerSeasonOverview(playerId, 2024)
                .then((player) => {
                    setPlayer(player);

                    console.log(player)
                })
                .catch((error) => console.error(error))
        }
    }, [])

    return (
        <div>
            {player ? 
                <>
                    <BasicPlayerInfoCard player={player} />
                    <SeasonStatsCard player={player} />
                </>
            : <p>Loading...</p>}
        </div>
    )
}

export default PlayerProfilePage