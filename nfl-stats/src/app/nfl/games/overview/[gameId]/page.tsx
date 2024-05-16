'use client'
import React, { ReactNode } from 'react';
import axios from '@/axiosConfig';
import GameHeader from '@/components/games/gameHeader.component';
import Game from '@/interfaces/game.interface';
import TeamStatsAtAGlance from '@/components/games/atAGlance.component';

interface Params {
    gameId: string
}

const SectionHeader: React.FunctionComponent<{ title: string }> = ({ title }) => {
    return (
        <h2 className="font-bold text-xl text-center">{title}</h2>
    );
}

const StatHeaderRow: React.FunctionComponent<{ columns: Array<String> }> = ({ columns }) => {
    return (
        <tr className="border-t border-b">
            {columns.map((column, index) => {
                return <th key={index} className={`${index === 0 ? '!w-[150px]' : 'w-auto'} text-xs`}>{column}</th>;
            })}
        </tr>
    );
}

const StatCell: React.FunctionComponent<{ value: any, additionalClassNames?: string }> = ({ value, additionalClassNames = '' }) => {
    return (
        <td
            className={`text-center text-xs ${additionalClassNames}`}
        >
            {value}
        </td>
    );
}

const PassingStatRow: React.FunctionComponent<{ passingStats: any, totalRow?: boolean }> = ({ passingStats, totalRow=false }) => {
    return (
        <tr className={`${totalRow ? 'bg-slate-300' : ''}`}>
            <StatCell value={passingStats.full_name} additionalClassNames="border-r" />
            <StatCell value={`${passingStats.passing_completions}/${passingStats.passing_attempts}`} />
            <StatCell value={`${passingStats.passing_yards} (${passingStats.passing_air_yards})`}/>
            <StatCell value={`${passingStats.yards_per_pass_attempt.toFixed(1)} (${passingStats.yards_per_pass_completion.toFixed(1)})`} />
            <StatCell value={`${passingStats.passing_touchdowns}/${passingStats.passing_interceptions}`} />
            <StatCell value={passingStats.passing_sacks} />
            <StatCell value={passingStats.passing_sack_fumbles_lost} />
            <StatCell value={passingStats.qb_rating} />
            <StatCell value={passingStats.passing_first_downs} />
            <StatCell value={passingStats.passing_epa} />
            <StatCell value={passingStats.passing_2pt_conversions} />
        </tr>
    );
}

const RushingStatRow: React.FunctionComponent<{ rushingStats: any, totalRow?: boolean }> = ({ rushingStats, totalRow=false }) => {
    return (
        <tr className={`${totalRow ? 'bg-slate-300' : ''}`}>
            <StatCell value={rushingStats.full_name} additionalClassNames="border-r" />
            <StatCell value={rushingStats.rushing_attempts} />
            <StatCell value={rushingStats.rushing_yards} />
            <StatCell value={rushingStats.yards_per_rush_attempt.toFixed(1)} />
            <StatCell value={rushingStats.rushing_touchdowns} />
            <StatCell value={rushingStats.rushing_fumbles_lost} />
            <StatCell value={rushingStats.rushing_epa} />
            <StatCell value={rushingStats.rushing_first_downs} />
            <StatCell value={rushingStats.rushing_2pt_conversions} />
        </tr>
    );
}

const ReceivingStatRow: React.FunctionComponent<{ receivingStats: any, totalRow?: boolean }> = ({ receivingStats, totalRow=false }) => {
    return (
        <tr className={`${totalRow ? 'bg-slate-300' : ''}`}>
            <StatCell value={receivingStats.full_name} additionalClassNames="border-r" />
            <StatCell value={receivingStats.receptions} />
            <StatCell value={receivingStats.receiving_yards} />
            <StatCell value={receivingStats.yards_per_reception.toFixed(1)} />
            <StatCell value={receivingStats.receiving_touchdowns} />
            <StatCell value={receivingStats.receiving_fumbles_lost} />
            <StatCell value={receivingStats.receiving_epa} />
            <StatCell value={receivingStats.receiving_first_downs} />
            <StatCell value={receivingStats.receiving_2pt_conversions} />
        </tr>
    );
}

