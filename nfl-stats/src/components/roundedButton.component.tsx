'use client'

import React from 'react'

const RoundedButton: React.FunctionComponent<{ text: string, onClick: () => void, className?: string, overrideStyles?: boolean }> = ({ text, onClick, className = null, overrideStyles = false }) => {
    const classNameString = overrideStyles ? '' : 'border-[2px] border-goldAccent bg-gray-100 rounded-full py-1 px-4 text-mediumgreen font-bold hover:bg-gray-300';

    return (
        <button onClick={onClick} className={`${classNameString} ${className}`}>
            {text}
        </button>
    );
};

export default RoundedButton;