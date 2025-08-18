'use client'

import React from 'react'
import PlayerService from '@/services/Player.service'
import LocalStorageItem from '@/services/LocalStorage.service'
import BasicTable from '@/components/tables/basicTable.component'
import Player from '@/interfaces/player.interface'
import { useRouter } from 'next/navigation'

function parsePlayers(players: Player[]): Player[] {
    // loop through players and change active from 1/0 to Active/Inactive
    return players.map(player => ({
        ...player,
        active: player.active ? 'Active' : 'Inactive'
    }));
}

function filterActivePlayers(players: Player[]): Player[] {
    return players.filter(player => player.active === 'Active' || player.active == true);
}

const PlayersHubPage = () => {
    const [filteredPlayers, setFilteredPlayers] = React.useState<Player[]>([]);
    const [players, setPlayers] = React.useState<Player[]>([]);
    const [showOnlyActivePlayers, setShowOnlyActivePlayers] = React.useState<boolean>(true);
    const router = useRouter();

    React.useEffect(() => {
        const fetchPlayers = async () => {
            try {
                let localVersion = new LocalStorageItem('all-players');

                let players;

                // Grab from local storage if available and refresh every 7 days
                if (localVersion.value && localVersion.last_updated && (new Date().getTime() - localVersion.last_updated.getTime()) < 1000 * 60 * 60 * 24 * 0) {
                    players = parsePlayers(localVersion.value);
                    setPlayers(players);
                    setFilteredPlayers(filterActivePlayers(players));
                    return;
                }

                players = await PlayerService.getPlayers({ all: true, attributes: ['id', 'full_name', 'position', 'team', 'active'] });

                // if data returned is greater length than 0, set local storage
                if (players.length < 1) return;

                localVersion.set(players);

                players = parsePlayers(players);
                setPlayers(players)
                setFilteredPlayers(filterActivePlayers(players));
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };

        fetchPlayers();
    }, []);

    return (
        <div>
            {/* Checkbox for showing only active players, default to only active */}
            <div
                className="flex items-center ml-5 my-2"
            >
                <label
                    className="text-lg font-medium"
                >
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={showOnlyActivePlayers}
                        onChange={(e) => {
                            setShowOnlyActivePlayers(e.target.checked);
                            if (e.target.checked) {
                                setFilteredPlayers(filterActivePlayers(players));
                            } else {
                                setFilteredPlayers(players);
                            }
                        }}
                    />
                    Show Only Active Players
                </label>
            </div>

            <BasicTable
                columns={[
                    { header: 'Full Name', key: 'full_name', searchable: true, sortable: true },
                    { header: 'Position', key: 'position', searchable: true, sortable: true },
                    { header: 'Team', key: 'team.team', searchable: true, sortable: true },
                    { header: 'Active', key: 'active', searchable: true, sortable: true },
                ]}
                data={filteredPlayers}
                onRowClick={(player) => router.push('/nfl/players/profile/' + player.id)}
            />
        </div>
    )
}

export default PlayersHubPage;