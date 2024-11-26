'use client'
import React from 'react';
import axios from '@/axiosConfig';
import moment from 'moment';
import Link from 'next/link';
import Game from '@/interfaces/game.interface';
import Team from '@/interfaces/team.interface';
import { useRouter } from 'next/navigation';
import { SeasonWeekSelector } from '@/components/commonComponents';

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
                        <Link 
                            className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded text-center ${!game.home_score && !game.away_score ? 'cursor-not-allowed opacity-50' : ''}`} 
                            href={!game.home_score && !game.away_score ? '#' : `/nfl/games/overview/${game.id}`} 
                            onClick={(e) => { if (!game.home_score && !game.away_score) e.preventDefault(); }}
                        >
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

const PlayerGamePage: React.FunctionComponent<{ params: { season: number, week: number } }> = ({ params: { season: urlSeason, week: urlWeek } }) => {
    const [season, setSeason] = React.useState<number>(urlSeason);
    const [week, setWeek] = React.useState<number>(urlWeek);
    const [games, setGames] = React.useState<Game[]>([]);
    const router = useRouter();

    const fetchGames = async (season: number, week: number) => {
        const response = await axios.get(`/games/overview/${season}/${week}`);
        setGames(response.data.games);
    }

    // go to season/week entered
    const goToSeasonWeek = () => {
        if (season === urlSeason && week === urlWeek) {
            return;
        }
        if (season < 2010 || season > maxYear) {
            alert('Invalid season');
            return;
        }
        if (week < 1 || week > 18) {
            alert('Invalid week. Regular season only.');
            return;
        }
        
        router.push(`/nfl/games/${season}/${week}`);
    }

    // fetch games
    React.useEffect(() => {
        if (!urlSeason || !urlWeek) {
            return;
        }
        fetchGames(urlSeason, urlWeek);
    }, []);

    return (
        <>
            <div id="navigator" className="flex flex-row items-center justify-center gap-2 mt-2 text-black">
                <SeasonWeekSelector season={season} week={week} setSeason={setSeason} setWeek={setWeek} buttonText="Go" onClick={goToSeasonWeek} />
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