interface StatBlockProps {
    title: string,
    stats: Array<any>,
    team_id: number,
    stat_type: string,
    columns: Array<string>
}

const StatBlock: React.FunctionComponent<StatBlockProps> = ({ title, stats, team_id, stat_type, columns }) => {
    // filter stats by team_id
    stats = stats.filter(player => player.team_id === team_id);

    // calculate totals based on stat_type
    let totalStats;
    if (stat_type === 'passing') {
        totalStats = {
            full_name: 'Total',
            passing_completions: stats.reduce((acc, player) => acc + player.passing_completions, 0),
            passing_attempts: stats.reduce((acc, player) => acc + player.passing_attempts, 0),
            passing_yards: stats.reduce((acc, player) => acc + player.passing_yards, 0),
            passing_air_yards: stats.reduce((acc, player) => acc + player.passing_air_yards, 0),
            yards_per_pass_attempt: 0,
            yards_per_pass_completion: 0,
            passing_touchdowns: stats.reduce((acc, player) => acc + player.passing_touchdowns, 0),
            passing_interceptions: stats.reduce((acc, player) => acc + player.passing_interceptions, 0),
            passing_sacks: stats.reduce((acc, player) => acc + player.passing_sacks, 0),
            passing_sack_fumbles_lost: stats.reduce((acc, player) => acc + player.passing_sack_fumbles_lost, 0),
            qb_rating: 'N/A',
            passing_first_downs: stats.reduce((acc, player) => acc + player.passing_first_downs, 0),
            passing_epa: 'N/A',
            passing_2pt_conversions: stats.reduce((acc, player) => acc + player.passing_2pt_conversions, 0)
        };

        // add per completion and per attempt
        totalStats['yards_per_pass_attempt'] = totalStats['passing_yards'] / totalStats['passing_attempts'];
        totalStats['yards_per_pass_completion'] = totalStats['passing_yards'] / totalStats['passing_completions'];
    } else if (stat_type === 'rushing') {
        totalStats = {
            full_name: 'Total',
            rushing_attempts: stats.reduce((acc, player) => acc + player.rushing_attempts, 0),
            rushing_yards: stats.reduce((acc, player) => acc + player.rushing_yards, 0),
            rushing_touchdowns: stats.reduce((acc, player) => acc + player.rushing_touchdowns, 0),
            rushing_long: Math.max(...stats.map(player => player.rushing_long)),
            rushing_first_downs: stats.reduce((acc, player) => acc + player.rushing_first_downs, 0),
            rushing_epa: 'N/A',
            rushing_2pt_conversions: stats.reduce((acc, player) => acc + player.rushing_2pt_conversions, 0),
            rushing_fumbles_lost: stats.reduce((acc, player) => acc + player.rushing_fumbles_lost, 0),
            yards_per_rush_attempt: 0
        };

        // add per attempt
        totalStats['yards_per_rush_attempt'] = totalStats['rushing_yards'] / totalStats['rushing_attempts'];
    } else if (stat_type === 'receiving') {
        totalStats = {
            full_name: 'Total',
            receptions: stats.reduce((acc, player) => acc + player.receptions, 0),
            receiving_yards: stats.reduce((acc, player) => acc + player.receiving_yards, 0),
            receiving_touchdowns: stats.reduce((acc, player) => acc + player.receiving_touchdowns, 0),
            receiving_long: Math.max(...stats.map(player => player.receiving_long)),
            receiving_first_downs: stats.reduce((acc, player) => acc + player.receiving_first_downs, 0),
            receiving_epa: 'N/A',
            receiving_2pt_conversions: stats.reduce((acc, player) => acc + player.receiving_2pt_conversions, 0),
            receiving_fumbles_lost: stats.reduce((acc, player) => acc + player.receiving_fumbles_lost, 0),
            yards_per_reception: 0
        };

        // add per reception
        totalStats['yards_per_reception'] = totalStats['receiving_yards'] / totalStats['receptions'];
    }

    return (
        <>
            <SectionHeader title={title} />
            <table className="w-full">
                <thead>
                    <StatHeaderRow columns={columns} />
                </thead>
                <tbody>
                    {/* Display passing stats here */}
                    { stats.map((player, index) => {
                        if (player.team_id !== team_id) return null;

                        if (stat_type === 'passing') {
                            return <PassingStatRow key={index} passingStats={player} />
                        }
                        if (stat_type === 'rushing') {
                            return <RushingStatRow key={index} rushingStats={player} />
                        }
                        if (stat_type === 'receiving') {
                            return <ReceivingStatRow key={index} receivingStats={player} />
                        }
                        // if (stat_type === 'defense') {
                        //     return <DefenseStatRow key={index} defenseStats={player} />
                        // }
                        // if (stat_type === 'kicking') {
                        //     return <KickingStatRow key={index} kickingStats={player} />
                        // }
                    }) }
                    {/* Display total stats here */}
                    { stat_type === 'passing' ? <PassingStatRow passingStats={totalStats} totalRow={true} /> : null }
                    { stat_type === 'rushing' ? <RushingStatRow rushingStats={totalStats} totalRow={true}  /> : null }
                    { stat_type === 'receiving' ? <ReceivingStatRow receivingStats={totalStats} totalRow={true}  /> : null }
                </tbody>
            </table>
        </>
    );
}

