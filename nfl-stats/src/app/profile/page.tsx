'use client'

import React from 'react'
import { useAuth } from '@/contexts/Auth.context'
import { useRouter } from 'next/navigation'

const ProfilePage = () => {
    const { user, logout } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (!user) {
            router.push('/auth/login');
        }
    }, [user]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Profile</h1>
                <p className="text-center text-gray-600">Welcome back, {user?.username}</p>

                <button
                    onClick={() => {
                        logout();
                        router.push('/auth/login');
                    }}
                    className="w-full p-3 mt-4 bg-red-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default ProfilePage