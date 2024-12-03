import axios from '@/axiosConfig';
import Player from '@/interfaces/player.interface';

interface GetPlayersProps {
    all?: boolean;
    active?: boolean|null;
    search?: string|null;
    attributes?: string[];
    position?: string|null;
    teamId?: number|string|null;
}

/**
 * Service class for handling player-related API requests.
 */
class PlayerService {
    
    /**
     * Fetches a list of players based on the provided filter criteria.
     * 
     * @param {Object} [params] - The filter criteria for fetching players.
     * @param {boolean} [params.all] - Whether to fetch all players.
     * @param {boolean} [params.active] - Whether to fetch only active players.
     * @param {string} [params.search] - Search term to filter players by name.
     * @param {string[]} [params.attributes] - List of player attributes to include.
     * @param {string} [params.position] - Position to filter players by.
     * @param {string|number} [params.teamId] - Team ID to filter players by.
     * @returns {Promise<Player[]>} A promise that resolves to an array of players.
     */
    static async getPlayers({
        all=false,
        active=null,
        search=null,
        attributes=['id', 'full_name', 'position'],
        position=null,
        teamId=null,
    }: GetPlayersProps = {}): Promise<Player[]> {
        try {
            // build non null query params
            const params: any = { attributes };
            if (all !== undefined) params.all = all;
            if (active !== null) params.active = active;
            if (search !== null) params.search = search;
            if (position !== null) params.position = position;
            if (teamId !== null) params.teamId = teamId;

            const response = await axios.post('/players', params);
            return response.data as Player[];
        } catch (error) {
            throw new Error('Error fetching players');
        }
    }

    /**
     * Fetches a player by their ID.
     * 
     * @param {string|number} id - The ID of the player to fetch.
     * @returns {Promise<Player>} A promise that resolves to the player object.
     */
    static async getPlayerById(id: string|number): Promise<Player> {
        try {
            const response = await axios.get(`/players/${id}`);
            return response.data as Player;
        } catch (error) {
            throw new Error('Error fetching player by ID');
        }
    }
}

export default PlayerService;