import { PlayerSeasonStatAveragesQB } from "./playerSeasonStatAverages.interface";

interface Player {
    full_name: string;
    first_name: string;
    last_name: string;
    guid?: string;
    team_id?: number;
    position?: string;
    jersey_number?: number;
    height?: number;
    weight?: number;
    date_of_birth?: string;
    college?: string;
    experience?: number;
    rookie_year?: number;
    draft_club?: string;
    draft_number?: number;
    active?: boolean|string; // Can be parsed as string to make it readable
    headshot_url?: string;
    espn_id?: number;
    season_stats?: PlayerSeasonStatAveragesQB[];
    team?: any;
}

export default Player;