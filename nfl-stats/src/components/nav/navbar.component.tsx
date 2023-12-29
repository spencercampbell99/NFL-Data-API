import Image from 'next/image';
import NavbarLink from './navbarLink.component';
import React, { FunctionComponent } from 'react';
import Link from 'next/link';

const Navbar: FunctionComponent<{}> = () => {
    return (
        <nav className="bg-gradient-to-b from-mediumGreen to-darkGreen h-[75px] max-h-[75px]">
            <Link href="/"><Image src="/rectangle-logo.png" alt="Logo" width={125} height={100} className="absolute pl-3 pt-[6px]" /></Link>
            <ul className="flex justify-center space-x-4 py-6">
                <li>
                    <NavbarLink href="/">
                        Home
                    </NavbarLink>
                </li>
                <li>
                    <NavbarLink href="/nfl/games/2023/15">
                        Current Week
                    </NavbarLink>
                </li>
                <li>
                    <NavbarLink href="/nfl/games/2023/15/model_performance">
                        Model Performance
                    </NavbarLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
