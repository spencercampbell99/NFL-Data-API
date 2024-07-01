const db = require('../models');
const nflDb = require('../models').nfl;
const User = db.users;
const Bet = db.bets;
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
            ],
        });

        return res.status(200).send(bets);
    } catch (err) {
        console.log(err);
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
            attributes: ['id', 'date', 'season', 'week', 'home_team_char_id', 'away_team_char_id', 'home_score', 'away_score', 'spread', 'over_under', 'home_moneyline', 'away_moneyline'],
        });

        // order by date DESC
        games.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        return res.status(200).send(games);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}