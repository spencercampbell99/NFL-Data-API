'use client'

import React from 'react'
import RoundedButton from "@/components/roundedButton.component"
import { BasicDropdown, SelectTeamDropdown } from "@/components/commonDropdowns"
import TeamService from '@/services/Team.service'
import ScoreModelService from '@/services/ScoreModel.service'
import Team from '@/interfaces/team.interface'

// seasons 2010-2023
const seasons = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
const weeksToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export default function ScoreModelAnalysis() {
    const [season, setSeason] = React.useState<number>(-1);
    const [weeks, setWeeks] = React.useState<number[]>([]);
    const [selectedTeams, setSelectedTeams] = React.useState<number[]>([]);
    const [teams, setTeams] = React.useState<Team[]>([]);

    React.useEffect(() => {
        TeamService.listTeams().then((data) => {
            setTeams(data)
        });
    }, []);

    const analyze = () => {
        try {
            ScoreModelService.getScoreModelResults(season, weeks, selectedTeams).then((data: any) => {
                console.log(data);
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
                    Note that results will skew. The model is trained up until the previous season, so current season results are accurate, but past seasons may show better performance since their data was used for training.
                </p>
            </div>
            <div className="flex flex-row items-center justify-center mt-4">
                <BasicDropdown options={seasons} selected={season} setSelected={setSeason} alternateDefaultText="Select a Season" />
                <div className="ml-2"></div>
                {season > 2000 ? 
                    <>
                        <BasicDropdown options={weeksToShow} selected={weeks} setSelected={setWeeks} alternateDefaultText={weeks ? weeks.toString() : "Select Weeks"} multiSelect={true} provideSelectAllButton={true} />
                        <div className="ml-2"></div>
                    </>
                : null }
                <SelectTeamDropdown teams={teams} team={selectedTeams} setTeam={setSelectedTeams} multiSelect={true} />
                <div className="ml-2"></div>
                <RoundedButton text="Analyze" onClick={analyze}  />
            </div>
        </div>
    )
}