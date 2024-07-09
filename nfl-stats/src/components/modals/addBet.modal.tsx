'use client'

import { FC, useState, FormEvent, useEffect } from 'react';
import Modal from './base.modal';
import Game from '@/interfaces/game.interface';
import BetService from '@/services/Bet.service';
import Bet from '@/interfaces/bet.interface';
import BetLeg from '@/interfaces/betLeg.interface';

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

const SelectTeam = ({ game, teamId, setTeamId }: { game: Game, teamId: string, setTeamId: (value: string) => void }) => {
    return (
        <div className="mb-4">
            <label className="block mb-2">Select Team</label>
            <select
                className="w-full p-2 border rounded"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
            >
                <option value="">Select a team</option>
                {game && (
                    <>
                        <option value={game.home_team_id}>{game.home_team_char_id}</option>
                        <option value={game.away_team_id}>{game.away_team_char_id}</option>
                    </>
                )}
            </select>
        </div>
    );
}

const OverOrUnderLineSelect = ({ overLine, setOverLine }: { overLine: boolean, setOverLine: (value: boolean) => void }) => {
    return (
        <div className="mb-4">
            <label className="block mb-2">Select Over or Under</label>
            <select
                className="w-full p-2 border rounded"
                value={overLine ? 'OVER' : 'UNDER'}
                onChange={(e) => setOverLine(e.target.value === 'OVER')}
                required
            >
                <option value="OVER">Over</option>
                <option value="UNDER">Under</option>
            </select>
        </div>
    );
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
    const [overLine, setOverLine] = useState(false);
    const [chosenTeamId, setChosenTeamId] = useState<string | null>(null);

    useEffect(() => {
        if (!overrideGames) {
            const fetchGames = async () => {
                BetService.listGamesForBetSelection().then((response) => {
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

    useEffect(() => {
        // reset selections on game change
        setLineValue('');
        setChosenTeamId(null);
        setOverLine(false);
    }, [game]);

    useEffect(() => {
        if (game) {
            if (lineType === 'MONEYLINE') {
                //
            } else if (lineType === 'TOTAL_SCORE') {
                setLineValue(game.over_under.toString());
            } else if (lineType === 'SPREAD') {
                setLineValue(game.spread.toString());
            }
        }
    }, [game, lineType]);

    const handleSelectGame = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGame = games.find((game) => game.id === parseInt(e.target.value));
        if (selectedGame) {
            setGame(selectedGame);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!game || wager == 0) {
            alert('Please select a game and enter a valid wager amount.');
            return;
        }

        // build the bet objects
        // const bet: Bet = {
        //     'bet_type': betType,
        // };
        const betLegs: BetLeg[] = [
            {
                'game_id': game.id || 0,
                'line_type': lineType,
                'line_value': lineValue ? parseFloat(lineValue) : undefined,
                'team_id': chosenTeamId ? parseInt(chosenTeamId) : undefined,
                'over_line': overLine ? true : false,
                'wager': wager,
            }
        ];

        try {
            let res = await BetService.createBet({ bet: {}, bet_legs: betLegs });

            if (res) {
                onClose();
            }
        } catch (error) {
            console.error('Error creating bet:', error);
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
                        <option value="TOTAL_SCORE">Over/Under</option>
                        <option value="SPREAD">Spread</option>
                    </select>
                </div>

                {lineType === 'MONEYLINE' && game && (
                    <SelectTeam game={game} teamId={chosenTeamId || ''} setTeamId={setChosenTeamId} />
                )}

                {lineType === 'TOTAL_SCORE' && (
                    <>
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
                        <OverOrUnderLineSelect overLine={overLine} setOverLine={setOverLine} />
                    </>
                )}

                {lineType === 'SPREAD' && game && (
                    <>
                        <div className="mb-4">
                            <label className="block mb-2">Spread Value</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={lineValue}
                                onChange={(e) => setLineValue(e.target.value)}
                                required
                            >
                                <option value="">Select a spread</option>
                                <option value={game.spread}>{game.spread}</option>
                                <option value={-game.spread}>-{game.spread}</option>
                            </select>
                        </div>
                        <SelectTeam game={game} teamId={chosenTeamId || ''} setTeamId={setChosenTeamId} />
                    </>
                )}

                {game && (
                    <div className="p-4 border rounded-lg mt-4 mb-2">
                        <h3 className="text-lg font-semibold mb-2">Bet Overview</h3>
                        <p><strong>Game:</strong> {game.away_team_char_id} @ {game.home_team_char_id}</p>
                        <p><strong>Wager:</strong> ${wager}</p>
                        <p><strong>Potential Return</strong> ${(wager * convertAmericanToDecimalOdds(
                            lineType === 'MONEYLINE' ? (chosenTeamId === game.home_team_id.toString() ? game.home_moneyline : game.away_moneyline) :
                            lineType === 'TOTAL_SCORE' ? game.over_under :
                            lineType === 'SPREAD' ? parseFloat(lineValue) : 0
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
