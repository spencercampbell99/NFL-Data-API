'use client'

import React, { useState } from 'react'
import RoundedButton from "@/components/roundedButton.component"
import { BasicDropdown, SelectTeamDropdown } from "@/components/commonDropdowns"
import TeamService from '@/services/Team.service'
import ScoreModelService from '@/services/ScoreModel.service'
import Team from '@/interfaces/team.interface'
import { HiInformationCircle } from "react-icons/hi";

interface StatsContainerProps {
    total_games: number;
    total_weeks: number;
    correct_winner_count: number;
    correct_spread_count: number;
    correct_over_under_count: number;
    total_error_sum: number;
    avg_total_error: number;
    avg_total_score: number;
    overall_correct_winner_rate: number;
    home_correct_winner_rate: number;
    away_correct_winner_rate: number;
    total_return_rate_moneyline: number;
    total_return_over_under: number;
    total_return_spread: number;
    roi_per_week_moneyline: number[];
    roi_per_week_over_under: number[];
    roi_per_week_spread: number[];
}

const InfoTooltip: React.FC<{ helpText: string }> = ({ helpText }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative inline-block" onClick={() => setVisible(!visible)}>
            <HiInformationCircle className="text-gray-500 cursor-pointer" />
            {visible && (
                <div className="absolute z-10 text-sm bg-gray-800 text-white rounded-lg p-2 bottom-8 left-1/2 transform -translate-x-1/2 w-48">
                    {helpText}
                </div>
            )}
        </div>
    );
}

