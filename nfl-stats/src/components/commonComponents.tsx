import React from "react";
import RoundedButton from "./roundedButton.component";
import { BasicDropdown } from "./commonDropdowns";

const DateRangePicker: React.FunctionComponent<{ startDate: string, endDate: string, setStartDate: any, setEndDate: any }> = ({ startDate, endDate, setStartDate, setEndDate }) => {
    return (
        <div className="flex space-x-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-32 p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
            <span className="text-black font-bold my-auto">through</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-32 p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
        </div>
    )
}

const defaultSeasons = [
    2023, 2024, 2025, 2026
]

const defaultWeeks = Array.from({ length: 18 }, (_, i) => i + 1);

const SeasonWeekSelector: React.FunctionComponent<{ overrideSeasons?: number[], overrideWeeks?: number[], season: number, week: number, setSeason: any, setWeek: any, buttonText: string, onClick: any, className?: string }> = ({ overrideSeasons, overrideWeeks, season, week, setSeason, setWeek, buttonText, onClick, className = '' }) => {
    const seasons = overrideSeasons || defaultSeasons;
    const weeks = overrideWeeks || defaultWeeks;

    return (
        <div className={`flex flex-row items-center justify-center gap-2 mt-2 text-black ${className}`}>
            <BasicDropdown options={seasons} selected={season} setSelected={setSeason} alternateDefaultText="Select a Season" />
            <div className="ml-2"></div>
            <BasicDropdown options={weeks} selected={week} setSelected={setWeek} multiSelect={false} provideSelectAllButton={false} />
            <div className="ml-2"></div>
            <RoundedButton text={buttonText} onClick={onClick} />
        </div>
    )
}

export { DateRangePicker, SeasonWeekSelector };