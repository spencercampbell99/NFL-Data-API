export default interface BoxScore {
    total_offensive_yards: number;
    total_drives: number;
    total_offensive_plays: number;
    yards_per_play: number;
    first_downs: number;
    passing_yards: number;
    rushing_yards: number;
    passing_first_downs: number;
    rushing_first_downs: number;
    third_down_conversions: number;
    fourth_down_conversions: number;
    red_zone_attempts: number;
    turnovers: number;
    field_goals_made: number;
    field_goals_attempted: number;
    punts_inside_20: number;
    time_of_possession: string;
}