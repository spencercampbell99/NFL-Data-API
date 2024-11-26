'use client'

import React, { FunctionComponent } from 'react';
import NestedTable from '@/components/tables/nestedTable.component';
import GameService from '@/services/Game.service';
import Game from '@/interfaces/game.interface';
import RoundedButton from '@/components/roundedButton.component';
import { BasicDropdown } from '@/components/commonDropdowns';
import { SeasonWeekSelector } from '@/components/commonComponents';

const seasons = [2023, 2024]
const weeksToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

const Page: FunctionComponent<{}> = () => {
    const [games, setGames] = React.useState<Game[]>([]);
    const [season, setSeason] = React.useState<number>(2024);
    const [week, setWeek] = React.useState<number>(7);
    const [amountToBet, setAmountToBet] = React.useState<number>(100);

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
            games.forEach((game) => {
                if (!game.home_score && game.home_score !== 0) {
                    return;
                }

                let modelPredictions = game.model_predictions[0];
                if (!modelPredictions) {
                    return;
                }

                if (!modelPredictions.correct_winner) {
                    return;
                }

                let winnerMoneyline = modelPredictions.home_win ? game.home_moneyline : game.away_moneyline;
                let decimalOdds = winnerMoneyline < 0 ? 100 / Math.abs(winnerMoneyline) + 1 : winnerMoneyline / 100 + 1;

                if (modelPredictions.suggested_moneyline_percent_bet) {
                    totalMoneyWon += modelPredictions.suggested_moneyline_percent_bet * amountToBet * decimalOdds
                }
            });
            setMoneyWon(totalMoneyWon.toFixed(2));
        }
    }, [games, amountToBet]);

    return (
        <div>
            {/* <h1 className="text-2xl font-semibold text-gray-800 mb-4">Games</h1> */}
            <div className="mb-4 w-full">
                <div className="flex flex-row items-center justify-center m-4">
                    <SeasonWeekSelector season={season} week={week} setSeason={setSeason} setWeek={setWeek} buttonText="Go" onClick={fetchGames} overrideSeasons={seasons} overrideWeeks={weeksToShow} />
                </div>
                {false ? 
                    <>
                        <div className="mt-4 w-[15%] mx-auto text-center">
                            <label>Amount to Bet</label>
                            <input type="number" value={amountToBet} onChange={(e) => setAmountToBet(parseInt(e.target.value))} className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="mt-4 w-[15%] mx-auto text-center">
                            <label>Money Won (with suggested bets)</label>
                            <input type="text" value={`$${moneyWon}`} readOnly className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </>
                : null}
            </div>
            <NestedTable
                headers = {[
                    'Matchup (Home vs Away)',
                    'Time',
                    'Spread (Pred)',
                    'Over/Under (Pred)',
                    'Pred Score (Score Model)',
                    // 'Pred Winner (Winner Model)',
                    // 'Suggested Bet',
                ]}
                columnOrder={[
                    { key: ['home_team_char_id', 'away_team_char_id', 'home_moneyline', 'away_moneyline'], transformer: (home_team_char_id: string, away_team_char_id: string, home_moneyline: number, away_moneyline: number) => `${home_team_char_id} (${home_moneyline}) vs ${away_team_char_id} (${away_moneyline})` },
                    { key: ['weekday', 'time'], transformer: (weekday: string, time: string) => `${weekday} ${time}` },
                    { key: ['model_predictions', 'spread', 'home_moneyline', 'away_moneyline'], transformer: (model_predictions: any, spread: number, home_moneyline: number, away_moneyline: number) => (home_moneyline < away_moneyline ? -spread : spread) + ' (' + (model_predictions[0]?.cover_spread ? 'Y' : 'N') + ')' },
                    { key: ['model_predictions', 'over_under'], transformer: (model_predictions: any, over_under: number) => over_under + ' (' + model_predictions[0]?.over_under + ')' },
                    { key: ['model_predictions', 'home_team_char_id', 'away_team_char_id'], transformer: (model_predictions: any, home_team_char_id: string, away_team_char_id: string) => home_team_char_id + ' ' + model_predictions[0]?.home_team_score + ' - ' + model_predictions[0]?.away_team_score + ' ' + away_team_char_id },
                    // { key: ['model_predictions', 'home_team_char_id', 'away_team_char_id'], transformer: (model_predictions: any, home_team_char_id: string, away_team_char_id: string) => model_predictions[0]?.home_win != null ? (model_predictions[0]?.home_win ? home_team_char_id : away_team_char_id) : 'N/A' },
                    // { key: ['model_predictions'], transformer: (model_predictions: any) => `${Math.round(model_predictions[0]?.suggested_moneyline_percent_bet * 100)}% ($${(amountToBet * model_predictions[0]?.suggested_moneyline_percent_bet).toFixed(2)})` },
                ]}
                data={games}
                onRowClick={(row) => console.log(row)}
            />
        </div>
    );
}

export default Page;