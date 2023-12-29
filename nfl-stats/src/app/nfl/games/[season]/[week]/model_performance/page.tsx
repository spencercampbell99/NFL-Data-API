'use client'

import axios from '@/axiosConfig';
import RoundedButton from '@/components/roundedButton.component';
import React from 'react'

// import Table from '@/components/table/table.component';

/**
 * Game Interface for Week Overview Return from API
 */
interface Game {
    away_team_error: number
    away_team_score: number
    correct_over_under: boolean
    correct_spread: boolean
    correct_winner: boolean
    correct_underdog_win: boolean | null | undefined
    cover_spread: boolean
    home_team_error: number
    home_team_score: number
    home_win: boolean
    id: number
    over_under: string
    total_error: number
    total_score: number
    underdog_win: boolean
    schedule: {
        name: string
        away_team_char_id: string
        away_team_money_line: number
        boxscores: {
            away_score: number
            home_score: number
            id: number
        }[]
        date: string
        home_team_char_id: string
        home_team_money_line: number
        over_under: number
        season: number
        spread: number
        week: number
    }
}

// Week Summary Interface
interface WeekSummary {
    correctWinner: number
    correctSpread: number
    correctOverUnder: number
    correctUnderdogWin: number
    totalError: number
    totalScore: number
    totalGames: number
    moneyWagered: number
    moneyWon: number
    moneyLineMoneyWagered: number
    moneyLineMoneyWon: number
    spreadMoneyWagered: number
    spreadMoneyWon: number
    overUnderMoneyWagered: number
    overUnderMoneyWon: number
}

/**
 * Renders a game card component.
 * @param {Object} props - The component props.
 * @param {Game} props.game - The game object.
 * @returns {JSX.Element} The rendered game card component.
 */
const GameCard: React.FunctionComponent<{ game: Game }> = ({ game }) => {
    return (
        <>
            <div className={`flex flex-col justify-center items-center${!game.correct_winner ? ' bg-red-100' : ' bg-green-200'}`}>
                <h1 className="w-full text-center text-xl font-medium">{game.schedule.name}</h1>
                <table className="w-full table-auto">
                    <thead className="border-black border-b-[1px]">
                        <tr>
                            <th>Team</th>
                            <th>Prediction (Actual)</th>
                            <th>Moneyline</th>
                            <th>Spread</th>
                            <th>Total Line (Actual)</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        <tr>
                            <td>{game.schedule.away_team_char_id}</td>
                            <td>{game.away_team_score} ({game.schedule.boxscores[0].away_score})</td>
                            <td>{game.schedule.away_team_money_line}</td>
                            <td>{game.schedule.spread}</td>
                            <td>{game.schedule.over_under} ({game.schedule.boxscores[0].away_score + game.schedule.boxscores[0].home_score})</td>
                        </tr>
                        <tr>
                            <td>{game.schedule.home_team_char_id}</td>
                            <td>{game.home_team_score} ({game.schedule.boxscores[0].home_score})</td>
                            <td>{game.schedule.home_team_money_line}</td>
                            <td>{game.schedule.spread * -1}</td>
                            <td className={`${game.correct_over_under ? 'font-bold' : ''}`}>{game.over_under.toLowerCase()} ({(game.schedule.boxscores[0].away_score + game.schedule.boxscores[0].home_score) > game.schedule.over_under ? 'Over' : 'Under'})</td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        </>
    )
}

/**
 * Renders a grid of game cards.
 * @param {Object} props - The component props.
 * @param {Game[]} props.weekOverview - The week overview object.
 * @returns {JSX.Element} The rendered game card grid component.
 */
const CardGrid: React.FunctionComponent<{ weekOverview: Game[] }> = ({ weekOverview }) => {
    return (
        <>
            <div className="w-full grid grid-cols-2 gap-2 p-2">
                {weekOverview.map((game: Game, index: number) => (
                    <GameCard key={index} game={game} />
                ))}
            </div>
        </>
    )
}

