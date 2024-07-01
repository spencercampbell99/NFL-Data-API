import React from 'react'

const LeftTabs = ({ tabs, selectedTab, setSelectedTab }: { tabs: string[], selectedTab: string, setSelectedTab: (tab: string) => void }) => {
    return (
        <div className="w-1/4 bg-white p-4 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
            <ul>
                {tabs.map((tab, index) => (
                    <li 
                        key={index}
                        className={`p-2 cursor-pointer ${selectedTab === tab ? 'font-bold' : ''}`} 
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default LeftTabs
