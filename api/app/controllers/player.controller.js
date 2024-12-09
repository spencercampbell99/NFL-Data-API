const nflDb = require('../models').nfl;
const Player = nflDb.players;
const { Op } = require("sequelize");
const getTemplateQuery = require('../helpers').getTemplateQuery;

/**
 * List first 100 players
 * 
 * @param {*} req 
 * @param {*} res
 * @returns {Object} - response object
 * 
 * @example
 * list(req, res);
 * 
 * Body can contain:
 * - ?attributes: ['id', 'full_name']
 * - ?search=
 * - ?team_id=
 * - ?position=
 * - ?active=true/false
 * - ?all=false
 */
exports.list = async (req, res) => {
    try {
        // parse query params
        let queryObj = {limit: 100, raw: true};
        let whereObj = {}
        if (req.body.search !== null && req.body.search !== undefined) {
            whereObj.full_name = {
                [Op.like]: `%${req.body.search}%`
            }
        }
        if (req.body.team_id !== null && req.body.team_id !== undefined) {
            whereObj.team_id = req.body.team_id;
        }
        if (req.body.position !== null && req.body.position !== undefined) {
            whereObj.position = req.body.position;
        }
        if (req.body.active !== null && req.body.active !== undefined) {
            whereObj.active = req.body.active == 'true' || req.body.active == true;
        }
        if (req.body.attributes && req.body.attributes.length > 0) {
            queryObj.attributes = req.body.attributes;
        } else {
            queryObj.attributes = ['id', 'full_name'];
        }
        if (req.body.all && (req.body.all == 'true' || req.body.all == true)) {
            // remove limit
            delete queryObj.limit;
        }
        queryObj.where = whereObj;

        console.log(queryObj);

        // join in team on team_id and select team_char_id if team is in attributes
        let flattenTeamCharId = false;
        if (queryObj.attributes.includes('team')) {
            queryObj.include = [{
                model: nflDb.teams,
                as: 'team',
                attributes: [['char_id', 'team']]
            }];
            queryObj.attributes = queryObj.attributes.filter(attr => attr !== 'team');
            flattenTeamCharId = true;
        }

        const players = await Player.findAll(queryObj);

        // if (flattenTeamCharId) {
        //     players.forEach(player => {
        //         player.team = player['team.team'] ?? 'N/A';
        //     });
        // }

        res.send(players);
    } catch (err) {
        console.log(err)
        res.status(500).send({
            message: err.message || "An error occurred while retrieving players."
        });
    }
};

/**
 * Get player by id
 * 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} - response object
 * 
 * @example
 * getPlayerById(req, res);
 */
exports.getPlayerById = async (req, res) => {
    try {
        const playerId = req.params.id;

        if (!playerId) {
            return res.status(400).send({
                message: "playerId is required."
            });
        }

        const player = await Player.findByPk(playerId);

        // return
        res.send(player);
    } catch (err) {
        res.status(500).send({
            message: err.message || "An error occurred while retrieving player."
        });
    }
}

/**
 * Get player overivew for season
 * 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * 
 * @returns {Object} - response object
 */
exports.getPlayerOverviewBySeason = async (req, res) => {
    try {
        const playerId = req.params.id;
        const season = req.params.season;

        if (!playerId) {
            return res.status(400).send({
                message: "playerId is required."
            });
        }

        if (!season) {
            return res.status(400).send({
                message: "season is required."
            });
        }

        let player = await Player.findByPk(playerId, {
            include: [{
                model: nflDb.teams,
                as: 'team',
                attributes: [['char_id', 'team']]
            }]
          });

        if (!player) {
            return res.status(404).send({
                message: "Player not found."
            });
        }

        // keep just player field data
        player = player.get({plain: true});

        try {
            // switch to get stats for player at season
            let season_stats = [];
            switch (player.position) {
                case 'QB':
                    season_stats = await _getQBStatsForSeason(playerId, season);
                    break;
                default:
                    break;
            }

            player.season_stats = season_stats;
        } catch (err) {
            console.log(err);
            res.status(500).send({
                message: err.message || "An error occurred while retrieving player stats."
            });

            return;
        }

        // return
        res.send(player);
    } catch (err) {
        console.log(err);

        res.status(500).send({
            message: err.message || "An error occurred while retrieving player."
        });
    }
}

/**
 * Get QB aggregate stats for player at season
 * 
 * @param {int} playerId - player id
 * @param {int} season - season
 * 
 * @returns {Object} - response object
 */
_getQBStatsForSeason = async (playerId, season) => {
    const query = getTemplateQuery('players/QBSeasonOverview.sql', {':playerId': playerId, ':season': season});

    const qbStats = await nflDb.sequelize.query(query, {
        type: nflDb.Sequelize.QueryTypes.SELECT,
        logging: false,
    });

    return qbStats;
}