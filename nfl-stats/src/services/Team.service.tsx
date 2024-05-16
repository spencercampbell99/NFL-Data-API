import axios from '@/axiosConfig';
import Team from '@/interfaces/team.interface';

class TeamService {
    static async listTeams() {
      try {
        const response = await axios.get('/teams/list');
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  
    static async getTeam(id: number) {
      try {
        const response = await axios.get(`/team/${id}`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
      return null
    }
  
    // static async createTeam(team: Team) {
    //   try {
    //     const response = await axios.post('/api/teams', team);
    //     return response.data;
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
  
    // static async updateTeam(id: number, team: Team) {
    //   try {
    //     const response = await axios.put(`/api/teams/${id}`, team);
    //     return response.data;
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
  
    // static async deleteTeam(id: number) {
    //   try {
    //     const response = await axios.delete(`/api/teams/${id}`);
    //     return response.data;
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    static async getHistoricalMatchups(team1: number, team2: number) {
        try {
          const response = await axios.get(`/teams/historical-matchups?team1=${team1}&team2=${team2}`);
          return response.data;
        } catch (error) {
          console.error(error);
        }
      }
  }
  
  export default TeamService;