import Link from 'next/link';
import React from 'react';
import { NavRequirements } from '@/interfaces/component_interfaces/navComponents.interface';
import AuthService from '@/services/Auth.service';

const NavbarLink: React.FunctionComponent<{ href: string, children: React.ReactNode, className?: string, navRequirements?: NavRequirements|null }> = ({ href, children, className = '', navRequirements = null }) => {
    if (navRequirements) {
        if (!AuthService.handleNavRequirements(navRequirements)) {
            return null;
        }
    }

    return (
        <Link href={href} className={"text-offWhite hover:text-gray-300 font-bold w-auto inline-block whitespace-nowrap " + className}>
            {children}
        </Link>
    );
};

export default NavbarLink;
