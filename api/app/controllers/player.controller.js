const nflDb = require('../models').nfl;
const Player = nflDb.players;
const { Op } = require("sequelize");

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
        let queryObj = {limit: 100}
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


        const players = await Player.findAll(queryObj);
        res.send(players);
    } catch (err) {
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