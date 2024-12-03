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
    date_of_birth?: Date;
    college?: string;
    experience?: number;
    rookie_year?: number;
    draft_club?: string;
    draft_number?: number;
    active?: boolean;
    headshot_url?: string;
    espn_id?: number;
}

export default Player;