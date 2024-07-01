import Team from './team.interface';
import {BoxScorePlayerStats as PlayerStats} from './boxScorePlayerStats.interface';
import BoxScore from './boxScore.interface';

export default interface Game {
    id: number;
    name: string;
    season: number;
    week: number;
    short_name: string;
    home_team_char_id: string;
    away_team_char_id: string;
    away_team_id: number;
    home_team_id: number;
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
    home_boxscore: BoxScore;
    away_boxscore: BoxScore;
    espn_id: number;
}