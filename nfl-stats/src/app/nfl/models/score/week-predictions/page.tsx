'use client'

import React, { FunctionComponent } from 'react';
import NestedTable from '@/components/tables/nestedTable.component';
import GameService from '@/services/Game.service';
import Game from '@/interfaces/game.interface';
import moment from 'moment';
import { SeasonWeekSelector } from '@/components/commonComponents';

const seasons = [2023, 2024]
const weeksToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function getPredScoreColText(game: Game) {
    if (!game || !game.model_predictions || game.model_predictions.length === 0) {
        return 'No Predictions';
    }
    const prediction = game.model_predictions[0];

    const winnerCharId = prediction.home_team_score === prediction.away_team_score ? 'N/A' : (prediction.home_team_score > prediction.away_team_score ? game.home_team_char_id : game.away_team_char_id);

    // Return as Home team character ID + Home team score + Away team score + Away team character ID
    return `${game.home_team_char_id} ${prediction.home_team_score} - ${prediction.away_team_score} ${game.away_team_char_id} (${winnerCharId})`;
}

const Page: FunctionComponent<{}> = () => {
    const [games, setGames] = React.useState<Game[]>([]);
    const [season, setSeason] = React.useState<number>(2024);
    const [week, setWeek] = React.useState<number>(7);
    const [amountToBet, setAmountToBet] = React.useState<number>(100);
    const [moreInfoOpen, setMoreInfoOpen] = React.useState<boolean>(false);

    // result vars
    const [moneyWon, setMoneyWon] = React.useState<String>('0');

    const fetchGames = async () => {
        GameService.getGamesByWeek({ season, week, withModelPredictions: true }).then((data) => {
            // take data, if present, and sort by date and time
            setGames(data);
            console.log(data)
        }).catch((error) => {
            console.error('Error fetching games:', error);
        })
    }

    React.useEffect(() => {
        fetchGames();
    }, []);

    React.useEffect(() => {
        if (games && amountToBet) {
            let totalMoneyWon = 0;

            const numPredictedNonTieGames = games.filter((game) => {
                let modelPredictions = game.model_predictions[0];
                if (!modelPredictions) {
                    return false;
                }

                return modelPredictions.home_team_score !== modelPredictions.away_team_score;
            }).length;

            if (numPredictedNonTieGames === 0) {
                setMoneyWon('0');
                return;
            }

            const betAmount = amountToBet / numPredictedNonTieGames;

            games.forEach((game) => {
                if (!game.home_score && game.home_score !== 0) {
                    return;
                }

                let modelPredictions = game.model_predictions[0];
                if (!modelPredictions) {
                    return;
                }

                if (!modelPredictions.correct_winner_by_score) {
                    return;
                }

                if (modelPredictions.home_team_score === modelPredictions.away_team_score) {
                    return;
                }

                let winnerMoneyline = modelPredictions.home_team_score > modelPredictions.away_team_score ? game.home_moneyline : game.away_moneyline;
                let decimalOdds = winnerMoneyline < 0 ? 100 / Math.abs(winnerMoneyline) + 1 : winnerMoneyline / 100 + 1;
                totalMoneyWon += betAmount * decimalOdds
            });
            setMoneyWon(totalMoneyWon.toFixed(2));
        }
    }, [games, amountToBet]);

    return (
        <div>
            <div className="mb-4 w-full">
                <div className="flex flex-row items-center justify-center m-4">
                    <SeasonWeekSelector season={season} week={week} setSeason={setSeason} setWeek={setWeek} buttonText="Go" onClick={fetchGames} overrideSeasons={seasons} overrideWeeks={weeksToShow} />
                </div>
                {true ? 
                    <>
                        <div className="mt-4 w-[15%] mx-auto text-center">
                            <label>Amount to Bet ($)</label>
                            <input type="number" value={amountToBet} onChange={(e) => setAmountToBet(parseInt(e.target.value))} className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="mt-4 w-[15%] mx-auto text-center">
                            <label>Money Won (with suggested bets on Moneyline)</label>
                            <input type="text" value={`$${moneyWon}`} readOnly className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </>
                : null}
            </div>
            <div className="mb-4 w-full text-center">
                <p className="text-sm text-gray-500">
                    Note: The money won is based on the model as bettor and is not a guarantee of actual winnings. The model is based on historical data and may not accurately predict future outcomes.
                    <br />
                    <strong>The model is not a financial advisor and should not be used as such. Please gamble responsibly.</strong>
                </p>
                <button className="mt-2 text-sm text-blue-500 hover:underline" onClick={() => setMoreInfoOpen(!moreInfoOpen)}>
                    {moreInfoOpen ? 'Less Info' : 'More Info'}
                </button>
                {moreInfoOpen && (
                    <div className="mt-2 text-sm text-gray-500 mx-auto text-left w-[50%]">
                        <ul className="list-disc pl-5">
                            <li>The money won by the model is done using equal bet sizes calculated by total amount bet divided by number of games with predicted outcomes. <strong>The model only bets on Moneyline</strong></li>
                            <li>Matchup shows the home team character ID and away team character ID, as well as the moneyline for each team</li>
                            <li>Time shows the day of the week and time of the game</li>
                            <li>Spread is the sportsbook spread line for the game for the favorite. Pred cover is whether the model's predicted score would cover.</li>
                            <li>Over/Under is the sportsbook over/under line for the game. Pred is the model's predicted over/under by if total score greater or less than.</li>
                            <li>Pred Score is the model's predicted score for the home team and away team. In parentheses is predicted winner</li>
                        </ul>
                    </div>
                )}
            </div>
            <NestedTable
                headers = {[
                    'Matchup (Home vs Away)',
                    'Time',
                    'Spread (Pred Cover)',
                    'Over/Under (Pred)',
                    'Pred Score (Pred Winner)',
                ]}
                columnOrder={[
                    { key: ['home_team_char_id', 'away_team_char_id', 'home_moneyline', 'away_moneyline'], transformer: (home_team_char_id: string, away_team_char_id: string, home_moneyline: number, away_moneyline: number) => `${home_team_char_id} (${home_moneyline}) vs ${away_team_char_id} (${away_moneyline})` },
                    { key: ['weekday', 'time'], transformer: (weekday: string, time: string) => `${weekday ? weekday.substring(0, 3) : ''} ${moment(time, 'HH:mm:ss').format('h:mm A')}` },
                    { key: ['model_predictions', 'spread', 'home_moneyline', 'away_moneyline'], transformer: (model_predictions: any, spread: number, home_moneyline: number, away_moneyline: number) => (home_moneyline < away_moneyline ? -spread : spread) + ' (' + (model_predictions[0]?.cover_spread ? 'Y' : 'N') + ')' },
                    { key: ['model_predictions', 'over_under'], transformer: (model_predictions: any, over_under: number) => over_under + ' (' + model_predictions[0]?.over_under + ')' },
                    { key: null, transformer: getPredScoreColText },
                ]}
                data={games}
                onRowClick={(row) => console.log(row)}
            />
        </div>
    );
}

export default Page;