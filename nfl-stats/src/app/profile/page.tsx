'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/Auth.context'
import { useRouter } from 'next/navigation'
import LeftTabs from '@/components/nav/leftTabs.component'
import User from '@/interfaces/user.interface'
import Bet from '@/interfaces/bet.interface'
import BetService from '@/services/Bet.service'
import { AxiosError } from 'axios'
import CreateBetModal from '@/components/modals/addBet.modal'

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
    const { logout } = useAuth()

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">General</h2>
            <div className="flex flex-col space-y-4">
                <BasicLabel label="Email" value={user.email} />
                <BasicLabel label="Username" value={user.username} />
                <BasicLabel label="First Name" value={user.first_name} />
                <BasicLabel label="Last Name" value={user.last_name} />
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded mt-4" onClick={logout}>Logout</button>
        </div>
    )
}

const BetTrackingTab = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bet Tracking</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setIsCreateModalOpen(true)}>Create New Bet</button>
            <CreateBetModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
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
            BetService.listMyBets().then((bets) => {
                console.log(bets)
                setBets(bets)
            }).catch((error: AxiosError) => {
                console.error(error)
            })
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
