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
            attributes: idsOnly ? ['id', 'espn_id'] : undefined
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
            attributes: ['id', 'home_team_char_id', 'away_team_char_id', 'spread', 'over_under', 'date', 'home_moneyline', 'away_moneyline', 'home_score', 'away_score'],
            include: [
                {
                    model: db.teams,
                    as: 'home_team',
                    attributes: [['short_display_name', 'team_name'], ['team_logo_wikipedia', 'wiki_logo_url']],
                },
                {
                    model: db.teams,
                    as: 'away_team',
                    attributes: [['short_display_name', 'team_name'], ['team_logo_wikipedia', 'wiki_logo_url']],
                },
            ],
        });

        // build name and short name
        games.forEach(game => {
            game.short_name = `${game.away_team_char_id} @ ${game.home_team_char_id}`;
            game.name = `${game.away_team.team_name} @ ${game.home_team.team_name}`;
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