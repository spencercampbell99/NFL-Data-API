interface BetLeg {
    game_id: number;
    bet_id?: number;
    wager?: number;
    line_type: string;
    team_id?: number;
    line_value?: number;
    over_line?: boolean;
    odds?: number;
    won?: boolean;
    push?: boolean;
    bettor_id?: number;
    settled?: boolean;
    settled_at?: Date;
}

export default BetLeg;