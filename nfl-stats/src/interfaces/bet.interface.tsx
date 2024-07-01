export default interface Bet {
    wager: number;
    total_odds: number;
    amount_to_win: number;
    amount_won?: number;
    amount_lost?: number;
    round_robin_picks?: number;
    notional_bet?: number;
    bettor_id: number;
    type: 'STRAIGHT' | 'PARLAY' | 'ROUND_ROBIN';
    settled: boolean;
    settled_at?: Date;
    created_at: Date;
}