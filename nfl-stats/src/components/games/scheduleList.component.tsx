import React from 'react';
import moment from 'moment';
import Game from '@/interfaces/game.interface';

const formatDate = (sqlDate: string): string => {
    return moment(sqlDate).format('ddd');
}

const formatTime = (time24: string): string => {
    return moment(time24, "HH:mm").format("h:mm A");
}

interface ScheduleListGameProps {
    game: Game;
    targetTeam?: string|null;
}

const ScheduleListGame: React.FC<ScheduleListGameProps> = ({ game, targetTeam = null }) => {
    let firstTeamInfo = {
        charId: game.home_team_char_id,
        moneyLine: game.home_moneyline,
        score: game.home_score,
        isHome: true
    };
    let secondTeamInfo = {
        charId: game.away_team_char_id,
        moneyLine: game.away_moneyline,
        score: game.away_score,
        isHome: false
    };

    let vsOrAt = 'vs';

    if (targetTeam) {
        if (game.home_team_char_id === targetTeam) {
            firstTeamInfo.isHome = true;
            vsOrAt = '@';
        } else if (game.away_team_char_id === targetTeam) {
            [firstTeamInfo, secondTeamInfo] = [secondTeamInfo, firstTeamInfo];
            vsOrAt = '@';
        }
    }

    const getScoreColor = (teamInfo: any) => {
        return teamInfo.score < (teamInfo.isHome ? game.away_score : game.home_score) ? 'text-nflRed' : 'text-black font-bold';
    };

    return (
        <div className="p-2 border-b border-gray-300 bg-gray-200 hover:bg-gray-300 cursor-pointer" onClick={() => {}}>
            <div className="grid grid-cols-4 items-center text-sm">
                <h2 className="text-md font-bold text-nflBlue">
                    {moment(game.date).format('dddd')} - {moment(game.time, "HH:mm").format("h:mm A")} (Week {game.week})
                </h2>
                <div className="text-center">
                    <p className="text-xl text-black">{firstTeamInfo.charId}</p>
                    <p>{firstTeamInfo.isHome ? 'Home ML:' : 'Away ML:'} <span className="text-goldAccent">{firstTeamInfo.moneyLine}</span></p>
                    <p>Score: <span className={getScoreColor(firstTeamInfo)}>{firstTeamInfo.score}</span></p>
                </div>
                <div className="text-center">
                    <p className="text-xl text-black">{vsOrAt}</p>
                    <p>Spread: <span className="text-goldAccent">{game.spread}</span></p>
                    <p>O/U: <span className="text-goldAccent">{game.over_under}</span></p>
                </div>
                <div className="text-center">
                    <p className="text-xl text-black">{secondTeamInfo.charId}</p>
                    <p>{secondTeamInfo.isHome ? 'Home ML:' : 'Away ML:'} <span className="text-goldAccent">{secondTeamInfo.moneyLine}</span></p>
                    <p>Score: <span className={getScoreColor(secondTeamInfo)}>{secondTeamInfo.score}</span></p>
                </div>
            </div>
        </div>
    );
}

/**
 * @param param0 { games, alternateTitle = null, targetTeam = null }}
 * 
 * Renders a list of games in a grid format. If targetTeam is specified, that team will always be displayed on the left side of the grid. If alternateTitle is specified, that will be displayed instead of "Game Schedule".
 * 
 * @returns 
 */
const ScheduleList = ({ games, alternateTitle = null, targetTeam = null }: { games: Game[], alternateTitle?: string|null, targetTeam?: string|null }) => {
    let wins = 0;
    let totalGames = 0;

    if (targetTeam) {
        games.forEach(game => {
            if (game.home_team_char_id === targetTeam || game.away_team_char_id === targetTeam) {
                if (game.home_team_char_id === targetTeam && game.home_score !== null && game.away_score !== null) {
                    totalGames++;
                    if (game.home_score > game.away_score) wins++;
                } else if (game.away_team_char_id === targetTeam && game.home_score !== null && game.away_score !== null) {
                    totalGames++;
                    if (game.away_score > game.home_score) wins++;
                }
            }
        });
    }

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-2xl font-bold text-center mb-4 text-nflBlue">{alternateTitle ? alternateTitle : 'Game Schedule'}</h1>
            {targetTeam && <div className="text-center mb-4">Record: {wins} - {totalGames - wins}</div>}
            {games.map(game => <ScheduleListGame key={game.id} game={game} targetTeam={targetTeam} />)}
        </div>
    );
}

export {
    ScheduleListGame, ScheduleList
}
