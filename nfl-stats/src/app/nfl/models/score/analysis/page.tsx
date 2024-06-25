'use client'

import React from 'react'
import RoundedButton from "@/components/roundedButton.component"
import { BasicDropdown, SelectTeamDropdown } from "@/components/commonDropdowns"
import TeamService from '@/services/Team.service'
import Team from '@/interfaces/team.interface'

export default function ScoreModelAnalysis() {
    const [season, setSeason] = React.useState<number>(-1);
    const [week, setWeek] = React.useState<number>(-1);
    const [selectedTeams, setSelectedTeams] = React.useState<number[]>([]);
    const [teams, setTeams] = React.useState<Team[]>([]);

    React.useEffect(() => {
        TeamService.listTeams().then((data) => {
            setTeams(data)
        });
    }, []);

    return (
        <div className="flex flex-col text-black">
            <h1 className="text-4xl font-bold text-center">Score Model Analysis</h1>
            <div className="flex flex-col items-center justify-center mt-4">
                <p className="text-center">
                    Here you can analyze the performance of the score model against actual game results. You may filter the results by season, week, and teams.
                </p>
            </div>
            <div className="flex flex-row items-center justify-center mt-4">
                <BasicDropdown options={[2021, 2022, 2023]} selected={season} setSelected={setSeason} alternateDefaultText="Select a Season" />
                <div className="ml-2"></div>
                {season > 2000 ? 
                    <>
                        <BasicDropdown options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]} selected={week} setSelected={setWeek} alternateDefaultText="Select Weeks" multiSelect={true} provideSelectAllButton={true} />
                        <div className="ml-2"></div>
                    </>
                : null }
                <SelectTeamDropdown teams={teams} team={selectedTeams} setTeam={setSelectedTeams} multiSelect={true} />
                <div className="ml-2"></div>
                <RoundedButton text="Analyze" onClick={() => {}} />
            </div>
        </div>
    )
}