'use client'

import React from 'react'
import PlayerService from '@/services/Player.service'
import LocalStorageItem from '@/services/LocalStorage.service'
import BasicTable from '@/components/tables/basicTable.component'
import Player from '@/interfaces/player.interface'
import { useRouter } from 'next/navigation'

const PlayersHubPage = () => {
    const [players, setPlayers] = React.useState<Player[]>([]);
    const router = useRouter();

    React.useEffect(() => {
        const fetchPlayers = async () => {
            try {
                let localVersion = new LocalStorageItem('all-players');

                // Grab from local storage if available and refresh every 7 days
                if (localVersion.value && localVersion.last_updated && (new Date().getTime() - localVersion.last_updated.getTime()) < 1000 * 60 * 60 * 24 * 0) {
                    console.log('Fetched players from local storage');
                    setPlayers(localVersion.value);
                    return;
                }

                const players = await PlayerService.getPlayers({ all: true, attributes: ['id', 'full_name', 'position', 'team', 'active'] });

                // if data returned is greater length than 0, set local storage
                if (players.length < 1) return;

                localVersion.set(players);
                setPlayers(players);
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };

        fetchPlayers();
    }, []);

    return (
        <div>
            <BasicTable
                columns={[
                    { header: 'Full Name', key: 'full_name', searchable: true, sortable: true },
                    { header: 'Position', key: 'position', searchable: true, sortable: true },
                    { header: 'Team', key: 'team.team', searchable: true, sortable: true },
                    { header: 'Active', key: 'active', searchable: true, sortable: true },
                ]}
                data={players}
                onRowClick={(player) => router.push('/nfl/players/profile/' + player.id)}
            />
        </div>
    )
}

export default PlayersHubPage;