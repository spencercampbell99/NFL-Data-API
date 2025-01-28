'use client'

import React from "react"
import PlayerService from "@/services/Player.service"
import Player from "@/interfaces/player.interface"
import BasicTable from "@/components/tables/basicTable.component"
import GameService from "@/services/Game.service"
import Game from "@/interfaces/game.interface"
import { ScheduleList } from "@/components/games/scheduleList.component"
import TeamService from "@/services/Team.service"
import { stat } from "fs"
import { QBSeasonStatsCard } from "@/components/players/seasonStatCards.component"
import AveragedTeamPerformance from "@/interfaces/averagedTeamPerformance.interface"

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

const SeasonScheduleCard = ({ schedule, team=null }: { schedule: Game[], team?: string|null }) => {
    return (
        <div className="bg-gray-100 p-6 shadow-md w-full">
            {schedule.length ?
                <ScheduleList games={schedule} alternateTitle={'Season Schedule'} targetTeam={team} />
            : null}
        </div>
    )
}

const NextGameCard = ({ game }: { game: Game }) => {
    return (
        <div className="bg-gray-100 p-6 shadow-md w-full">
            Will show defensive/offensive averages for the opponent team and a link to historical matchups.
        </div>
    )
}

const StatsDisplay = ({ stats, nextGame, teamId }: { stats: AveragedTeamPerformance, nextGame: Game, teamId: number|undefined }) => {
    if (!stats) {
        return <div>No stats available</div>;
    }

    const opponentCharId = nextGame.home_team_id == teamId ? nextGame.away_team_char_id : nextGame.home_team_char_id

    return (
        <div className="p-4">
            <div className="text-xl font-bold mb-4">
                {nextGame ? `Next Game: ${nextGame.home_team_char_id} vs ${nextGame.away_team_char_id} Week ${nextGame.week}` : 'Upcoming Matchup in week 15'}
            </div>
            <div className="text-lg font-semibold mb-2">
                These are the average stats for the last several games of the opponent {`${opponentCharId ?? ''}`} going into the game.
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white shadow-md rounded p-4">
                    <h2 className="font-bold text-lg mb-4">Avg Offense Stats {`${opponentCharId ?? ''}`}</h2>
                    <ul className="space-y-2">
                        {Object.entries(stats).filter(([key]) => key.startsWith('avg_') && !key.includes('allowed')).map(([key, value], index) => (
                            <li key={key} className={`flex justify-between ${index % 2 === 0 ? 'bg-slate-100' : 'bg-slate-200'} p-2 rounded`}>
                                <span className="capitalize">{key.replace('avg_', '').replace(/_/g, ' ')}</span>
                                <span>{value ?? 'N/A'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white shadow-md rounded p-4">
                    <h2 className="font-bold text-lg mb-4">Avg Defense Stats {`${opponentCharId ?? ''}`}</h2>
                    <ul className="space-y-2">
                        {Object.entries(stats).filter(([key]) => key.includes('allowed') || key.startsWith('avg_defense_')).map(([key, value], index) => (
                            <li key={key} className={`flex justify-between ${index % 2 === 0 ? 'bg-slate-100' : 'bg-slate-200'} p-2 rounded`}>
                                <span className="capitalize">{key.replace('avg_', '').replace(/_/g, ' ').replace('allowed', '(Allowed)')}</span>
                                <span>{value ?? 'N/A'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const PlayerProfilePage = () => {
    const [player, setPlayer] = React.useState<Player|null>(null)
    const [schedule, setSchedule] = React.useState<Game[]>([])
    const [nextGame, setNextGame] = React.useState<Game|null>(null)
    const [opponentAveragesNextGame, setOpponentAveragesNextGame] = React.useState<AveragedTeamPerformance|null>(null)

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

    React.useEffect(() => {
        if (player?.team_id) {
            TeamService.getSeasonScheduleForTeam(player.team_id, 2024)
                .then((schedule) => {
                    setSchedule(schedule)
                    
                    if (schedule[15]) {
                        setNextGame(schedule[15])
                    }
                })
                .catch((error) => console.error(error))
        }
    }, [player])

    React.useEffect(() => {
        if (nextGame) {
            const teamIdToCheck = nextGame.home_team_id == player?.team_id ? nextGame.away_team_id : nextGame.home_team_id

            TeamService.getAverageTeamPerformanceGoingIntoWeek(teamIdToCheck, nextGame.week, nextGame.season, 5)
                .then((result) => {
                    console.log(result)

                    setOpponentAveragesNextGame(result)
                })
                .catch((error) => console.error(error))
        }
    }, [nextGame])

    return (
        <div>
            {player ? 
                <>
                    <BasicPlayerInfoCard player={player} />
                    <QBSeasonStatsCard player={player} />
                    {/* {nextGame ? <NextGameCard game={nextGame} /> : null} */}
                    {(opponentAveragesNextGame && nextGame) ? <StatsDisplay stats={opponentAveragesNextGame} nextGame={nextGame} teamId={player.team_id} /> : null}
                    <SeasonScheduleCard schedule={schedule} team={player?.team?.team}/>
                </>
            : <p>Loading...</p>}
        </div>
    )
}

export default PlayerProfilePage