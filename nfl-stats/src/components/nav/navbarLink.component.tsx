import Link from 'next/link';
import React from 'react';

const NavbarLink: React.FunctionComponent<{ href: string, children: React.ReactNode }> = ({ href, children }) => {
    return (
        <Link href={href} className="text-offWhite hover:text-gray-300 font-bold">
            {children}
        </Link>
    );
};

export default NavbarLink;
