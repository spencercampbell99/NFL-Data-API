'use client'

interface InfoCardProps {
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-700">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <main className="bg-gray-100 min-h-screen p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600">Shhh Data: NFL Stats & Predictions</h1>
        <p className="text-lg text-gray-700 mt-4">Get access to comprehensive NFL stats, predictions, historical performances, and machine learning models for just $50/year.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <InfoCard title="Comprehensive Stats" description="Access detailed stats for every NFL team and player, including game scores, player stats, and more." />
        <InfoCard title="Predictions" description="Get accurate predictions for upcoming games using advanced machine learning models." />
        <InfoCard title="Historical Performance" description="Analyze historical performance data to make informed decisions." />
        <InfoCard title="Machine Learning Models" description="Utilize cutting-edge machine learning models to enhance your predictions." />
      </section>

      <footer className="text-center mt-12">
        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
          Subscribe Now
        </button>
      </footer>
    </main>
  )
}