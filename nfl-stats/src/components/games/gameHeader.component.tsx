import React from 'react'
import Game from '@/interfaces/game.interface'
import Team from '@/interfaces/team.interface';
import moment from 'moment';
import Link from 'next/link';

const ScoreboardItem: React.FunctionComponent<{ value: string }> = ({ value }) => {
    return (
        <span className="flex-1 text-center">{value}</span>
    );

}

const TeamDisplay: React.FunctionComponent<{ team: Team, isHome: boolean }> = ({ team, isHome }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{team.short_display_name} ({isHome ? 'H' : 'A'})</span>
            <img src={team.team_logo_wikipedia} alt="Logo" className="w-8 h-8" />
        </div>
    );
}

const GameHeader: React.FunctionComponent<{ game: Game, includeDate?: boolean, includeBoxscoreLink?: boolean, invertHomeAway?: boolean }> = ({ game, includeDate = true, includeBoxscoreLink = false, invertHomeAway = false }) => {
    const winnerLeft = game.away_score ? (!invertHomeAway ? game.away_score > game.home_score : game.away_score < game.home_score) : false;

    return (
        <div className="flex flex-col justify-center items-center bg-white px-[100px] py-4 rounded-lg shadow-md text-black min-w-[900px]">
            {includeDate && game.date ?
                <div className="flex items-center justify-between w-full">
                    <div className="w-full text-center text-black">
                        <span className="text-lg font-bold">{moment(game.date).format('YYYY/MM/DD')}</span>
                    </div>
                </div>
            : null}
            <div className="flex items-center justify-between w-full">
                {/* Team 1 */}
                {invertHomeAway
                    ? <TeamDisplay team={game.home_team} isHome={true} />
                    : <TeamDisplay team={game.away_team} isHome={false} />
                }

                {/* Scoreboard */}
                <div className={`flex items-center flex-col min-w-[400px] border-green-800 px-5 ${game.away_score ? (winnerLeft ? 'border-l-4' : 'border-r-4') : ''}`}>
                    <div className="flex flex-row items-center justify-evenly border-black border-b-[1px] w-full">
                        <ScoreboardItem value={'Team'} />
                        <ScoreboardItem value={'Q1'} />
                        <ScoreboardItem value={'Q2'} />
                        <ScoreboardItem value={'Q3'} />
                        <ScoreboardItem value={'Q4'} />
                        <ScoreboardItem value={'Total'} />
                    </div>
                    <div className="flex flex-row items-center justify-evenly w-full">
                        <ScoreboardItem value={game.away_team.char_id ?? ''} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={game.away_score.toString()} />
                    </div>
                    <div className="flex flex-row items-center justify-evenly w-full">
                        <ScoreboardItem value={game.home_team.char_id ?? ''}/>
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={'-'} />
                        <ScoreboardItem value={game.home_score.toString()} />
                    </div>
                </div>
        
                {/* Team 2 */}
                {invertHomeAway
                    ? <TeamDisplay team={game.away_team} isHome={false} />
                    : <TeamDisplay team={game.home_team} isHome={true} />
                }
            </div>
            {includeBoxscoreLink && game.id ?
                <Link className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded text-center" href={`/nfl/games/overview/${game.id}`} target='_blank'>
                    BOX SCORE
                </Link>
            : null}
        </div>
      );
}

export default GameHeader;