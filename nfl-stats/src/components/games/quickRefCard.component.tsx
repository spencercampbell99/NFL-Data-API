import TeamStatsAtAGlance from '@/components/games/atAGlance.component';
import Game from '@/interfaces/game.interface';
import GameHeader from './gameHeader.component';

const QuickRefCard: React.FunctionComponent<{ game: Game }> = ({ game }) => {
    return (
        <div className="max-w-[500px]">
            <GameHeader game={game} />
            <TeamStatsAtAGlance awayBoxscore={game.away_boxscore} homeBoxscore={game.home_boxscore} awayName={game.away_team.team_name} homeName={game.home_team.team_name} />
        </div>
    )
}

export default QuickRefCard;