'use client'

import React, { useState, useRef, useEffect } from "react";
import Team from "@/interfaces/team.interface";

const BaseDropdown: React.FunctionComponent<{ options: { value: number, label: string }[], selected: number | number[], setSelected: any, multiSelect?: boolean, alternateDefaultText?: string, provideSelectAllButton?: boolean }> = ({ options, selected, setSelected, multiSelect = false, alternateDefaultText = "Select a Value", provideSelectAllButton = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSingleSelect = (selectedValue: number) => {
        setSelected(selectedValue);
    };

    const handleMultiSelect = (selectedValue: number) => {
        let updatedValues;
        if (Array.isArray(selected)) {
            if (selected.includes(selectedValue)) {
                updatedValues = selected.filter(v => v !== selectedValue);
            } else {
                updatedValues = [...selected, selectedValue];
            }
        } else {
            updatedValues = [selectedValue];
        }
        setSelected(updatedValues);
    };

    const isSelected = (value: number) => {
        return Array.isArray(selected) ? selected.includes(value) : selected === value;
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!multiSelect) {
        return (
            <div className="w-64 text-black">
                <select
                    value={selected as number}
                    onChange={(e) => handleSingleSelect(parseInt(e.target.value, 10))}
                    className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="-1">{alternateDefaultText}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="w-64 text-black relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {alternateDefaultText}
            </button>
            {isOpen && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10">
                    {provideSelectAllButton && (
                        <label className="flex items-center p-2 hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={typeof selected == "object" && options.length === selected.length}
                                onChange={() => {
                                    if (typeof selected == "object" && options.length === selected.length) {
                                        setSelected([]);
                                    } else {
                                        setSelected(options.map(option => option.value));
                                    }
                                }}
                                className="mr-2"
                            />
                            Select All
                        </label>
                    )}
                    {options.map((option) => (
                        <label key={option.value} className="flex items-center p-2 hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={isSelected(option.value)}
                                onChange={() => handleMultiSelect(option.value)}
                                className="mr-2"
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};
interface SelectTeamDropdownProps {
    teams: Team[];
    team: number | number[];
    setTeam: any;
    multiSelect?: boolean;
}

const SelectTeamDropdown: React.FunctionComponent<SelectTeamDropdownProps> = ({ teams, team, setTeam, multiSelect = false }) => {
    const options = teams.map((team) => ({ value: team.id, label: team.short_display_name }));

    return <BaseDropdown options={options} selected={team} setSelected={setTeam} multiSelect={multiSelect} alternateDefaultText={multiSelect ? (team ? team.toString() : "Select Teams") : "Select a Team"} />;
}

const BasicDropdown: React.FunctionComponent<{ options: number[], selected: number | number[], setSelected: any, alternateDefaultText?: string, multiSelect?: boolean, provideSelectAllButton?: boolean }> = ({ options, selected, setSelected, alternateDefaultText = "Select a value", multiSelect = false, provideSelectAllButton = false }) => {
    const dropdownOptions = options.map((option) => ({ value: option, label: option.toString() }));

    return <BaseDropdown options={dropdownOptions} selected={selected} setSelected={setSelected} alternateDefaultText={alternateDefaultText} multiSelect={multiSelect} provideSelectAllButton={provideSelectAllButton} />;
}

export {
    SelectTeamDropdown,
    BasicDropdown
}