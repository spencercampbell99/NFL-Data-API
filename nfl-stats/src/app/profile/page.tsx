'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/Auth.context'
import { useRouter } from 'next/navigation'
import LeftTabs from '@/components/nav/leftTabs.component'
import User from '@/interfaces/user.interface'
import Bet from '@/interfaces/bet.interface'
import Game from '@/interfaces/game.interface'
import BetService from '@/services/Bet.service'
import { AxiosError } from 'axios'
import CreateBetModal from '@/components/modals/addBet.modal'
import NestedTable from '@/components/tables/nestedTable.component'

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

const BetTrackingTableColumnOrder = [
    'id',
    { key: ['created_at'], transformer: (created_at: string) => new Date(created_at).toLocaleDateString()},
    { key: ['wager'], transformer: (wager: number) => `$${wager}`},
    { key: ['settled', 'amount_won', 'amount_lost'], transformer: (settled: boolean, amount_won: number, amount_lost: number) => settled ? (amount_won ? `$${amount_won}` : `-$${amount_lost}`) : 'Pending' },
    { key: ['settled', 'amount_won'], transformer: (settled: boolean, won: boolean) => settled ? (won ? 'Won' : 'Lost') : 'Pending' },
]

const BetTrackingTableLegsColumnOrder = [
    { key: ['game'], transformer: (game: any) => `${game.home_team_char_id} vs ${game.away_team_char_id}`},
    { key: ['wager'], transformer: (wager: number) => `$${wager}`},
    { key: ['odds'], transformer: (odds: number) => BetService.decimalToAmericanOdds(odds) },
    { key: ['line_type'], transformer: (line_type: string) => line_type.replace('_', ' ')},
    {
        key: ['game', 'line_type', 'line_value', 'over_line', 'team_id'],
        transformer: (game: Game, line_type: string, line_value: number|null, over_line: boolean, team_id: number|null) => {
            if (line_type === 'SPREAD') {
                return over_line ? `+${line_value}` : `-${line_value}`
            } else if (line_type === 'TOTAL_SCORE') {
                return over_line ? `Over ${line_value}` : `Under ${line_value}`
            } else if (line_type === 'MONEYLINE') {
                if (team_id === game.home_team_id) {
                    return game.home_team_char_id
                } else if (team_id === game.away_team_id) {
                    return game.away_team_char_id
                }
            }
        }
    },
    { key: ['settled', 'won'], transformer: (settled: boolean, won: boolean) => settled ? (won ? 'Won' : 'Lost') : 'Pending' }
]

const BetTrackingTab: React.FC<{ bets: Bet[] }> = ({ bets }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    if (!bets) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bet Tracking</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setIsCreateModalOpen(true)}>Create New Bet</button>
            <NestedTable
                headers={['Bet ID', 'Bet Date', 'Bet Amount', 'Payout', 'Bet Status']}
                columnOrder={BetTrackingTableColumnOrder}
                data={bets}
                onRowClick={(row) => console.log(row)}
                childHeaders={['Game', 'Wager', 'Odds', 'Line Type', 'Bet Info', 'Status']}
                childColumnOrder={BetTrackingTableLegsColumnOrder}
                childrenKey="legs"
            />
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
                
                // rebuild bets structure to include game short name from bet legs


                setBets(bets)
            }).catch((error: AxiosError) => {
                console.error(error)
            })
        }
        if (selectedTab === 'Bet Tracking' && !bets?.length) {
            fetchBets()
        }
    }, [selectedTab])

    return (
        <div className="flex min-h-screen bg-gray-100">
            <LeftTabs tabs={_tabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            <div className="w-3/4 bg-white p-8 rounded-lg shadow-lg">
                {selectedTab === 'General' && user && <GeneralTab user={user} />}
                {selectedTab === 'Bet Tracking' && <BetTrackingTab bets={bets} />}
            </div>
        </div>
    )
}

export default ProfilePage
