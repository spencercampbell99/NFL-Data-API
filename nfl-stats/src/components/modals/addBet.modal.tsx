'use client'

import { FC, useState, FormEvent, useEffect } from 'react';
import Modal from './base.modal';
import Game from '@/interfaces/game.interface';
import BetService from '@/services/Bet.service';

interface CreateBetModalProps {
    isOpen: boolean;
    onClose: () => void;
    overrideGames?: Game[];
}

const convertAmericanToDecimalOdds = (americanOdds: number): number => {
    if (americanOdds > 0) {
        return americanOdds / 100 + 1;
    } else {
        return 100 / Math.abs(americanOdds) + 1;
    }
}

const CreateBetModal: FC<CreateBetModalProps> = ({ isOpen, onClose, overrideGames }) => {
    const [game, setGame] = useState<Game | null>(null);
    const [wager, setWager] = useState(0);
    const [betType, setBetType] = useState('STRAIGHT');
    const [lineType, setLineType] = useState('MONEYLINE');
    const [lineValue, setLineValue] = useState('');
    const [games, setGames] = useState<Game[]>([]);
    const [seasonFilter, setSeasonFilter] = useState<number>(-1);
    const [weekFilter, setWeekFilter] = useState<number>(-1);

    useEffect(() => {
        if (!overrideGames) {
            const fetchGames = async () => {
                BetService.listGamesForBetSelectoin().then((response) => {
                    setGames(response);
                }).catch((error) => {
                    console.error('Error fetching games:', error);
                });
            };

            fetchGames();
        } else {
            setGames(overrideGames);
        }
    }, [overrideGames]);

    const handleSelectGame = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGame = games.find((game) => game.id === parseInt(e.target.value));
        if (selectedGame) {
            setGame(selectedGame);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (wager > 0 && game?.id && lineValue) {
            //   onCreateBet(gameId, wager, betType, lineType, lineValue);
            onClose();
        } else {
            alert('Please enter a valid wager amount, select a game, and select a line.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl mb-4">Create New Bet</h2>
            <form onSubmit={handleSubmit}>
                <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                        <label className="block mb-2">Season Filter</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={seasonFilter}
                            onChange={(e) => setSeasonFilter(parseInt(e.target.value))}
                            required
                        >
                            <option value="-1">Select a season</option>
                            {/* Replace with actual season options */}
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2">Week Filter</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={weekFilter}
                            onChange={(e) => setWeekFilter(parseInt(e.target.value))}
                            required
                        >
                            <option value="-1">Select a week</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((week) => (
                                <option key={week} value={week}>
                                    {week}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Game</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={game?.id || ''}
                        onChange={handleSelectGame}
                        required
                    >
                        <option value="">Select a game</option>
                        {games
                            ?.filter((game) => (seasonFilter === -1 || game.season === seasonFilter) && (weekFilter === -1 || game.week === weekFilter))
                            .map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.away_team_char_id} @ {game.home_team_char_id} ({game.date.substring(0, 10)})
                                </option>
                            ))}
                    </select>
                </div>

                {game && (
                    <div className="p-4 border rounded-lg mt-4 mb-2">
                        <h3 className="text-lg font-semibold mb-2">Game Overview</h3>
                        <p><strong>{game.home_team_char_id} Moneyline:</strong> {game.home_moneyline}</p>
                        <p><strong>{game.away_team_char_id} Moneyline:</strong> {game.away_moneyline}</p>
                        <p><strong>Spread ({game.away_team_char_id}):</strong> {game.spread}</p>
                        <p><strong>Over/Under:</strong> {game.over_under}</p>
                        {game.home_score !== null && game.away_score !== null && (
                            <p><strong className="text-red-800">Game already completed!</strong></p>
                        )}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-2">Wager Amount</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={wager}
                        onChange={(e) => setWager(Number(e.target.value))}
                        min="0"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Bet Type</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={betType}
                        onChange={(e) => setBetType(e.target.value)}
                        required
                    >
                        <option value="STRAIGHT">STRAIGHT</option>
                        {/* <option value="PARLAY">PARLAY</option> */}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Line Type</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={lineType}
                        onChange={(e) => setLineType(e.target.value)}
                        required
                    >
                        <option value="MONEYLINE">Moneyline</option>
                        <option value="OVER_UNDER">Over/Under</option>
                        <option value="SPREAD">Spread</option>
                    </select>
                </div>

                {lineType === 'MONEYLINE' && (
                    <div className="mb-4">
                        <label className="block mb-2">Select Team</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={lineValue}
                            onChange={(e) => setLineValue(e.target.value)}
                            required
                        >
                            <option value="">Select a team</option>
                            {game && (
                                <>
                                    <option value={game.home_team_char_id}>{game.home_team_char_id}</option>
                                    <option value={game.away_team_char_id}>{game.away_team_char_id}</option>
                                </>
                            )}
                        </select>
                    </div>
                )}

                {lineType === 'OVER_UNDER' && (
                    <div className="mb-4">
                        <label className="block mb-2">Total Points</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={game?.over_under}
                            // onChange={(e) => setLineValue(e.target.value)}
                            disabled={true}
                            required
                        />
                    </div>
                )}

                {lineType === 'SPREAD' && (
                    <div className="mb-4">
                        <label className="block mb-2">Spread Value</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={game?.spread || 0}
                            // onChange={(e) => setLineValue(e.target.value)}
                            disabled={true}
                            required
                        />
                    </div>
                )}

                {game && (
                    <div className="p-4 border rounded-lg mt-4 mb-2">
                        <h3 className="text-lg font-semibold mb-2">Bet Overview</h3>
                        <p><strong>Game:</strong> {game.away_team_char_id} @ {game.home_team_char_id}</p>
                        <p><strong>Wager:</strong> ${wager}</p>
                        <p><strong>Potential Return</strong> ${(wager * convertAmericanToDecimalOdds(
                            lineType === 'MONEYLINE'
                                ? lineValue === game.home_team_char_id
                                    ? game.home_moneyline
                                    : game.away_moneyline
                                : lineType === 'OVER_UNDER'
                                    ? -110
                                    : -110
                        )).toFixed(2)}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Create Bet
                </button>
            </form>
        </Modal>
    );
};

export default CreateBetModal;
