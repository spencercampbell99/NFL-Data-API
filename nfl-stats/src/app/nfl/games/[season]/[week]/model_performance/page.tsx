'use client'

import axios from '@/axiosConfig';
import RoundedButton from '@/components/roundedButton.component';
import React from 'react'
import ScoreModelService from '@/services/ScoreModel.service';

// import Table from '@/components/table/table.component';

/**
 * Game Interface for Week Overview Return from API
 */
interface Game {
    away_team_error: number
    away_team_score: number
    suggested_moneyline_percent_bet: number
    decimal_odds: number
    correct_over_under: boolean
    correct_spread: boolean
    correct_winner: boolean
    correct_winner_by_score: boolean
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
        away_moneyline: number
        home_score: number|null,
        away_score: number|null,
        date: string
        home_team_char_id: string
        home_moneyline: number
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
    moneyLineMoneyWageredKelly: number
    moneyLineMoneyWonKelly: number
    spreadMoneyWagered: number
    spreadMoneyWon: number
    overUnderMoneyWagered: number
    overUnderMoneyWon: number
}

/**
 * Renders a game card component.
 * @param {Object} props - The component props.
 * @param {Game} props.game - The game object.
 * @param {number} props.numGames - The total number of games in the week.
 * @returns {JSX.Element} The rendered game card component.
 */
const GameCard: React.FunctionComponent<{ game: Game, numGames?: number }> = ({ game, numGames = 1 }) => {
    return (
        <>
            <div className={`flex flex-col justify-center items-center${!game.correct_winner_by_score ? ' bg-red-100' : ' bg-green-200'}`}>
                <h1 className="w-full text-center text-xl font-medium">{game.schedule.name}</h1>
                <table className="w-full table-auto">
                    <thead className="border-black border-b-[1px]">
                        <tr>
                            <th>Team</th>
                            <th>Prediction (Actual)</th>
                            <th>Moneyline</th>
                            <th>Spread</th>
                            <th>Total Line (Actual)</th>
                            <th>Suggested Bet/Return</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        <tr>
                            <td>{game.schedule.away_team_char_id}</td>
                            <td>{game.away_team_score} ({game.schedule.away_score})</td>
                            <td>{game.schedule.away_moneyline}</td>
                            <td>{game.schedule.spread}</td>
                            <td>{game.schedule.over_under} ({game.schedule.away_score && game.schedule.home_score? game.schedule.away_score + game.schedule.home_score : null})</td>
                            <td>{(game.suggested_moneyline_percent_bet * 100).toFixed(2)}% of wallet</td>
                        </tr>
                        <tr>
                            <td>{game.schedule.home_team_char_id}</td>
                            <td>{game.home_team_score} ({game.schedule.home_score})</td>
                            <td>{game.schedule.home_moneyline}</td>
                            <td>{game.schedule.spread * -1}</td>
                            <td className={`${game.correct_over_under ? 'font-bold' : ''}`}>{game.over_under.toLowerCase()} ({(game.schedule.away_score && game.schedule.home_score ? game.schedule.away_score + game.schedule.home_score : 0) > game.schedule.over_under ? 'Over' : 'Under'})</td>
                            <td>${(game.correct_winner ? game.suggested_moneyline_percent_bet * game.decimal_odds * 100 : -1 * game.suggested_moneyline_percent_bet * 100).toFixed(2)}</td>
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
                    <GameCard key={index} game={game} numGames={weekOverview.length}/>
                ))}
            </div>
        </>
    )
}