export default function WeekOverview({ params }: { params: { season: number, week: number } }) {
    const [weekOverview, setWeekOverview] = React.useState<Game[]>([])
    const [weekSummary, setWeekSummary] = React.useState<WeekSummary>()

    const getWeekOverview = async () => {
        const response = await axios.get(`/model-predictions/overview/${params.season}/${params.week}`)

        console.log(response.data.modelPredictions)

        setWeekOverview(response.data.modelPredictions)

        // calculate week summary
        let correctWinner = 0
        let correctSpread = 0
        let correctOverUnder = 0
        let correctUnderdogWin = 0
        let totalError = 0
        let totalScore = 0
        let totalGames = 0
        let moneyWagered = 0
        let moneyWon = 0
        let moneyLineMoneyWagered = 0
        let moneyLineMoneyWon = 0
        let spreadMoneyWagered = 0
        let spreadMoneyWon = 0
        let overUnderMoneyWagered = 0
        let overUnderMoneyWon = 0
        let decimalOdds = 0

        const hypotheticalBet = 10
        
        response.data.modelPredictions.forEach((game: Game) => {
            if (game.correct_winner) {
                correctWinner++
            }

            if (game.correct_spread) {
                correctSpread++
            }

            if (game.correct_over_under) {
                correctOverUnder++
            }

            if (game.correct_underdog_win) {
                correctUnderdogWin++
            }

            totalError += game.total_error
            totalScore += game.total_score
            totalGames++

            const homeWinner = game.home_team_score > game.away_team_score
            
            // calculate decimal odds for winner
            if (homeWinner && game.schedule.home_team_money_line < 0) {
                decimalOdds = 100 / (game.schedule.home_team_money_line * -1) + 1
            } else if (!homeWinner && game.schedule.away_team_money_line < 0) {
                decimalOdds = 100 / (game.schedule.away_team_money_line * -1) + 1
            } else if (homeWinner && game.schedule.home_team_money_line > 0) {
                decimalOdds = game.schedule.home_team_money_line / 100 + 1
            } else if (!homeWinner && game.schedule.away_team_money_line > 0) {
                decimalOdds = game.schedule.away_team_money_line / 100 + 1
            }

            // calculate money won/lost
            moneyWagered += hypotheticalBet * 2
            moneyLineMoneyWagered += hypotheticalBet
            spreadMoneyWagered += hypotheticalBet
            overUnderMoneyWagered += hypotheticalBet

            if (game.correct_winner) {
                moneyWon += hypotheticalBet * decimalOdds
                moneyLineMoneyWon += hypotheticalBet * decimalOdds
            }
            if (game.correct_spread) {
                // moneyWon += hypotheticalBet * 1.91 // assuming -110 odds
                // spreadMoneyWon += hypotheticalBet * 1.91 // assuming -110 odds
            }
            if (game.correct_over_under) {
                moneyWon += hypotheticalBet * 1.91 // assuming -110 odds
                overUnderMoneyWon += hypotheticalBet * 1.91 // assuming -110 odds
            }
        })

        const weekSummary = {
            correctWinner: correctWinner,
            correctSpread: correctSpread,
            correctOverUnder: correctOverUnder,
            correctUnderdogWin: correctUnderdogWin,
            totalError: totalError,
            totalScore: totalScore,
            totalGames: totalGames,
            moneyWagered: moneyWagered,
            moneyWon: moneyWon,
            moneyLineMoneyWagered: moneyLineMoneyWagered,
            moneyLineMoneyWon: moneyLineMoneyWon,
            spreadMoneyWagered: spreadMoneyWagered,
            spreadMoneyWon: spreadMoneyWon,
            overUnderMoneyWagered: overUnderMoneyWagered,
            overUnderMoneyWon: overUnderMoneyWon
        }

        setWeekSummary(weekSummary)
    }

    // load overview for week on page load (only once)
    React.useEffect(() => {
        getWeekOverview()
    }, [])

    return (
        <main className="text-black">
            <div className="h-auto mb-1">
                <RoundedButton text="Previous Week" onClick={() => {
                    const previousWeek = Number(params.week) - 1;
                    window.location.href = `/nfl/games/${params.season}/${previousWeek}/model_performance`;
                }} className="absolute mt-1 left-1"/>
                <RoundedButton text="Next Week" onClick={() => {
                    const nextWeek = Number(params.week) + 1;
                    window.location.href = `/nfl/games/${params.season}/${nextWeek}/model_performance`;
                }} className="absolute mt-1 right-1" />
                <h1 className="text-2xl font-bold text-center leading-[45px]">{`Week ${params.week} Overview`}</h1>
                <div className="w-full">
                    <h2 className="text-center text-xl font-medium">{`Season ${params.season} Week ${params.week}`}</h2>
                    <h3 className="ml-5">Hypothetical bet: $10</h3>
                    {weekSummary ? (
                        <p className="ml-5">
                            Total Money Wagered (Won) (% return): ${weekSummary.moneyWagered.toFixed(2)} (${weekSummary.moneyWon.toFixed(2)}) ({((weekSummary.moneyWon - weekSummary.moneyWagered) / weekSummary.moneyWagered * 100).toFixed(2)}%)
                            <br />
                            Moneyline Money Wagered (Won) (% return): ${weekSummary.moneyLineMoneyWagered.toFixed(2)} (${weekSummary.moneyLineMoneyWon.toFixed(2)}) ({((weekSummary.moneyLineMoneyWon - weekSummary.moneyLineMoneyWagered) / weekSummary.moneyLineMoneyWagered * 100).toFixed(2)}%)
                            <br />
                            {/* Spread Money Wagered (Won) (Loss) (% return): ${weekSummary.spreadMoneyWagered.toFixed(2)} (${weekSummary.spreadMoneyWon.toFixed(2)}) (${(weekSummary.spreadMoneyWagered - weekSummary.spreadMoneyWon).toFixed(2)}) ({((weekSummary.spreadMoneyWon - weekSummary.spreadMoneyWagered) / weekSummary.spreadMoneyWagered * 100).toFixed(2)}%)
                            <br /> */}
                            Over/Under Money Wagered (Won) (% return): ${weekSummary.overUnderMoneyWagered.toFixed(2)} (${weekSummary.overUnderMoneyWon.toFixed(2)}) ({((weekSummary.overUnderMoneyWon - weekSummary.overUnderMoneyWagered) / weekSummary.overUnderMoneyWagered * 100).toFixed(2)}%)
                        </p>
                    )
                        : null}
                </div>
            </div>
            {weekOverview ? (<CardGrid weekOverview={weekOverview} />) 
                : null}
        </main>
    )
}
