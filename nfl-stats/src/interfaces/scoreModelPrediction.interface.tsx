export default interface ScoreModelPrediction {
    schedule_id: number;
    suggested_moneyline_percent_bet: number|null;
    home_team_score: number;
    away_team_score: number;
    total_score: number;
    over_under: boolean|null;
    cover_spread: boolean|null;
    home_win: boolean|null;
    underdog_win: boolean|null;
    correct_winner: boolean|null;
    correct_spread: boolean|null;
    correct_over_under: boolean|null;
    correct_underdog_win: boolean|null;
    home_team_error: number|null;
    away_team_error: number|null;
    total_error: number|null;
}