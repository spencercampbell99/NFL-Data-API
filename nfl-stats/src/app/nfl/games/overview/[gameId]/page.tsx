'use client'
import React, { ReactNode } from 'react';
import GameHeader from '@/components/games/gameHeader.component';
import Game from '@/interfaces/game.interface';
import TeamStatsAtAGlance from '@/components/games/atAGlance.component';
import GameService from '@/services/Game.service';
import {
    PassingStats,
    RushingStats,
    ReceivingStats,
    FumblesStats,
    DefensiveStats,
    FieldGoalStats,
} from '@/interfaces/playerGameStat.interface';

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

const DefenseStatRow: React.FunctionComponent<{ defenseStats: DefensiveStats, totalRow?: boolean }> = ({ defenseStats, totalRow=false }) => {
    return (
        <tr className={`${totalRow ? 'bg-slate-300' : ''}`}>
            <StatCell value={defenseStats.full_name} additionalClassNames="border-r" />
            <StatCell value={defenseStats.tackles} />
            <StatCell value={defenseStats.sacks} />
            <StatCell value={defenseStats.interceptions} />
            <StatCell value={defenseStats.defensive_touchdowns} />
            <StatCell value={defenseStats.tackles_for_loss} />
            <StatCell value={defenseStats.pass_defended} />
            <StatCell value={defenseStats.qb_hits} />
            <StatCell value={defenseStats.fumbles_forced} />
            <StatCell value={defenseStats.def_penalty_yards} />
        </tr>
    );
}

const KickingStatRow: React.FunctionComponent<{ kickingStats: FieldGoalStats, totalRow?: boolean }> = ({ kickingStats, totalRow=false }) => {
    return (
        <tr className={`${totalRow ? 'bg-slate-300' : ''}`}>
            <StatCell value={kickingStats.full_name} additionalClassNames="border-r" />
            <StatCell value={kickingStats.fg_made} />
            <StatCell value={kickingStats.fg_att} />
            <StatCell value={kickingStats.fg_long} />
            <StatCell value={kickingStats.pat_made} />
            <StatCell value={kickingStats.pat_att} />
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
    } else if (stat_type === 'defense') {
        totalStats = {
            full_name: 'Total',
            tackles: stats.reduce((acc, player) => acc + player.tackles, 0),
            sacks: stats.reduce((acc, player) => acc + player.sacks, 0),
            interceptions: stats.reduce((acc, player) => acc + player.interceptions, 0),
            defensive_touchdowns: stats.reduce((acc, player) => acc + player.defensive_touchdowns + player.touchdowns, 0),
            tackles_for_loss: stats.reduce((acc, player) => acc + player.tackles_for_loss, 0),
            pass_defended: stats.reduce((acc, player) => acc + player.pass_defended, 0),
            qb_hits: stats.reduce((acc, player) => acc + player.qb_hits, 0),
            fumbles_forced: stats.reduce((acc, player) => acc + player.fumbles_forced, 0),
            def_penalty_yards: stats.reduce((acc, player) => acc + player.def_penalty_yards, 0),
            def_fumble_recovery_opp: stats.reduce((acc, player) => acc + (player.def_fumble_recovery_opp ?? 0), 0),
            def_safety_forced: stats.reduce((acc, player) => acc + (player.def_safety_forced ?? 0), 0),
            def_penalty: stats.reduce((acc, player) => acc + (player.def_penalty ?? 0), 0),
        } as DefensiveStats;
    } else if (stat_type === 'kicking') {
        totalStats = {
            full_name: 'Total',
            fg_made: stats.reduce((acc, player) => acc + (player.fg_made ?? player.kicking_field_goals_made ?? 0), 0),
            fg_att: stats.reduce((acc, player) => acc + (player.fg_att ?? player.kicking_field_goals_attempted ?? 0), 0),
            fg_long: Math.max(...stats.map(player => (player.fg_long ?? player.kicking_longest_field_goal ?? 0))),
            pat_made: stats.reduce((acc, player) => acc + (player.xp_made ?? player.kicking_extra_points_made ?? 0), 0),
            pat_att: stats.reduce((acc, player) => acc + (player.xp_att ?? player.kicking_extra_points_attempted ?? 0), 0),
        } as FieldGoalStats
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
                        if (stat_type === 'defense') {
                            return <DefenseStatRow key={index} defenseStats={player} />
                        }
                        if (stat_type === 'kicking') {
                            return <KickingStatRow key={index} kickingStats={player} />
                        }
                    }) }
                    {/* Display total stats here */}
                    { stat_type === 'passing' ? <PassingStatRow passingStats={totalStats} totalRow={true} /> : null }
                    { stat_type === 'rushing' ? <RushingStatRow rushingStats={totalStats} totalRow={true}  /> : null }
                    { stat_type === 'receiving' ? <ReceivingStatRow receivingStats={totalStats} totalRow={true}  /> : null }
                    { stat_type === 'defense' && totalStats ? <DefenseStatRow defenseStats={totalStats as DefensiveStats} totalRow={true}  /> : null }
                    { stat_type === 'kicking' ? <KickingStatRow kickingStats={totalStats as FieldGoalStats} totalRow={true}  /> : null }
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

