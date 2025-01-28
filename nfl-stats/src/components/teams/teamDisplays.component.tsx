import React from "react";
import Team from "@/interfaces/team.interface";

const BasicTeamCard: React.FunctionComponent<{ team: Team }> = ({ team }) => {
    return (
        <div className="w-[200px] h-[155px] bg-white shadow-md rounded-md p-4 text-black">
            {/* <img src={team.team_logo_wikipedia} alt={team.short_display_name} className="h-[50px] mx-auto" /> */}
            <div className="text-center text-lg font-bold mt-2">{team.name}</div>
            <div className="text-center text-sm font-light">{team.division}</div>
        </div>
    );
}

export { BasicTeamCard }