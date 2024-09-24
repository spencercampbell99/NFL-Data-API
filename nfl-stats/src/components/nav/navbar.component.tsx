'use client'

import Image from 'next/image';
import NavbarLink from './navbarLink.component';
import NavbarDropdown from './navbarDropdown.component';
import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarDropdowns {
    [key: string]: {
        title: string,
        links: React.ReactNode,
        active: boolean
    }
}

const Navbar: FunctionComponent<{}> = () => {
    const [dropdowns, setDropdowns] = React.useState<NavbarDropdowns>({
        games: {
            title: 'Games',
            links: (
                <>
                    <NavbarLink href="/nfl/games/2024/1">
                        Week Breakdowns
                    </NavbarLink>
                    <NavbarLink href="/nfl/games/2024/1/model_performance">
                        Weekly Model Performance
                    </NavbarLink>
                </>
            ),
            active: false
        },
        players: {
            title: 'Players',
            links: (
                <>
                    <NavbarLink href="/nfl/players/game/">
                        Game Breakdowns
                    </NavbarLink>
                    <NavbarLink href="/nfl/players">
                        Player Overviews
                    </NavbarLink>
                </>
            ),
            active: false
        },
        teams: {
            title: 'Teams',
            links: (
                <>
                    <NavbarLink href="/nfl/teams/historical-matchups">
                        Historical Matchups
                    </NavbarLink>
                </>
            ),
            active: false
        },
        models: {
            title: 'Models',
            links: (
                <>
                    <NavbarLink href="/nfl/models/score/analysis">
                        Model Analysis
                    </NavbarLink>
                    <NavbarLink href="/nfl/models/score/week-predictions">
                        Predictions By Week
                    </NavbarLink>
                </>
            ),
            active: false
        }
    })

    // toggle the dropdown menu and disable all other dropdowns
    const toggleActiveDropdown = (dropdown: string) => {
        dropdown = dropdown.toLowerCase();

        // disable all other dropdowns
        for (const dropdownKey in dropdowns) {
            if (dropdowns[dropdownKey]['title'].toLowerCase() === dropdown.toLowerCase()) {
                console.log(dropdown);
                continue;
            }

            dropdowns[dropdownKey].active = false;
        }

        setDropdowns(prevState => ({
            ...prevState,
            [dropdown]: {
                ...prevState[dropdown],
                active: !prevState[dropdown].active
            }
        }));
    };

    // close all dropdowns when route has changed
    const pathname = usePathname();
    React.useEffect(() => {
        setDropdowns(prevState => {
            const newState = { ...prevState };
            for (const dropdown in newState) {
                newState[dropdown].active = false;
            }
            return newState;
        });
    }, [pathname]);

    return (
        <nav className="bg-gradient-to-b from-mediumGreen to-darkGreen h-[75px] max-h-[75px] align-middle">
            <Link href="/"><Image src="/rectangle-logo.png" alt="Logo" width={125} height={100} className="absolute pl-3 pt-[6px]" /></Link>
            <ul className="flex justify-center space-x-4 py-6">
                <li>
                    <NavbarLink href="/">
                        Home
                    </NavbarLink>
                </li>
                <li>
                    <NavbarDropdown title={dropdowns.games.title} isActive={dropdowns.games.active} toggleActive={() => toggleActiveDropdown('games')}>
                        {dropdowns.games.links}
                    </NavbarDropdown>
                </li>
                <li>
                    <NavbarDropdown title={dropdowns.players.title} isActive={dropdowns.players.active} toggleActive={() => toggleActiveDropdown('players')}>
                        {dropdowns.players.links}
                    </NavbarDropdown>
                </li>
                <li>
                    <NavbarDropdown title={dropdowns.teams.title} isActive={dropdowns.teams.active} toggleActive={() => toggleActiveDropdown('teams')}>
                        {dropdowns.teams.links}
                    </NavbarDropdown>
                </li>
                <li>
                    <NavbarDropdown title={dropdowns.models.title} isActive={dropdowns.models.active} toggleActive={() => toggleActiveDropdown('models')}>
                        {dropdowns.models.links}
                    </NavbarDropdown>
                </li>
                <li className="float-right">
                    <NavbarLink href="/profile">
                        Profile
                    </NavbarLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
