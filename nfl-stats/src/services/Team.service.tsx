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

    static async getHistoricalMatchups({ team1, team2, page = 1, startDate = "", endDate = "" }: { team1: number, team2: number, page?: number, startDate?: string, endDate?: string }) {
      if (startDate != "" && endDate != "" && startDate > endDate) {
        throw new Error('Start date must be before end date');
      }
      if (startDate != "" && endDate == "" || startDate == "" && endDate != "") {
        throw new Error('Both or neither of start date and end date must be provided');
      }

      try {
        const response = await axios.get(`/teams/historical-matchups?team1=${team1}&team2=${team2}&page=${page}&start_date=${startDate}&end_date=${endDate}`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }

    static async getSeasonScheduleForTeam(teamId: number, season: number) {
        try {
            const response = await axios.get(`/team/${teamId}/season-schedule/${season}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching season schedule for team:', error);
        }
    }

    static async getAverageTeamPerformanceGoingIntoWeek(teamId: number, week: number, season: number, windowSize?: number) {
        if (windowSize === undefined) {
            windowSize = 5;
        }
        try {
            const response = await axios.get(`/team/${teamId}/average-window-performance/${season}/${week}`, {
                params: {
                    window: windowSize
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching average team performance:', error);
        }
    }
  }
  
  export default TeamService;