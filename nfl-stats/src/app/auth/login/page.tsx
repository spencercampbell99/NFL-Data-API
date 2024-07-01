'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/Auth.context';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

const LoginComponent = () => {
    const { login, user, me } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    React.useEffect(() => {
        if (user) {
            // recheck user auth
            me().then(() => {
                router.push('/profile');
            }).catch((error: AxiosError) => {
                console.error('Error fetching user:', error);
            })
        }
    }, [user]);

    const handleLogin = async () => {
        try {
            login(email, password).then(() => {
                router.push('/profile');
            }).catch((error: AxiosError) => {
                if (error.response?.status === 403) {
                    alert('Invalid email or password');
                    return
                }
                if (error.response?.status === 500) {
                    alert('Server error');
                    return
                }
                if (error.response?.status === 404) {
                    alert('User not found');
                    return
                }
            })
        } catch (error: AxiosError|any) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <button onClick={handleLogin} className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Login</button>
            </div>
        </div>
    );
};

export default LoginComponent;
