'use client'
import React from 'react';
import axios from '@/axiosConfig';
import moment from 'moment';
import Link from 'next/link';
import Game from '@/interfaces/game.interface';

interface Team {
    team_name: string
    wiki_logo_url: string
}

const TeamSeasonOverview: React.FunctionComponent<{ team: Team }> = ({ team }) => {
    return (
        <div className="flex flex-row">
            <img className="w-[32px] h-[32px] mr-2" src={team.wiki_logo_url} />
            <div className="text-left">
                <div className="text-lg font-bold text-gray-800">{team.team_name}</div>
                <div className="text-xs font-medium text-gray-500">12-5</div> {/* TODO: Make dynamic */}
            </div>
        </div>
    )
}

const GameOverview: React.FunctionComponent<{ game: Game }> = ({ game }) => {
    const homeWin = game.home_score > game.away_score;
    const espnLink = `https://www.espn.com/nfl/game/_/gameId/${game.espn_id}`;

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

const PlayerGamePage: React.FunctionComponent<{}> = () => {
    const [season, setSeason] = React.useState<number>(2023);
    const [week, setWeek] = React.useState<number>(1);
    const [games, setGames] = React.useState<Game[]>([]);

    // fetch games
    React.useEffect(() => {
        const fetchGames = async () => {
            const response = await axios.get(`/games/overview/${season}/${week}`);
            setGames(response.data.games);

            console.log(response.data.games);
        }
        fetchGames();
    }, [season, week]);

    return (
        <>
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