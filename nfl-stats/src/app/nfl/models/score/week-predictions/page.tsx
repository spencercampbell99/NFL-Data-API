'use client'

import React, { FunctionComponent } from 'react';
import NestedTable from '@/components/tables/nestedTable.component';
import GameService from '@/services/Game.service';
import Game from '@/interfaces/game.interface';

const Page: FunctionComponent<{}> = () => {
    const [games, setGames] = React.useState<Game[]>([]);
    const [season, setSeason] = React.useState<number>(2024);
    const [week, setWeek] = React.useState<number>(6);

    React.useEffect(() => {
        const fetchGames = async () => {
            GameService.getGamesByWeek({ season, week, withModelPredictions: true }).then((data) => {
                // take data, if present, and sort by date and time
                setGames(data);
                console.log(data)
            }).catch((error) => {
                console.error('Error fetching games:', error);
            })
        }
        fetchGames();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Games</h1>
            <NestedTable
                headers = {[
                    'Matchup (Home vs Away)',
                    'Time',
                    'Home Moneyline',
                    'Away Moneyline',
                    'Spread (Pred)',
                    'Over/Under (Pred)',
                    'Pred Result',
                ]}
                columnOrder={[
                    { key: ['home_team_char_id', 'away_team_char_id'], transformer: (home_team_char_id: string, away_team_char_id: string) => `${home_team_char_id} vs ${away_team_char_id}` },
                    { key: ['weekday', 'time'], transformer: (weekday: string, time: string) => `${weekday} ${time}` },
                    'home_moneyline',
                    'away_moneyline',
                    { key: ['model_predictions', 'spread', 'home_moneyline', 'away_moneyline'], transformer: (model_predictions: any, spread: number, home_moneyline: number, away_moneyline: number) => (home_moneyline < away_moneyline ? -spread : spread) + ' (' + (model_predictions[0]?.cover_spread ? 'Y' : 'N') + ')' },
                    { key: ['model_predictions', 'over_under'], transformer: (model_predictions: any, over_under: number) => over_under + ' (' + model_predictions[0]?.over_under + ')' },
                    { key: ['model_predictions', 'home_team_char_id', 'away_team_char_id'], transformer: (model_predictions: any, home_team_char_id: string, away_team_char_id: string) => home_team_char_id + ' ' + model_predictions[0]?.home_team_score + ' - ' + model_predictions[0]?.away_team_score + ' ' + away_team_char_id },
                ]}
                data={games}
                onRowClick={(row) => console.log(row)}
            />
        </div>
    );
}

export default Page;