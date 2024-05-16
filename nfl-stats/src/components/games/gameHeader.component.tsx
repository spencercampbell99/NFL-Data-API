import React from 'react'
import Game from '@/interfaces/game.interface'
import moment from 'moment';
import Link from 'next/link';

const ScoreboardItem: React.FunctionComponent<{ value: string }> = ({ value }) => {
    return (
        <span className="flex-1 text-center">{value}</span>
    );

}

const GameHeader: React.FunctionComponent<{ game: Game, includeDate?: boolean, includeBoxscoreLink?: boolean }> = ({ game, includeDate = true, includeBoxscoreLink = false }) => {
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
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold min-w-[140px]">{game.away_team.short_display_name} (A)</span>
                    <img src={game.away_team.team_logo_wikipedia} alt="Logo" className="w-8 h-8" />
                    <span className="text-3xl font-bold pl-4">{game.away_score}</span>
                </div>

                {/* Scoreboard */}
                <div className="flex items-center flex-col min-w-[400px]">
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
                <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold pr-4">{game.home_score}</span>
                    <img src={game.home_team.team_logo_wikipedia} alt="Logo" className="w-8 h-8" />
                    <span className="text-lg font-bold text-right min-w-[140px]">{game.home_team.short_display_name} (H)</span>
                </div>
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