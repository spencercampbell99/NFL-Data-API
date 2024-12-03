'use client'

import React from 'react'
import PlayerService from '@/services/Player.service'

const PlayersHubPage = () => {
    React.useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const players = await PlayerService.getPlayers({ all: true });
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };

        fetchPlayers();
    }, []);

    return (
        <div>
        <h1>Players Hub</h1>
        </div>
    )
}

export default PlayersHubPage;