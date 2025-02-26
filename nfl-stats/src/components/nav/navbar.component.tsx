'use client'

import Image from 'next/image';
import NavbarLink from './navbarLink.component';
import NavbarDropdown from './navbarDropdown.component';
import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/Auth.context';
import { NavRequirements } from '@/interfaces/component_interfaces/navComponents.interface';
import AuthService from '@/services/Auth.service';

interface NavbarDropdowns {
    [key: string]: {
        title: string,
        active: boolean,
        requireAuth?: boolean
    }
}

const baseDropdowns = {
    games: {
        title: 'Games',
        active: false
    },
    players: {
        title: 'Players',
        active: false
    },
    teams: {
        title: 'Teams',
        active: false,
        requireAuth: true
    },
    models: {
        title: 'Models',
        active: false
    }
}

interface NavListItemProps {
    children: React.ReactNode;
    navRequirements?: NavRequirements|null;
    className?: string;
}

const NavListItem: React.FunctionComponent<NavListItemProps> = ({ children, navRequirements, className = '' }) => {
    if (navRequirements) {
        if (!AuthService.handleNavRequirements(navRequirements)) {
            return null;
        }
    }

    return (
        <li className={className}>
            {children}
        </li>
    );
}

const Navbar: FunctionComponent<{}> = () => {
    const { user, logout } = useAuth()

    const [dropdowns, setDropdowns] = React.useState<NavbarDropdowns>(baseDropdowns);

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

    const requireAuthObject: NavRequirements = {
        requireAuth: true,
        user: user
    }

    const requireNotAuthObject: NavRequirements = {
        requireNotAuth: true,
        user: user
    }

    return (
        <nav className="bg-gradient-to-b from-mediumGreen to-darkGreen h-[75px] max-h-[75px] align-middle">
            <Link href="/"><Image src="/rectangle-logo.png" alt="Logo" width={125} height={100} className="absolute pl-3 pt-[6px]" /></Link>
            <ul className="flex justify-center space-x-4 py-6">
                <NavListItem>
                    <NavbarLink href="/">
                        Home
                    </NavbarLink>
                </NavListItem>
                <NavListItem>
                    <NavbarDropdown title={dropdowns.games.title} isActive={dropdowns.games.active} toggleActive={() => toggleActiveDropdown('games')}>
                        <NavbarLink href="/nfl/games/2024/1" className={user ? 'border-b-[1px] border-nflWhite' : ''}>
                            Weekly Games
                        </NavbarLink>
                        <NavbarLink href="/nfl/games/2024/1/sportsbook-performance" className={"border-b-[1px] border-nflWhite"} navRequirements={requireAuthObject}>
                            Weekly Sportsbook Performance
                        </NavbarLink>
                        <NavbarLink href="/nfl/games/2024/1/model_performance" navRequirements={requireAuthObject}>
                            Weekly Historical Model Performance
                        </NavbarLink>
                    </NavbarDropdown>
                </NavListItem>
                <NavListItem>
                    <NavbarDropdown title={dropdowns.players.title} isActive={dropdowns.players.active} toggleActive={() => toggleActiveDropdown('players')}>
                        <NavbarLink href="/nfl/players">
                            Player Overviews
                        </NavbarLink>
                    </NavbarDropdown>
                </NavListItem>
                <NavListItem navRequirements={requireAuthObject}>
                    <NavbarDropdown title={dropdowns.teams.title} isActive={dropdowns.teams.active} toggleActive={() => toggleActiveDropdown('teams')}>
                        <NavbarLink href="/nfl/teams/historical-matchups">
                            Historical Matchups
                        </NavbarLink>
                    </NavbarDropdown>
                </NavListItem>
                <NavListItem navRequirements={requireAuthObject}>
                    <NavbarDropdown title={dropdowns.models.title} isActive={dropdowns.models.active} toggleActive={() => toggleActiveDropdown('models')}>
                        <NavbarLink href="/nfl/models/score/analysis" className={"border-b-[1px] border-nflWhite"}>
                            Model Analysis
                        </NavbarLink>
                        <NavbarLink href="/nfl/models/score/week-predictions">
                            Predictions By Week
                        </NavbarLink>
                    </NavbarDropdown>
                </NavListItem>
                <NavListItem className="float-right" navRequirements={requireAuthObject}>
                    <NavbarLink href="/profile">
                        Profile
                    </NavbarLink>
                </NavListItem>
                <NavListItem className="float-right" navRequirements={requireNotAuthObject}>
                    <NavbarLink href="/auth/login">
                        Login
                    </NavbarLink>
                </NavListItem>
            </ul>
        </nav>
    );
};

export default Navbar;
