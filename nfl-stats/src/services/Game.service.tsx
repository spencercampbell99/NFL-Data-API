import axios from '@/axiosConfig';
import Game from '@/interfaces/game.interface';

class GameService {
    async getGamesByWeek({ season, week, idsOnly = false, withModelPredictions = false }: { season: number, week: number, idsOnly?: boolean|number, withModelPredictions?: boolean|number }) {
        try {
            const response = await axios.get(`/games/week/${week}/season/${season}`, {
                params: {
                    ids_only: idsOnly,
                    with_model_predictions: withModelPredictions
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    }

    async listGames() {
        try {
            const response = await axios.get('/games');
            return response.data;
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    }

    async getGame(id: string) {
        try {
            const response = await axios.get(`/game/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching game:', error);
        }
    }

    async createGame(data: Game) {
        try {
            const response = await axios.post('/game', data);
            return response.data;
        } catch (error) {
            console.error('Error creating game:', error);
        }
    }

    async updateGame(id: string, data: any) {
        try {
            const response = await axios.put(`/game/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating game:', error);
        }
    }

    async deleteGame(id: string) {
        try {
            const response = await axios.delete(`/game/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting game:', error);
        }
    }

    async gameOverview(id: string) {
        try {
            const response = await axios.get(`/game/${id}/overview`);
            return response.data;
        } catch (error) {
            console.error('Error fetching game overview:', error);
        }
    }
}

export default new GameService();