export default function WeekOverview({ params }: { params: { season: number, week: number } }) {
    const [weekOverview, setWeekOverview] = React.useState<Game[]>([])
    const [weekSummary, setWeekSummary] = React.useState<WeekSummary>()
    const [hypotheticalBet, setHypotheticalBet] = React.useState(0)

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
        let moneyLineMoneyWageredKelly = 0
        let moneyLineMoneyWonKelly = 0
        let spreadMoneyWagered = 0
        let spreadMoneyWon = 0
        let overUnderMoneyWagered = 0
        let overUnderMoneyWon = 0
        let decimalOdds = 0

        let hypotheticalBet = 100 / response.data.modelPredictions.length

        // non tie games predicted
        const nonTieGames = response.data.modelPredictions.filter((game: Game) => game.home_team_score !== game.away_team_score)
        let hypotheticalBetScore = 100 / nonTieGames.length
        setHypotheticalBet(hypotheticalBet)

        const numGames = response.data.modelPredictions.length
        
        response.data.modelPredictions.forEach((game: Game, index: number) => {
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

            const homeWinner = game.schedule.away_score && game.schedule.home_score ? game.schedule.home_score > game.schedule.away_score : null

            if (homeWinner === null) {
                return
            }
            
            // calculate decimal odds for winner
            if (homeWinner && game.schedule.home_moneyline < 0) {
                decimalOdds = 100 / (game.schedule.home_moneyline * -1) + 1
            } else if (!homeWinner && game.schedule.away_moneyline < 0) {
                decimalOdds = 100 / (game.schedule.away_moneyline * -1) + 1
            } else if (homeWinner && game.schedule.home_moneyline > 0) {
                decimalOdds = game.schedule.home_moneyline / 100 + 1
            } else if (!homeWinner && game.schedule.away_moneyline > 0) {
                decimalOdds = game.schedule.away_moneyline / 100 + 1
            }

            // kelly decimal odds
            const kellyMoneyline = game.home_win ? game.schedule.home_moneyline : game.schedule.away_moneyline
            const kellyDecimalOdds = kellyMoneyline < 0 ? 100 / Math.abs(kellyMoneyline) + 1 : kellyMoneyline / 100 + 1

            // update decimal odds on game object
            response.data.modelPredictions[index].decimal_odds = decimalOdds

            // calculate money won/lost
            moneyWagered += hypotheticalBet * 2 + hypotheticalBetScore
            moneyLineMoneyWageredKelly += hypotheticalBet * numGames * game.suggested_moneyline_percent_bet
            if (game.home_team_score != game.away_team_score)
                moneyLineMoneyWagered += hypotheticalBetScore
            spreadMoneyWagered += hypotheticalBet
            overUnderMoneyWagered += hypotheticalBet

            if (game.correct_winner) {
                let kellyMoneyWon = hypotheticalBet * game.suggested_moneyline_percent_bet * numGames * kellyDecimalOdds
                moneyLineMoneyWonKelly += kellyMoneyWon
            }
            if (game.correct_winner_by_score) {
                moneyWon += hypotheticalBetScore * decimalOdds
                moneyLineMoneyWon += hypotheticalBetScore * decimalOdds
            }
            if (game.correct_spread) {
                moneyWon += hypotheticalBet * 1.91 // assuming -110 odds
                spreadMoneyWon += hypotheticalBet * 1.91 // assuming -110 odds
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
            moneyLineMoneyWageredKelly: moneyLineMoneyWageredKelly,
            moneyLineMoneyWonKelly: moneyLineMoneyWonKelly,
            spreadMoneyWagered: spreadMoneyWagered,
            spreadMoneyWon: spreadMoneyWon,
            overUnderMoneyWagered: overUnderMoneyWagered,
            overUnderMoneyWon: overUnderMoneyWon
        }

        setWeekSummary(weekSummary)
    }

    // Settle model predictions for week
    const settleModelPredictions = async () => {
        ScoreModelService.settleModelPredictions(params.season, params.week).then(() => {
            getWeekOverview();
        }).catch((error) => {
            console.error('Error settling model predictions:', error);
        });
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
                <div>
                    <h1 className="text-2xl font-bold text-center leading-[45px]">{`Week ${params.week} Overview`}</h1>
                    <RoundedButton
                        text="Settle Model Predictions"
                        onClick={() => settleModelPredictions()}
                        className="mx-auto block mb-2"
                    />
                </div>
                <div className="w-full">
                    <h2 className="text-center text-xl font-medium">{`Season ${params.season} Week ${params.week}`}</h2>
                    <h3 className="ml-5">Hypothetical bet: ${hypotheticalBet} (Total: $100)</h3>
                    {weekSummary ? (
                        <p className="ml-5">
                            Total Money Wagered (Won) (% return): ${weekSummary.moneyWagered.toFixed(2)} (${weekSummary.moneyWon.toFixed(2)}) ({((weekSummary.moneyWon - weekSummary.moneyWagered) / weekSummary.moneyWagered * 100).toFixed(2)}%)
                            <br />
                            Moneyline Money  Wagered Kelly (Won) (% return): ${weekSummary.moneyLineMoneyWageredKelly.toFixed(2)} (${weekSummary.moneyLineMoneyWonKelly.toFixed(2)}) ({((weekSummary.moneyLineMoneyWonKelly - weekSummary.moneyLineMoneyWageredKelly) / weekSummary.moneyLineMoneyWageredKelly * 100).toFixed(2)}%)
                            <br />
                            Moneyline Money Wagered (Won) (% return): ${weekSummary.moneyLineMoneyWagered.toFixed(2)} (${weekSummary.moneyLineMoneyWon.toFixed(2)}) ({((weekSummary.moneyLineMoneyWon - weekSummary.moneyLineMoneyWagered) / weekSummary.moneyLineMoneyWagered * 100).toFixed(2)}%)
                            <br />
                            Spread Money Wagered (Won) (Loss) (% return): ${weekSummary.spreadMoneyWagered.toFixed(2)} (${weekSummary.spreadMoneyWon.toFixed(2)}) ({((weekSummary.spreadMoneyWon - weekSummary.spreadMoneyWagered) / weekSummary.spreadMoneyWagered * 100).toFixed(2)}%)
                            <br />
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
