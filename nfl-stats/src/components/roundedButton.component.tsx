'use client'

import React from 'react'

const RoundedButton: React.FunctionComponent<{ text: string, onClick: () => void, className?: string }> = ({ text, onClick, className = null }) => {
    return (
        <button onClick={onClick} className={`border-[2px] border-goldAccent bg-gray-100 rounded-full py-1 px-4 text-mediumgreen font-bold hover:bg-gray-300${className ? ' ' + className : ''}`}>
            {text}
        </button>
    );
};

export default RoundedButton;