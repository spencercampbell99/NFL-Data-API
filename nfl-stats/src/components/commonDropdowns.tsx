import React from "react";
import Team from "@/interfaces/team.interface";

const SelectTeamDropdown: React.FunctionComponent<{ teams: Team[], team: string, setTeam: any }> = ({ teams, team, setTeam }) => {
    return (
        <div className="w-64 text-black">
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black">
                <option value="-1">Select a team</option>
                {teams.map((team: Team) => (
                    <option key={team.id} value={team.id}>{team.short_display_name}</option>
                ))}
            </select>
        </div>
    )
}

export { SelectTeamDropdown }