const passingColumns = [
    'Player',
    'Comp/Att',
    'Yards (Air)',
    'Y/A (Y/C)',
    'TD/Int',
    'Sacks',
    'F Lost',
    'QBR',
    'FDs',
    'EPA',
    '2PTC'
];

const rushingColumns = [
    'Player',
    'Rushes',
    'Yards',
    'Y/A',
    'TD',
    'F Lost',
    'EPA',
    'FDs',
    '2PTC'
];

const receivingColumns = [
    'Player',
    'Rec',
    'Yards',
    'Y/R',
    'TD',
    'F Lost',
    'EPA',
    'FDs',
    '2PTC'
];

const PlayerGamePage: React.FunctionComponent<{ params: Params }> = ({ params }) => {
    const [game, setGame] = React.useState<Game|null>(null);

    // fetch games
    React.useEffect(() => {
        const fetchGames = async () => {
            const response = await axios.get(`/game/overview/${params.gameId}`);
            setGame(response.data.game);

            console.log(response.data.game);
        }
        fetchGames();
    }, []);

    return (
        <>
            { game ? <GameHeader game={game} /> : null }
            { game ? <TeamStatsAtAGlance awayBoxscore={game.away_boxscore} homeBoxscore={game.home_boxscore} awayName={game.away_team.short_display_name} homeName={game.home_team.short_display_name} /> : null }
            { game ? 
            <div>
                <div className="grid grid-cols-2 gap-4 text-black w-[100%] mt-5 min-w-[1250px]">
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.team_name} Passing`} stats={game.player_stats.passing} team_id={game.away_team_id} stat_type='passing' columns={passingColumns}/>
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.team_name} Passing`} stats={game.player_stats.passing} team_id={game.home_team_id} stat_type='passing' columns={passingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.team_name} Rushing`} stats={game.player_stats.rushing} team_id={game.away_team_id} stat_type='rushing' columns={rushingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.team_name} Rushing`} stats={game.player_stats.rushing} team_id={game.home_team_id} stat_type='rushing' columns={rushingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.team_name} Receiving`} stats={game.player_stats.receiving} team_id={game.away_team_id} stat_type='receiving' columns={receivingColumns} />
                    </div>
                    <div>
                        <StatBlock title={`${game.home_team.team_name} Receiving`} stats={game.player_stats.receiving} team_id={game.home_team_id} stat_type='receiving' columns={receivingColumns} />
                    </div>
                </div>
            </div>
            : null }
        </>
    );
}

export default PlayerGamePage;