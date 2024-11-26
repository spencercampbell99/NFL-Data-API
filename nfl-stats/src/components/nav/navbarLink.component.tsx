import Link from 'next/link';
import React from 'react';

const NavbarLink: React.FunctionComponent<{ href: string, children: React.ReactNode, className?: string }> = ({ href, children, className = '' }) => {
    return (
        <Link href={href} className={"text-offWhite hover:text-gray-300 font-bold w-auto inline-block whitespace-nowrap " + className}>
            {children}
        </Link>
    );
};

export default NavbarLink;
