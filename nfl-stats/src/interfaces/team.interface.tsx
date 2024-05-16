export default interface Team {
    id: number
    short_display_name: string
    char_id?: string
    name?: string
    team_name?: string // Replace usages of team_name with name later on
    conference?: string
    division?: string
    wiki_logo_url?: string
    team_logo_wikipedia?: string
    team_logo_squared?: string
}