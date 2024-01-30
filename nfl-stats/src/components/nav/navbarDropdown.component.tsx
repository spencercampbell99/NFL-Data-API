import React from 'react';

type NavbarDropdownProps = {
    title: string;
    isActive: boolean;
    toggleActive: any;
    children?: React.ReactNode;
};

const NavbarDropdown: React.FunctionComponent<NavbarDropdownProps> = ({ title, isActive, toggleActive, children }) => {
    return (
        <>
            <div className="relative inline-block text-left">
                <div>
                    <button type="button" onClick={toggleActive} className="inline-flex justify-center w-auto rounded-md border border-gray-300 shadow-sm px-4 py-1 bg-mediumGreen text-sm font-medium text-offWhite hover:bg-darkGreen">
                        {title}
                    </button>
                </div>

                {isActive ? (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-nflGreen ring-1 ring-black ring-opacity-5">
                        <div className="p-1 text-center flex flex-col">
                            {children}
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    )
}

export default NavbarDropdown;