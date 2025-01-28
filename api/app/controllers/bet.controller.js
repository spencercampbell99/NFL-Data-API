const db = require('../models');
const nflDb = require('../models').nfl;
const User = db.users;
const Bet = db.bets;
const BetLeg = db.betLegs;
const Schedule = nflDb.schedules;

/**
 * List all bets for authed user.
 * 
 * @param {*} req The request.
 * @param {*} res The response.
 * 
 * @returns {Object} The response object.
 * @throws {Error} If there is an error during the process.
 * @async
 */
exports.list = async (req, res) => {
    try {
        const userId = req.user.id;

        const bets = await Bet.findAll({
            where: { bettor_id: userId },
            include: [
                {
                    model: User,
                    as: 'bettor',
                    attributes: ['id', 'username'],
                },
                {
                    model: BetLeg,
                    as: 'legs',
                    attributes: ['id', 'game_id', 'line_type', 'wager', 'line_value', 'odds', 'won', 'over_line', 'push', 'team_id', 'settled', 'settled_at'],
                    include: [
                        {
                            model: Schedule,
                            as: 'game',
                            attributes: ['home_team_char_id', 'away_team_char_id', 'home_team_id', 'away_team_id'],
                        },
                    ]
                }
            ],
        });

        return res.status(200).send(bets);
    } catch (err) {
        console.log(err?.message);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * List games for bet selection.
 * 
 * @param {*} req The request.
 * @param {*} res The response.
 * 
 * @returns {Object} The response object.
 * @throws {Error} If there is an error during the process.
 * @async
 */
exports.gamesForBetSelection = async (req, res) => {
    try {
        // get query params if available
        const { date, team } = req.query;
        
        // default season >= 2023
        let where = {
            season: {
                [db.Sequelize.Op.gte]: 2023,
            },
        };
        if (date) {
            where.date = date;
        }
        if (team) {
            where.$or = [
                { home_team: team },
                { away_team: team },
            ];
        }

        // get all games
        const games = await Schedule.findAll({
            where,
            attributes: ['id', 'date', 'season', 'week', 'home_team_char_id', 'away_team_char_id', 'home_team_id', 'away_team_id', 'home_score', 'away_score', 'spread', 'over_under', 'home_moneyline', 'away_moneyline'],
        });

        // order by date DESC
        games.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        return res.status(200).send(games);
    } catch (err) {
        console.log(err?.message);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Creates a new bet.
 * 
 * @param {*} req The request.
 * @param {*} res The response.
 * 
 * @returns {Object} The response object.
 * @throws {Error} If there is an error during the process.
 * @async
 */
exports.create = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bet_legs } = req.body;

        // extract game ids from bet_legs
        const gameIds = [...new Set(bet_legs.map(betLeg => betLeg.game_id))];

        // get games
        const games = await Schedule.findAll({
            where: { id: gameIds },
            attributes: ['id', 'date', 'home_team_id', 'away_team_id', 'home_score', 'away_score', 'spread', 'over_under', 'home_moneyline', 'away_moneyline'],
        });

        // make sure all games exist
        if (games.length !== gameIds.length) {
            return res.status(404).send({ message: 'Invalid game id.' });
        }

        let totalWager = 0;
        let totalOdds = 0;
        let betLegsToInsert = [];
        let oddsWon = 1;
        let allSettled = true;

        for (let i = 0; i < bet_legs.length; i++) {
            const betLeg = bet_legs[i];
            const game = games.find(game => game.id === betLeg.game_id);

            // handle type conversions
            betLeg.wager = parseFloat(betLeg.wager);
            betLeg.line_value = parseFloat(betLeg.line_value);
            betLeg.over_line = betLeg.over_line === 'true' ? 1 : 0;
            betLeg.team_id = parseInt(betLeg.team_id);

            // get oods based on bet_leg type
            let odds;
            switch (betLeg.line_type) {
                case 'SPREAD':
                    odds = game.spread;
                    break;
                case 'MONEYLINE':
                    odds = game.home_moneyline;
                    break;
                case 'TOTAL_SCORE':
                    odds = game.over_under;
                    break;
            }

            // convert to decimal
            if (odds > 0) {
                odds = odds / 100 + 1;
            } else {
                odds = Math.abs(odds) / 100 + 1;
            }

            totalWager += betLeg.wager;
            
            if (i === 0) {
                totalOdds = odds;
            } else {
                totalOdds *= odds;
            }

            const gameIsFinished = game.home_score !== null && game.away_score !== null;
            let _betToInsert = {
                game_id: betLeg.game_id,
                line_type: betLeg.line_type,
                line_value: betLeg.line_value || null,
                team_id: betLeg.team_id || null,
                over_line: betLeg.over_line,
                wager: betLeg.wager,
                odds: odds,
                bettor_id: userId
            }

            if (gameIsFinished) {
                try {
                    const betLegStatus = getBetLegStatus({
                        game,
                        lineType: betLeg.line_type,
                        lineOver: betLeg.over_line ?? false,
                        teamId: betLeg.team_id ?? null,
                        lineValue: betLeg.line_value ?? null,
                    });

                    _betToInsert = {
                        ..._betToInsert,
                        won: betLegStatus.won,
                        push: betLegStatus.push,
                        settled: betLegStatus.settled,
                        settled_at: new Date(),
                    };
    
                    // if bet leg is won, multiply oddsWon
                    if (betLegStatus.won && oddsWon !== 0) {
                        oddsWon *= odds;
                    } else {
                        oddsWon = 0;
                    }
    
                    if (!betLegStatus.settled) {
                        allSettled = false;
                    }
                } catch (err) {
                    console.log(err?.message)
                    return res.status(400).send({ message: "Something went wrong calculating bet status" });
                }
            } else {
                oddsWon = 0;
                allSettled = false;
            }

            betLegsToInsert.push(_betToInsert);
        }

        // create bet
        const result = await db.sequelize.transaction(async (t) => {
            let bet = await Bet.create({
                wager: totalWager,
                total_odds: totalOdds,
                amount_to_win: totalWager * totalOdds,
                bettor_id: userId,
                type: 'STRAIGHT',
                amount_won: totalWager * oddsWon,
                amount_lost: allSettled && oddsWon === 0 ? totalWager : 0,
                settled: allSettled,
                settled_at: allSettled ? new Date() : null,
            }, { transaction: t });

            // add bet id to betLegs
            betLegsToInsert = betLegsToInsert.map(betLeg => {
                return {
                    ...betLeg,
                    bet_id: bet.id,
                }
            });

            await BetLeg.bulkCreate(betLegsToInsert, { transaction: t });

            bet = await Bet.findByPk(bet.id, {
                include: [
                    {
                        model: User,
                        as: 'bettor',
                        attributes: ['id', 'username'],
                    },
                    {
                        model: BetLeg,
                        as: 'legs',
                        attributes: ['id', 'game_id', 'line_type', 'line_value', 'odds', 'won', 'push', 'settled', 'settled_at'],
                    }
                ],
            });

            return bet;
        });

        return res.status(200).send(result);
    } catch (err) {
        console.log(err?.message);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Delete bets for authed user.
 * 
 * @param {*} req The request.
 * @param {*} res The response.
 * 
 * @returns {Object} The response object.
 */
exports.deleteMyBets = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).send({ message: 'Auth user is required.' });
        }

        await Bet.destroy({ where: { bettor_id: userId } });

        return res.status(200).send({ message: 'Bets deleted.' });
    } catch (err) {
        console.log(err?.message);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Get bet leg status
 * 
 * @param {Game} game The game.
 * @param {string} lineType The line type.
 * @param {boolean|null} lineOver? The line over value.
 * @param {number|null} teamId? Team 
 * @param {number|null} lineValue? The line value.
 * 
 * @returns {object} The bet leg status.
 */
function getBetLegStatus({ game, lineType, lineOver = null, teamId = null, lineValue = null }) {
    let result = {
        won: false,
        settled: false,
        push: false,
    };

    if (game.home_score === null || game.away_score === null) {
        return result;
    }

    switch (lineType) {
        case 'SPREAD':
            if (lineValue === null || teamId === null) {
                throw new Error('Line value and teamId are required for SPREAD bet leg.');
            }

            let spread;
            if (teamId === game.home_team_id) {
                spread = -game.home_score + game.away_score;
            } else {
                spread = -game.away_score + game.home_score;
            }

            if (lineValue === spread) {
                result.push = true;
                break;
            }

            if (lineValue < 0) {
                if (spread < lineValue) {
                    result.won = true;
                }
            } else {
                if (spread > lineValue) {
                    result.won = true;
                }
            }

            break;
        case 'MONEYLINE':
            if (teamId == null) {
                throw new Error('Team ID is required for MONEYLINE bet leg.');
            }

            if (teamId === game.home_team_id && game.home_score > game.away_score) {
                result.won = true;
            } else if (teamId === game.away_team_id && game.away_score > game.home_score) {
                result.won = true;
            } else if (game.home_score === game.away_score) {
                result.push = true;
            }

            break;
        case 'TOTAL_SCORE':
            if (lineOver === null || lineValue === null) {
                throw new Error('Line over value is required for TOTAL_SCORE bet leg.');
            }

            const totalScore = game.home_score + game.away_score;

            if (totalScore === lineValue) {
                result.push = true;
                break;
            }

            if (lineOver) {
                if (totalScore > lineValue) {
                    result.won = true;
                }
            } else {
                if (totalScore < lineValue) {
                    result.won = true;
                }
            }
            break;
    }

    result.settled = true;

    return result;
}