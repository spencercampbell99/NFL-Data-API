'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/Auth.context'
import { useRouter } from 'next/navigation'
import LeftTabs from '@/components/nav/leftTabs.component'
import User from '@/interfaces/user.interface'
import Bet from '@/interfaces/bet.interface'

const _tabs = ['General', 'Bet Tracking']

const BasicLabel = ({ label, value }: { label: string, value: string }) => {
    return (
        <div>
            <label className="text-gray-600 font-bold">{label}</label>
            <p>{value}</p>
        </div>
    )
}

const GeneralTab = ({ user }: { user: User }) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">General</h2>
            <div className="flex flex-col space-y-4">
                <BasicLabel label="Email" value={user.email} />
                <BasicLabel label="Username" value={user.username} />
                <BasicLabel label="First Name" value={user.first_name} />
                <BasicLabel label="Last Name" value={user.last_name} />
            </div>
        </div>
    )
}

const BetTrackingTab = () => {
    return (
        <h1>Bet Tracking</h1>
    )
}

const ProfilePage = () => {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState('General')
    const [bets, setBets] = useState<Bet[]>([])

    React.useEffect(() => {
        if (!user) {
            router.push('/auth/login');
        }
    }, [user]);

    React.useEffect(() => {
        const fetchBets = async () => {
            try {
                const response = await fetch('/api/bets')
                const data = await response.json()
                setBets(data.bets)
            } catch (error) {
                console.error('Error fetching bets:', error)
            }
        }
        if (selectedTab === 'Bet Tracking' && !bets.length) {
            fetchBets()
        }
    }, [selectedTab])

    return (
        <div className="flex min-h-screen bg-gray-100">
            <LeftTabs tabs={_tabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            <div className="w-3/4 bg-white p-8 rounded-lg shadow-lg">
                {selectedTab === 'General' && user && <GeneralTab user={user} />}
                {selectedTab === 'Bet Tracking' && <BetTrackingTab />}
            </div>
        </div>
    )
}

export default ProfilePage
