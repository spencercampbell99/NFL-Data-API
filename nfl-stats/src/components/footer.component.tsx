import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <>
      <div className="pb-16">
        {/* This div adds padding to prevent the footer from overlapping content */}
      </div>
      <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-white text-center py-4">
        <p className="text-xs">
          © {new Date().getFullYear()} End Zone Edge. For entertainment and educational purposes only. This is not a betting or financial advice site.{' '}
          <Link href="/terms-of-service" className="text-blue-400 hover:underline">
            Terms of Service
          </Link>
        </p>
      </footer>
    </>
  );
};

export default Footer;