'use client'

import React, { FunctionComponent } from 'react';
import NestedTable from '@/components/tables/nestedTable.component';
import GameService from '@/services/Game.service';
import Game from '@/interfaces/game.interface';

const Page: FunctionComponent<{}> = () => {
    const [games, setGames] = React.useState<Game[]>([]);
    const [season, setSeason] = React.useState<number>(2024);
    const [week, setWeek] = React.useState<number>(1);

    React.useEffect(() => {
        const fetchGames = async () => {
            GameService.getGamesByWeek({ season, week, withModelPredictions: true }).then((data) => {
                // take data, if present, and sort by date and time
                setGames(data);
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
                    'Matchup',
                    'Day',
                    'Time',
                    'Home Moneyline',
                    'Away Moneyline',
                    'Pred H Score',
                    'Pred A Score',
                    'Pred O/U',
                    'Pred Spread'
                ]}
                columnOrder={[
                    { key: ['home_team_char_id', 'away_team_char_id'], transformer: (home_team_char_id: string, away_team_char_id: string) => `${home_team_char_id} vs ${away_team_char_id}` },
                    'weekday',
                    'time',
                    'home_moneyline',
                    'away_moneyline',
                    { key: ['model_predictions'], transformer: (model_predictions: any) => model_predictions[0]?.home_team_score },
                    { key: ['model_predictions'], transformer: (model_predictions: any) => model_predictions[0]?.away_team_score },
                    { key: ['model_predictions'], transformer: (model_predictions: any) => model_predictions[0]?.over_under },
                    { key: ['model_predictions'], transformer: (model_predictions: any) => model_predictions[0]?.spread },
                ]}
                data={games}
                onRowClick={(row) => console.log(row)}
            />
        </div>
    );
}

export default Page;