import Team from './team.interface';
import PlayerStats from './boxScorePlayerStats.interface';

export default interface Game {
    id: number;
    name: string;
    short_name: string;
    home_team_char_id: string;
    away_team_char_id: string;
    home_score: number;
    away_score: number;
    over_under: number;
    spread: number;
    date: string;
    home_moneyline: number;
    away_moneyline: number;
    homeFavorite: boolean;
    homeWin: boolean;
    underdogWin: boolean;
    overUnder: boolean;
    home_team: Team;
    away_team: Team;
    player_stats: PlayerStats;
}