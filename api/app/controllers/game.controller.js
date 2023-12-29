const db = require('../models');
const Schedule = db.schedules;

/**
 * Find game by id
 * @param {number} id - The game id.
 * @returns {Schedule}
 */
exports.find = async (id) => {
    try {
        const game = await Schedule.findByPk(id);
        return game;
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Get games by week and season
 * @param {number} week - The week number.
 * @param {number} season - The season.
 * @param {boolean} idsOnly - Whether to return just the ids or the full game objects.
 * @returns {[Schedule]}
 */
exports.getGamesBySeasonAndWeek = async ({ week, season, idsOnly = true }) => {
    try {
        const games = await Schedule.findAll({
            where: {
                week: week,
                season: season,
            },
            attributes: idsOnly ? ['id'] : undefined
        });
        return games;
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Get overview of games by week and season for display.
 * 
 * @api {get} /api/games/overview/:season/:week Get overview of games by week and season for display
 * @apiName GetGamesOverviewBySeasonAndWeek
 * @apiGroup Game
 * @apiPermission none
 * 
 * @apiParam {number} season - The season.
 * @apiParam {number} week - The week number.
 * 
 * @apiSuccess {object} data - The data object.
 * @apiSuccess {object[]} data.games - The games.
 * 
 * @returns {object}
 */
exports.getGamesOverviewBySeasonAndWeek = async (req, res) => {
    try {
        const { season, week } = req.params;
        const games = await Schedule.findAll({
            where: {
                week: week,
                season: season,
            },
            attributes: ['id', 'name', 'short_name', 'home_team_char_id', 'away_team_char_id', 'spread', 'over_under', 'date', ['home_team_money_line', 'home_moneyline'], ['away_team_money_line', 'away_moneyline']],
            include: [
                {
                    model: db.boxscores,
                    where: {
                        home_team: true
                    },
                    as: 'boxscores',
                    attributes: [['points_scored', 'home_score'], ['points_allowed', 'away_score']],
                }
            ],
        });
        res.status(200).send({
            games: games,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: 'Error retrieving games',
        });
    }
}