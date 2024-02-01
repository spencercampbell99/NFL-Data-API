import React from 'react'
import Game from '@/interfaces/game.interface'

const ScoreboardItem: React.FunctionComponent<{ value: string }> = ({ value }) => {
    return (
        <span className="flex-1 text-center">{value}</span>
    );

}

const GameHeader: React.FunctionComponent<{ game: Game }> = ({ game }) => {
    return (
        <div className="flex justify-center items-center bg-white px-[100px] py-4 rounded-lg shadow-md text-black min-w-[900px]">
          <div className="flex items-center justify-between w-full">
            {/* Team 1 */}
            <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{game.away_team.team_name}</span>
                <img src={game.away_team.wiki_logo_url} alt="Logo" className="w-8 h-8" />
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
                    <ScoreboardItem value={game.away_team_char_id} />
                    <ScoreboardItem value={'-'} />
                    <ScoreboardItem value={'-'} />
                    <ScoreboardItem value={'-'} />
                    <ScoreboardItem value={'-'} />
                    <ScoreboardItem value={game.away_score.toString()} />
                </div>
                <div className="flex flex-row items-center justify-evenly w-full">
                    <ScoreboardItem value={game.home_team_char_id}/>
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
                <img src={game.home_team.wiki_logo_url} alt="Logo" className="w-8 h-8" />
                <span className="text-lg font-bold">{game.home_team.team_name}</span>
            </div>
          </div>
        </div>
      );
}

export default GameHeader;