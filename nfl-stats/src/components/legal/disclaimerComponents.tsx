import React from 'react';
import Link from 'next/link';

const StandardParagraphDisclaimer: React.FC = () => {
  return (
    <>
        <p className="text-sm text-gray-500 mt-2 text-center">
            Disclaimer: This information is for entertainment purposes only and is not intended as betting advice. ROI figures and predicted scores are based on historical simulations and <strong>do not guarantee future performance.</strong>
            <Link href="/terms-of-service" className="text-blue-400 hover:underline">
            Terms of Service
            </Link>
        </p>
    </>
  );
};

export {
    StandardParagraphDisclaimer
}