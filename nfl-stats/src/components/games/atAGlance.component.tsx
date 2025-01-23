import React, { ReactNode } from 'react';
import BoxScore from '@/interfaces/boxScore.interface';

/**
 * Returns the className for the table cell based on the value
 * 
 * If target stat > compare stat, add bold to class
 * 
 * @param targetStat The target stat
 * @param compareStat The stat to compare to
 * @returns string 
 */
const getTableCellClassName = (targetStat: number|string, compareStat: number|string): string => {
    return "text-center text-xs" + (targetStat > compareStat ? ' font-bold' : '');
}

const TeamStatComparisonRow: React.FunctionComponent<{ awayStat: number|string, homeStat: number|string, statName: string }> = ({ awayStat, homeStat, statName }) => {
    return (
        <tr>
            <td className={getTableCellClassName(awayStat, homeStat)}>{awayStat}</td>
            <td className="text-center text-xs">{statName}</td>
            <td className={getTableCellClassName(homeStat, awayStat)}>{homeStat}</td>
        </tr>
    );
}

const TeamStatComparisonTable: React.FunctionComponent<{ awayName: string, homeName: string, children: ReactNode }> = ({ awayName, homeName, children }) => {
    return (
        <table className="mx-auto">
            <thead>
                <tr className="border-b">
                    <th className="text-xs">{awayName}</th>
                    <th className="w-[150px] text-xs">Statistic</th>
                    <th className="text-xs">{homeName}</th>
                </tr>
            </thead>
            <tbody>
                { children }
            </tbody>
        </table>
    );
}

const TeamYardageComparison: React.FunctionComponent<{ awayBoxscore: BoxScore, homeBoxscore: BoxScore, awayName: string, homeName: string }> = ({ awayBoxscore, homeBoxscore, awayName, homeName }) => {
    return (
        <div className="w-full">
            <h2 className="font-bold text-xl text-center">{`Yardage`}</h2>
            <TeamStatComparisonTable awayName={awayName} homeName={homeName}>
                <TeamStatComparisonRow awayStat={awayBoxscore.total_offensive_yards} homeStat={homeBoxscore.total_offensive_yards} statName="Total Offensive Yards" />
                <TeamStatComparisonRow awayStat={awayBoxscore.passing_yards} homeStat={homeBoxscore.passing_yards} statName="Passing Yards" />
                <TeamStatComparisonRow awayStat={awayBoxscore.rushing_yards} homeStat={homeBoxscore.rushing_yards} statName="Rushing Yards" />
                <TeamStatComparisonRow awayStat={awayBoxscore.yards_per_play} homeStat={homeBoxscore.yards_per_play} statName="Yards Per Play" />
            </TeamStatComparisonTable>
        </div>
    )
}

const TeamDownsComparison: React.FunctionComponent<{ awayBoxscore: BoxScore, homeBoxscore: BoxScore, awayName: string, homeName: string }> = ({ awayBoxscore, homeBoxscore, awayName, homeName }) => {
    return (
        <div className="w-full">
            <h2 className="font-bold text-xl text-center">{`Downs`}</h2>
            <TeamStatComparisonTable awayName={awayName} homeName={homeName}>
                <TeamStatComparisonRow awayStat={awayBoxscore.first_downs} homeStat={homeBoxscore.first_downs} statName="First Downs" />
                <TeamStatComparisonRow awayStat={awayBoxscore.passing_first_downs} homeStat={homeBoxscore.passing_first_downs} statName="Passing First Downs" />
                <TeamStatComparisonRow awayStat={awayBoxscore.rushing_first_downs} homeStat={homeBoxscore.rushing_first_downs} statName="Rushing First Downs" />
                <TeamStatComparisonRow awayStat={awayBoxscore.third_down_conversions} homeStat={homeBoxscore.third_down_conversions} statName="Third Down Conversions" />
                <TeamStatComparisonRow awayStat={awayBoxscore.fourth_down_conversions} homeStat={homeBoxscore.fourth_down_conversions} statName="Fourth Down Conversions" />
                <TeamStatComparisonRow awayStat={awayBoxscore.red_zone_attempts} homeStat={homeBoxscore.red_zone_attempts} statName="Red Zone Attempts" />
            </TeamStatComparisonTable>
        </div>
    )
}

const TeamPosessionComparison: React.FunctionComponent<{ awayBoxscore: BoxScore, homeBoxscore: BoxScore, awayName: string, homeName: string }> = ({ awayBoxscore, homeBoxscore, awayName, homeName }) => {
    return (
        <div className="w-full">
            <h2 className="font-bold text-xl text-center">{`Possession`}</h2>
            <TeamStatComparisonTable awayName={awayName} homeName={homeName}>
                <TeamStatComparisonRow awayStat={awayBoxscore.time_of_possession} homeStat={homeBoxscore.time_of_possession} statName="Time of Possession" />
                <TeamStatComparisonRow awayStat={awayBoxscore.total_drives} homeStat={homeBoxscore.total_drives} statName="Total Drives" />
                <TeamStatComparisonRow awayStat={awayBoxscore.punts_inside_20} homeStat={homeBoxscore.punts_inside_20} statName="Punts Inside 20" />
                <TeamStatComparisonRow awayStat={awayBoxscore.turnovers} homeStat={homeBoxscore.turnovers} statName="Turnovers" />
            </TeamStatComparisonTable>
        </div>
    )
}

const TeamKickingComparison: React.FunctionComponent<{ awayBoxscore: BoxScore, homeBoxscore: BoxScore, awayName: string, homeName: string }> = ({ awayBoxscore, homeBoxscore, awayName, homeName }) => {
    return (
        <div className="w-full">
            <h2 className="font-bold text-xl text-center">{`Kicking`}</h2>
            <TeamStatComparisonTable awayName={awayName} homeName={homeName}>
                <TeamStatComparisonRow awayStat={awayBoxscore.field_goals_made} homeStat={homeBoxscore.field_goals_made} statName="Field Goals Made" />
                <TeamStatComparisonRow awayStat={awayBoxscore.field_goals_attempted} homeStat={homeBoxscore.field_goals_attempted} statName="Field Goals Attempted" />
            </TeamStatComparisonTable>
        </div>
    )
}

const TeamStatsAtAGlance: React.FunctionComponent<{ awayBoxscore: BoxScore, homeBoxscore: BoxScore, awayName: string|undefined, homeName: string|undefined }> = ({ awayBoxscore, homeBoxscore, awayName, homeName }) => {
    if (!awayName || !homeName) {
        awayName = 'Away'
        homeName = 'Home'
    }

    return (
        <div className="grid grid-cols-4 gap-4 text-black w-[100%] mt-5 min-w-[1000px]">
            <div className="min-w-[250px]">
                <TeamYardageComparison awayBoxscore={awayBoxscore} homeBoxscore={homeBoxscore} awayName={awayName} homeName={homeName} />
            </div>
            <div className="min-w-[250px]">
                <TeamDownsComparison awayBoxscore={awayBoxscore} homeBoxscore={homeBoxscore} awayName={awayName} homeName={homeName} />
            </div>
            <div className="min-w-[250px]">
                <TeamPosessionComparison awayBoxscore={awayBoxscore} homeBoxscore={homeBoxscore} awayName={awayName} homeName={homeName} />
            </div>
            <div className="min-w-[250px]">
                <TeamKickingComparison awayBoxscore={awayBoxscore} homeBoxscore={homeBoxscore} awayName={awayName} homeName={homeName} />
            </div>
        </div>
    );
}

export default TeamStatsAtAGlance;