import React from "react";

const DateRangePicker: React.FunctionComponent<{ startDate: string, endDate: string, setStartDate: any, setEndDate: any }> = ({ startDate, endDate, setStartDate, setEndDate }) => {
    return (
        <div className="flex space-x-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-32 p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
            <span className="text-black font-bold my-auto">through</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-32 p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
        </div>
    )
}

export { DateRangePicker }