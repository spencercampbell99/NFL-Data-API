import axios from '@/axiosConfig';

class BetService {
    async listMyBets() {
        try {
        const response = await axios.get('/my-bets');
        return response.data;
        } catch (error) {
        console.error('Error fetching bets:', error);
        }
    }
    
    async getBet(id: string) {
        try {
        const response = await axios.get(`/bet/${id}`);
        return response.data;
        } catch (error) {
        console.error('Error fetching bet:', error);
        }
    }
    
    async createBet(data: any) {
        try {
        const response = await axios.post('/bet', data);
        return response.data;
        } catch (error) {
        console.error('Error creating bet:', error);
        }
    }
    
    async updateBet(id: string, data: any) {
        try {
        const response = await axios.put(`/bet/${id}`, data);
        return response.data;
        } catch (error) {
        console.error('Error updating bet:', error);
        }
    }
    
    async deleteBet(id: string) {
        try {
        const response = await axios.delete(`/bet/${id}`);
        return response.data;
        } catch (error) {
        console.error('Error deleting bet:', error);
        }
    }

    async listGamesForBetSelectoin() {
        try {
            const response = await axios.get('/bets/list-games');
            return response.data;
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    }
}

export default new BetService();