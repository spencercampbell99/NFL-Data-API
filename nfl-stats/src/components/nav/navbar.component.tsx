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
                    <NavbarLink href="/nfl/games/2023/15">
                        Week Breakdowns
                    </NavbarLink>
                    <NavbarLink href="/nfl/games/2023/15/model_performance">
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
    })

    // toggle the dropdown menu
    const toggleActiveDropdown = (dropdown: string) => {
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
            </ul>
        </nav>
    );
};

export default Navbar;
