'use client'

import React from 'react'
import Game from '@/interfaces/game.interface'
// import GameHeader from './gameHeader.component'
import { SelectTeamDropdown } from '@/components/commonDropdowns'
import Team from '@/interfaces/team.interface'
import TeamService from '@/services/Team.service'
import RoundedButton from '@/components/roundedButton.component'
import { BasicTeamCard } from '@/components/teams/teamDisplays.component'
import GameHeader from '@/components/games/gameHeader.component'
import { DateRangePicker } from '@/components/commonComponents'

interface MatchupAtAGlance {
    team1Wins: number,
    team2Wins: number,
    ties: number,
    totalGames: number,
    team1TotalPoints: number,
    team2TotalPoints: number
}

const HistoricalMatchup: React.FunctionComponent = () => {
    const [teams, setTeams] = React.useState<Team[]>([]);
    const [selectTeam1, setSelectTeam1] = React.useState<number>(-1);
    const [selectTeam2, setSelectTeam2] = React.useState<number>(-1);
    const [team1, setTeam1] = React.useState<Team | null>(null);
    const [team2, setTeam2] = React.useState<Team | null>(null);
    const [pagesLoaded, setPagesLoaded] = React.useState<number>(0);
    const [startDate, setStartDate] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<string>("");

    const [currentGames, setCurrentGames] = React.useState<Game[]>([]);
    const [matchupAtAGlance, setMatchupAtAGlance] = React.useState<MatchupAtAGlance|null>(null);

    React.useEffect(() => {
        TeamService.listTeams().then((data) => {
            setTeams(data);
            console.log(data)
        }).catch((error) => {
            console.error(error);
        })
    }, []);

    React.useEffect(() => {
        if (currentGames.length > 0) {
            let team1Wins = 0;
            let team2Wins = 0;
            let ties = 0;
            let totalGames = currentGames.length;
            let team1TotalPoints = 0;
            let team2TotalPoints = 0;
            
            currentGames.forEach((game) => {
                // determine if team1 is home
                let team1IsHome = game.home_team.id === team1?.id;

                if (game.home_score > game.away_score) {
                    if (team1IsHome) {
                        team1Wins++;
                        team1TotalPoints += game.home_score;
                    } else {
                        team2Wins++;
                        team2TotalPoints += game.home_score;
                    }
                } else if (game.away_score > game.home_score) {
                    if (team1IsHome) {
                        team2Wins++;
                        team2TotalPoints += game.away_score;
                    } else {
                        team1Wins++;
                        team1TotalPoints += game.away_score;
                    }
                } else {
                    ties++;
                    if (team1IsHome) {
                        team1TotalPoints += game.home_score;
                        team2TotalPoints += game.away_score;
                    } else {
                        team1TotalPoints += game.away_score;
                        team2TotalPoints += game.home_score;
                    }
                }
            })

            setMatchupAtAGlance({
                team1Wins: team1Wins,
                team2Wins: team2Wins,
                ties: ties,
                totalGames: totalGames,
                team1TotalPoints: team1TotalPoints,
                team2TotalPoints: team2TotalPoints
            })
        }
    }, [currentGames]);

    const loadGames = async (selectTeam1: number, selectTeam2: number, page: number, startDate: string, endDate: string) => {
        if (!selectTeam1 || !selectTeam2 || selectTeam1 === selectTeam2 || selectTeam1 === -1 || selectTeam2 === -1) {
            return;
        }

        TeamService.getHistoricalMatchups({ team1: selectTeam1, team2: selectTeam2, page: page, startDate: startDate, endDate: endDate }).then((data) => {
            if (page === 1) {
                setCurrentGames(data);
            } else {
                setCurrentGames([...currentGames, ...data]);
            }
            setPagesLoaded(page);
        }).catch((error) => {
            console.error(error);
        })

        // load team1 and team2 if not already loaded
        if (selectTeam1 !== team1?.id) {
            await TeamService.getTeam(selectTeam1).then((data) => {
                setTeam1(data);
            });
        }
        if (selectTeam2 !== team2?.id) {
            await TeamService.getTeam(selectTeam2).then((data) => {
                setTeam2(data);
            });
        }
    }

    return (
        <div className="w-full">
            {teams? 
                <>
                    <div className="flex flex-row justify-center mt-3">
                        <SelectTeamDropdown teams={teams} setTeam={setSelectTeam1} team={selectTeam1 ?? -1} />
                        <div className="ml-2"></div>
                        <SelectTeamDropdown teams={teams} setTeam={setSelectTeam2} team={selectTeam2 ?? -1} />
                        <div className="ml-2"></div>
                        <RoundedButton 
                            onClick={async () => {
                                loadGames(selectTeam1, selectTeam2, 1, startDate, endDate);
                            }}
                            text="Get Historical Matchups"
                            className='text-white bg-mediumGreen text-sm p-2 rounded-md hover:bg-darkGreen border-[2px] border-goldAccent'
                            overrideStyles={true}
                        />
                    </div>
                </>
            : null}
            <div className="flex flex-col justify-center items-center mt-3">
                {team1 && team2 ?
                    <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-row justify-center items-center mb-3">
                            <BasicTeamCard team={team1} />
                            <div className="mx-4 text-black font-bold">VS</div>
                            <BasicTeamCard team={team2} />
                        </div>
                        <div className="flex flex-row justify-center items-center mb-3">
                            <DateRangePicker startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
                        </div>
                        <RoundedButton
                            onClick={async () => {
                                loadGames(selectTeam1, selectTeam2, 1, startDate, endDate);
                            }}
                            text="Reload Games with Date Range"
                            className='text-white bg-mediumGreen text-sm p-2 rounded-md hover:bg-darkGreen border-[2px] border-goldAccent ml-3'
                            overrideStyles={true}
                        />
                    </div>
                : null}
            </div>
            <div className="flex flex-row justify-center items-center mt-3 text-black">
                {matchupAtAGlance ? 
                    <div className="flex flex-col justify-center items-center">
                        <div className="text-lg font-bold">Matchup at a Glance</div>
                        <div className="flex flex-row justify-center items-center">
                            <div className="flex flex-col justify-center items-center">
                                <div className="text-lg font-bold">{team1?.short_display_name}</div>
                                <div>Wins: {matchupAtAGlance.team1Wins}</div>
                                <div>Total Points: {matchupAtAGlance.team1TotalPoints}</div>
                            </div>
                            <div className="mx-4"></div>
                            <div className="flex flex-col justify-center items-center">
                                <div className="text-lg font-bold">{team2?.short_display_name}</div>
                                <div>Wins: {matchupAtAGlance.team2Wins}</div>
                                <div>Total Points: {matchupAtAGlance.team2TotalPoints}</div>
                            </div>
                        </div>
                        <div>Total Games: {matchupAtAGlance.totalGames}</div>
                        <div>Ties: {matchupAtAGlance.ties}</div>
                    </div>    
                : null}
            </div>
            <div className="mt-3 flex flex-col">
                {currentGames.length > 0 ? 
                        currentGames.map((game: Game) => (
                            <GameHeader
                                game={game}
                                key={game.id}
                                includeBoxscoreLink={true}
                                invertHomeAway={game.home_team.char_id === team1?.char_id}
                            />
                        ))
                : null}
                {currentGames.length > 0 && pagesLoaded > 0 ?
                    <RoundedButton 
                        onClick={async () => {
                            loadGames(selectTeam1, selectTeam2, pagesLoaded + 1, startDate, endDate);
                        }}
                        text="Load more games"
                        className='text-white bg-mediumGreen text-sm p-2 rounded-md hover:bg-darkGreen border-[2px] border-goldAccent mx-auto mt-3'
                        overrideStyles={true}
                    />
                : null}
            </div>
        </div>
    )
}

export default HistoricalMatchup;