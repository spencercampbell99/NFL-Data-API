import React from 'react';
import Link from 'next/link';

const TechnologyUsed: React.FC<{ name: string }> = ({ name }) => (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-sm">
        <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
    </div>
);

export default function About() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Project Introduction */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
            <div className="p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    NFL Data API Project
                </h1>
                
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                    <p>
                        Welcome to my NFL Data API project! This application showcases my skills in building 
                        modern web applications with real-time data processing and visualization.
                    </p>
                    
                    <p>
                        As a passionate developer with a love for both football and clean, efficient code,
                        I created this platform to demonstrate my ability to work with complex datasets and present
                        them in an intuitive, user-friendly interface.
                    </p>

                    <p>
                        Please note that most of the advanced features of this application require an authenticated user account.
                        I will happily provide a full access account to hiring managers and recruiters who are interested in seeing the full capabilities of the application.
                    </p>
                </div>
            </div>
        </section>

        {/* Project Features */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Key Features
            </h2>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Advanced xoxscore statistics all on one page</li>
                <li>Player performance analysis with easy quick reference stats for their season and their next game</li>
                <li>Team historical matchups</li>
                <li>Game prediction models with performance tracking</li>
                <li>A predictive model which correctly guessed {'>'}72% of winners across all regular season games</li>
                <li>With much more to come!</li>
            </ul>
          </div>
        </section>

        {/* Technical Skills */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Technologies Used
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                <TechnologyUsed name="Next.js 14" />
                <TechnologyUsed name="TypeScript" />
                <TechnologyUsed name="Tailwind CSS" />
                <TechnologyUsed name="Axios" />
                <TechnologyUsed name="Node.js" />
                <TechnologyUsed name="Express.js" />
                <TechnologyUsed name="MySQL" />
                <TechnologyUsed name="Sequelize ORM" />
                <TechnologyUsed name="JWT Authentication" />
                <TechnologyUsed name="Docker" />
                <TechnologyUsed name="Git" />
                <TechnologyUsed name="Postman" />
                <TechnologyUsed name="Nginx Proxy Manager" />
                <TechnologyUsed name="Cloudflare" />
                <TechnologyUsed name="Ubuntu Server" />
                <TechnologyUsed name="Python" />
                <TechnologyUsed name="TensorFlow" />
                <TechnologyUsed name="NPM" />
            </div>
          </div>
        </section>

        {/* Development Approach */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Development Approach
            </h2>
            
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Component-based architecture for maximum reusability</li>
                <li>Service-oriented design pattern for API interactions</li>
                <li>TypeScript interfaces for robust type safety</li>
                <li>Modern routing with Next.js App Router</li>
                <li>Optimized data fetching strategies</li>
                <li>Role-based access control for protected routes</li>
                <li>High speed data queries with a focus on performance and cost reduction</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Future Work */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Future Work
            </h2>
            
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Enhanced predictive models with machine learning</li>
                <li>One click and scheduled data loaders for administrators</li>
                <li>Real-time game updates</li>
                <li>Expanded player and team statistics</li>
                <li>Improved user interface and experience, with mobile styling</li>
                <li>Automated testing and deployment</li>
                <li>Bug reporting</li>
                <li>Email notifications, mostly for user accounts (2FA, validate email, etc.)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="flex items-center">
                <span className="mr-2">🔗</span>
                <span>LinkedIn: www.linkedin.com/in/spencer-campbell-85945b2a3</span>
              </p>
              
              <div className="pt-4">
                <Link 
                  href="/nfl/games/2025/1"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Explore the Application
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}