const StatsContainer: React.FC<StatsContainerProps> = (props) => {
    const [cumulativeRoi, setCumulativeRoi] = React.useState<{ moneyline: number, overUnder: number, spread: number }>({
        moneyline: 0,
        overUnder: 0,
        spread: 0
    });

    React.useEffect(() => {
        // calculate cumulative ROI based on weekly ROI which is an array containing ROI for each week in order
        let moneylineCapital = 1;
        let overUnderCapital = 1;
        let spreadCapital = 1;

        props.roi_per_week_moneyline.forEach((roi) => {
            moneylineCapital *= 1 + roi / 100;
        });

        props.roi_per_week_over_under.forEach((roi) => {
            overUnderCapital *= 1 + roi / 100;
        });

        props.roi_per_week_spread.forEach((roi) => {
            spreadCapital *= 1 + roi / 100;
        });

        setCumulativeRoi({
            moneyline: (moneylineCapital - 1) * 100,
            overUnder: (overUnderCapital - 1) * 100,
            spread: (spreadCapital - 1) * 100
        });
    }, [props]);

    const stats = [
        { label: 'Total Games', value: props.total_games, helpText: 'Total number of games analyzed' },
        { label: 'Correct Winner Count', value: props.correct_winner_count, helpText: 'Number of games where the correct winner was predicted' },
        { label: 'Correct Spread Count', value: props.correct_spread_count, helpText: 'Number of games where the correct spread was predicted' },
        { label: 'Correct Over/Under Count', value: props.correct_over_under_count, helpText: 'Number of games where the correct over/under was predicted' },
        { label: 'Total Error Sum', value: props.total_error_sum, helpText: 'Sum of the absolute value of the error between predicted total score and actual total score' },
        { label: 'Avg Total Error', value: props.avg_total_error, helpText: 'Average error between predicted total score and actual total score' },
        { label: 'Avg Total Score', value: props.avg_total_score, helpText: 'Average total score of all games' },
        { label: 'Overall Correct Winner Rate', value: `${Number(props.overall_correct_winner_rate).toFixed(2)}%`, helpText: 'Percentage of games where the correct winner was predicted' },
        { label: 'Home Correct Winner Rate', value: `${Number(props.home_correct_winner_rate).toFixed(2)}%`, helpText: 'Percentage of games where the correct winner was predicted for the home team' },
        { label: 'Away Correct Winner Rate', value: `${Number(props.away_correct_winner_rate).toFixed(2)}%`, helpText: 'Percentage of games where the correct winner was predicted for the away team' },
        { label: 'Total Return Rate Moneyline', value: props.total_return_rate_moneyline > 0 ? `+${Number(props.total_return_rate_moneyline).toFixed(2)}%` : `${Number(props.total_return_rate_moneyline).toFixed(2)}%`, helpText: 'ROI for moneyline bets assuming static bet size betting with model every time.' },
        { label: 'Total Return Over/Under', value: props.total_return_over_under > 0 ? `+${Number(props.total_return_over_under).toFixed(2)}%` : `${Number(props.total_return_over_under).toFixed(2)}%`, helpText: 'ROI for over/under bets assuming static bet size betting with model every time.' },
        { label: 'Total Return Spread', value: props.total_return_spread > 0 ? `+${Number(props.total_return_spread).toFixed(2)}%` : `${Number(props.total_return_spread).toFixed(2)}%`, helpText: 'ROI for spread bets assuming static bet size betting with model every time.' },
        { label: 'Cumulative ROI Moneyline', value: cumulativeRoi.moneyline > 0 ? `+${Number(cumulativeRoi.moneyline).toFixed(2)}%` : `${Number(cumulativeRoi.moneyline).toFixed(2)}%`, helpText: 'Cumulative ROI for moneyline bets assuming reinvestment of winnings each week.' },
        { label: 'Cumulative ROI Over/Under', value: cumulativeRoi.overUnder > 0 ? `+${Number(cumulativeRoi.overUnder).toFixed(2)}%` : `${Number(cumulativeRoi.overUnder).toFixed(2)}%`, helpText: 'Cumulative ROI for over/under bets assuming reinvestment of winnings each week.' },
        { label: 'Cumulative ROI Spread', value: cumulativeRoi.spread > 0 ? `+${Number(cumulativeRoi.spread).toFixed(2)}%` : `${Number(cumulativeRoi.spread).toFixed(2)}%`, helpText: 'Cumulative ROI for spread bets assuming reinvestment of winnings each week.' }
    ];

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md max-w-4xl mx-auto my-8">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Statistics Overview</h1>
            <div className="grid grid-cols-2 gap-4 w-full">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-lg shadow text-center relative">
                        <div className="text-sm text-gray-500 mb-2 flex justify-center items-center">
                            {stat.label}
                            <InfoTooltip helpText={stat.helpText} />
                        </div>
                        <div className="text-lg font-semibold text-gray-800">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// seasons
const seasons = [2023];
const weeksToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export default function ScoreModelAnalysis() {
    const [season, setSeason] = React.useState<number>(-1);
    const [weeks, setWeeks] = React.useState<number[]>([]);
    const [selectedTeams, setSelectedTeams] = React.useState<number[]>([]);
    const [teams, setTeams] = React.useState<Team[]>([]);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        TeamService.listTeams().then((data) => {
            setTeams(data)
        });
    }, []);

    const analyze = () => {
        try {
            ScoreModelService.getScoreModelResults(season, weeks, selectedTeams).then((data: any) => {
                console.log(data)
                setStats(data);
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col text-black">
            <h1 className="text-4xl font-bold text-center">Score Model Analysis</h1>
            <div className="flex flex-col items-center justify-center mt-4">
                <p className="text-center">
                    Here you can analyze the performance of the score model against actual game results. You may filter the results by season, week, and teams.
                    <br />
                    Note that model is trained on historcal data, so analyzing years before 2023 would provide skewed results.
                    <br />
                    Note that Cumulative ROI calculation is broken when filtering by teams.
                </p>
            </div>
            <div className="flex flex-row items-center justify-center mt-4">
                <BasicDropdown options={seasons} selected={season} setSelected={setSeason} alternateDefaultText="Select a Season" />
                <div className="ml-2"></div>
                {season > 2000 ? 
                    <>
                        <BasicDropdown options={weeksToShow} selected={weeks} setSelected={setWeeks} alternateDefaultText={weeks.length > 0 ? weeks.toString() : "All Weeks"} multiSelect={true} provideSelectAllButton={true} />
                        <div className="ml-2"></div>
                    </>
                : null }
                <SelectTeamDropdown teams={teams} team={selectedTeams} setTeam={setSelectedTeams} multiSelect={true} alternateDefaultText={"All Teams"} />
                <div className="ml-2"></div>
                <RoundedButton text="Analyze" onClick={analyze}  />
            </div>
            {stats && (
                <StatsContainer
                    total_games={stats.total_games}
                    total_weeks={stats.total_weeks}
                    correct_winner_count={stats.correct_winner_count}
                    correct_spread_count={stats.correct_spread_count}
                    correct_over_under_count={stats.correct_over_under_count}
                    total_error_sum={stats.total_error_sum}
                    avg_total_error={stats.avg_total_error}
                    avg_total_score={stats.avg_total_score}
                    overall_correct_winner_rate={stats.overall_correct_winner_rate}
                    home_correct_winner_rate={stats.home_correct_winner_rate}
                    away_correct_winner_rate={stats.away_correct_winner_rate}
                    total_return_rate_moneyline={stats.total_return_rate_moneyline}
                    total_return_over_under={stats.total_return_over_under}
                    total_return_spread={stats.total_return_spread}
                    roi_per_week_moneyline={stats.roi_per_week_moneyline.split(',').map(Number)}
                    roi_per_week_over_under={stats.roi_per_week_over_under.split(',').map(Number)}
                    roi_per_week_spread={stats.roi_per_week_spread.split(',').map(Number)}
                />
            )}
        </div>
    )
}
