'use client'
import React from 'react';
import axios from '@/axiosConfig';
import moment from 'moment';
import Link from 'next/link';
import Game from '@/interfaces/game.interface';
import Team from '@/interfaces/team.interface';

const TeamSeasonOverview: React.FunctionComponent<{ team: Team }> = ({ team }) => {
    return (
        <div className="flex flex-row">
            <img className="w-[32px] h-[32px] mr-2" src={team.team_logo_wikipedia} />
            <div className="text-left">
                <div className="text-lg font-bold text-gray-800">{team.short_display_name}</div>
                <div className="text-xs font-medium text-gray-500">12-5</div> {/* TODO: Make dynamic */}
            </div>
        </div>
    )
}

const GameOverview: React.FunctionComponent<{ game: Game }> = ({ game }) => {
    const homeWin = game.home_score > game.away_score;
    const espnLink = `https://www.espn.com/nfl/game/_/gameId/${game.espn_id}`;

    // if away_team or home_team is null, return null
    if (!game.away_team || !game.home_team) {
        return null;
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md px-4">
                <div className="text-sm font-medium text-gray-600 mb-2 text-[18px] mt-2">{moment(game.date).format('dddd, MMMM Do, YYYY')}</div>

                <div className="grid grid-cols-6 items-center gap-2 mb-2">
                    <div className="text-left flex flex-col">
                        <TeamSeasonOverview team={game.away_team} />
                        <TeamSeasonOverview team={game.home_team} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-center">
                            <div className={`text-2xl text-gray-800${homeWin ? '' : ' font-bold'}`}>{game.away_score}</div>
                            <div className={`text-2xl text-gray-800${!homeWin ? '' : ' font-bold'}`}>{game.home_score}</div>
                        </div>
                    </div>
                    <div className="col-span-3"></div>
                    <div className="flex flex-col justify-center gap-1">
                        <Link className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded text-center" href={espnLink} target="_blank">
                        ESPN GAMECAST
                        </Link>
                        <Link className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded text-center" href={`/nfl/games/overview/${game.id}`}>
                        BOX SCORE
                        </Link>
                        <Link className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded text-center" href={espnLink} target="_blank">
                        ESPN HIGHLIGHTS
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

const currentDate = new Date();
const maxYear = currentDate.getMonth() < 8 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();

const PlayerGamePage: React.FunctionComponent<{}> = () => {
    const [season, setSeason] = React.useState<number>(2023);
    const [week, setWeek] = React.useState<number>(1);
    const [currentSeason, setCurrentSeason] = React.useState<number>(2023);
    const [currentWeek, setCurrentWeek] = React.useState<number>(1);
    const [games, setGames] = React.useState<Game[]>([]);

    const fetchGames = async (season: number, week: number) => {
        const response = await axios.get(`/games/overview/${season}/${week}`);
        setGames(response.data.games);
    }

    // go to season/week entered
    const goToSeasonWeek = () => {
        if (season === currentSeason && week === currentWeek) {
            return;
        }
        if (season < 2010 || season > maxYear) {
            alert('Invalid season');
            return;
        }
        if (week < 1 || week > 18) {
            alert('Invalid week');
            return;
        }
        fetchGames(season, week);
        setCurrentSeason(season);
        setCurrentWeek(week);
    }

    // fetch games
    React.useEffect(() => {
        fetchGames(season, week);
    }, []);

    return (
        <>
            <div id="navigator" className="flex flex-row items-center justify-center gap-2 mt-2 text-black">
                <label htmlFor="season" className="font-bold mr-2">Season:</label>
                <input 
                    type="number" 
                    id="season" 
                    className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                    value={season} 
                    min={2010} 
                    max={maxYear}
                    onChange={(e) => setSeason(parseInt(e.target.value))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            goToSeasonWeek();
                        }
                    }}
                />
                <label htmlFor="week" className="font-bold ml-2 mr-2">Week:</label>
                <input 
                    type="number" 
                    id="week" 
                    className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                    value={week} 
                    min={1} 
                    max={18}
                    onChange={(e) => setWeek(parseInt(e.target.value))}
                />
                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                    onClick={goToSeasonWeek}
                >
                    GO
                </button>
            </div>
            <div id="games-container" className="flex flex-col gap-2 mt-2">
                {games.length > 0 ?
                    games.map((game, index) => {
                        return (
                            <GameOverview key={index} game={game} />
                        )
                    })
                : null}
            </div>
        </>
    );
}

export default PlayerGamePage;