const defenseColumns = [
    'Player',
    'Tackles',
    'Sacks',
    'Int',
    'TDs',
    'TFL',
    'PD',
    'QB Hits',
    'Fum. Forced',
    'Penalty Yards',
]

const kickingColumns = [
    'Player',
    'FG Made',
    'FG Att',
    'Long',
    'XP Made',
    'XP Att',
];

const GameOverviewPage: React.FunctionComponent<{ params: Params }> = ({ params }) => {
    const [game, setGame] = React.useState<Game|null>(null);

    // fetch games
    React.useEffect(() => {
        const fetchGames = async () => {
            const response = await GameService.gameOverview(params.gameId);
            setGame(response.game);
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
                        <StatBlock title={`${game.away_team.short_display_name} Passing`} stats={game.player_stats.passing} team_id={game.away_team_id} stat_type='passing' columns={passingColumns}/>
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.short_display_name} Passing`} stats={game.player_stats.passing} team_id={game.home_team_id} stat_type='passing' columns={passingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.short_display_name} Rushing`} stats={game.player_stats.rushing} team_id={game.away_team_id} stat_type='rushing' columns={rushingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.short_display_name} Rushing`} stats={game.player_stats.rushing} team_id={game.home_team_id} stat_type='rushing' columns={rushingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.short_display_name} Receiving`} stats={game.player_stats.receiving} team_id={game.away_team_id} stat_type='receiving' columns={receivingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.short_display_name} Receiving`} stats={game.player_stats.receiving} team_id={game.home_team_id} stat_type='receiving' columns={receivingColumns} />
                    </div>
                    {/* Disclaimer that defense stats are WIP */}
                    <div className="col-span-2 text-center text-sm italic text-gray-600">
                        Defensive and Kicking player stats are a work in progress and may be incomplete or inaccurate.
                    </div>
                    {/* Defense stats */}
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.short_display_name} Defense`} stats={game.player_stats.defensive} team_id={game.away_team_id} stat_type='defense' columns={defenseColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.short_display_name} Defense`} stats={game.player_stats.defensive} team_id={game.home_team_id} stat_type='defense' columns={defenseColumns} />
                    </div>
                    {/* Kicking stats */}
                    <div className="w-full">
                        <StatBlock title={`${game.away_team.short_display_name} Kicking`} stats={game.player_stats.kicking} team_id={game.away_team_id} stat_type='kicking' columns={kickingColumns} />
                    </div>
                    <div className="w-full">
                        <StatBlock title={`${game.home_team.short_display_name} Kicking`} stats={game.player_stats.kicking} team_id={game.home_team_id} stat_type='kicking' columns={kickingColumns} />
                    </div>
                </div>
            </div>
            : null }
        </>
    );
}

export default GameOverviewPage;