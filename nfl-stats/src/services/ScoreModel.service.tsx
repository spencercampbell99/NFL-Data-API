import axios from "@/axiosConfig";

class ScoreModelService {
    /**
     * Retrieve model results for given season, and optionally given weeks and teams
     * @param season
     * @param weeks
     * @param teams
     * @returns
     */
    static async getScoreModelResults(season: number, weeks: number[] = [], teams: number[] = [], minSpread: number = 0): Promise<any> {
        // convert empty weeks and teams to "NULL" string or convert to string
        let _weeks, _teams;
        if (weeks.length === 0) {
            _weeks = "NULL";
        } else {
            _weeks = weeks.join(",");
        }

        if (teams.length === 0) {
            _teams = 'NULL';
        } else {
            _teams = teams.join(",");
        }

        const params = new URLSearchParams({
            weeks: _weeks,
            teams: _teams,
            min_spread: minSpread.toString()
        });

        const response = await axios.get(`/model-predictions/analysis/${season}?${params}`);

        return response.data;
    }

    /**
     * Retrieve each prediction for given season, and optionally given weeks and teams
     * 
     * @param season
     * @param weeks
     * @param teams
     * 
     * @returns
     */
    static async listModelPredictionsBySeason({ season, weeks = [], teams = [] }: { season: number, weeks?: number[], teams?: number[] }): Promise<any> {
        // convert empty weeks and teams to "NULL" string or convert to string
        let _weeks, _teams;
        if (weeks.length === 0) {
            _weeks = "NULL";
        } else {
            _weeks = weeks.join(",");
        }

        if (teams.length === 0) {
            _teams = 'NULL';
        } else {
            _teams = teams.join(",");
        }

        let params = new URLSearchParams({
            weeks: _weeks,
            teams: _teams
        });

        const response = await axios.get(`/model-predictions/${season}?${params}`);

        return response.data;
    }
}

export default ScoreModelService;