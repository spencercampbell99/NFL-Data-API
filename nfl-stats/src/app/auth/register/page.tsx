'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/Auth.context';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

const RegisterComponent = () => {
    const { register, user, me } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
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

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password.length > 25) {
            setError('Password must be less than 26 characters');
            return;
        }
        // TODO: Set up email validation with email sending
        if (email.length > 255) {
            setError('Email must be less than 256 characters');
            return;
        }
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        if (username.length > 25) {
            setError('Username must be less than 26 characters');
            return;
        }

        setError('');

        try {
            register({ email, password, username, firstName }).then(() => {
                router.push('/profile');
            }).catch((error: AxiosError|any) => {
                console.error(error)
                console.info(error.response.data.message)
                setError((error.response?.data.message || 'An error occurred'));
            })
        } catch (error: AxiosError|any) {
            console.error(error)
            setError((error.response?.data.message || 'An error occurred'));
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Register</h1>
                {error && <p className="text-red-500 text-xl mb-4">{error}</p>}
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
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <button onClick={handleRegister} className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Register</button>
            </div>
        </div>
    );
};

export default RegisterComponent;
