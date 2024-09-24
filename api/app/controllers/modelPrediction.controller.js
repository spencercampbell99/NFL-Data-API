const nflDb = require('../models').nfl;
const ModelPrediction = nflDb.modelPredictions;

/**
 * Get all model predictions for season and week for display.
 * 
 * @api {get} /api/model-predictions/overview/:season/:week Get all model predictions for season and week for display
 * @apiName GetModelPredictionsOverviewBySeasonAndWeek
 * @apiGroup ModelPrediction
 * 
 * @apiParam {number} season - The season.
 * @apiParam {number} week - The week number.
 * 
 * @apiSuccess {object} data - The data object.
 * 
 * @returns {object}
 * @throws {500} - Server error.
 */
exports.getModelPredictionsOverviewBySeasonAndWeek = async (req, res) => {
    try {
        const { season, week } = req.params;

        const modelPredictions = await ModelPrediction.findAll({
            include: [
                {
                    model: nflDb.schedules,
                    as: 'schedule',
                    where: {
                        season: season,
                        week: week,
                        game_type: 'REG',
                    },
                    attributes: ['season', 'week', 'over_under', 'spread', 'date', 'home_moneyline', 'away_moneyline', 'home_team_char_id', 'away_team_char_id'],
                    include: [
                        {
                            model: nflDb.boxscores,
                            as: 'boxscores',
                            where: {
                                home_team: true,
                            },
                            attributes: [['points_scored', 'home_score'], ['points_allowed', 'away_score']],
                        },
                    ],
                },
            ],
        });

        if (!modelPredictions) {
            return res.status(404).send({ message: 'Model predictions not found.' });
        }

        // add name column as away_team_char_id @ home_team_char_id
        modelPredictions.forEach(modelPrediction => {
            modelPrediction.schedule.dataValues.name = `${modelPrediction.schedule.dataValues.away_team_char_id} @ ${modelPrediction.schedule.dataValues.home_team_char_id}`;
        });

        return res.status(200).send({ modelPredictions });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Get model results for given season, and optionally weeks and teams.
 * 
 * @api {get} /api/model-predictions/analysis/:season Get model results for given season, and optionally weeks and teams
 * @apiName GetModelPredictionsAnalysisBySeason
 * @apiGroup ModelPrediction
 * 
 * @apiParam {number} season - The season.
 * @apiParam {number[]} [weeks] - The week numbers.
 * @apiParam {number[]} [teams] - The team ids.
 * 
 * @apiSuccess {object} data - The data object.
 * 
 * @returns {object}
 * @throws {500} - Server error.
 */
exports.getModelPredictionsAnalysisBySeason = async (req, res) => {
    try {
        // read in SQL query from file
        const fs = require('fs');
        const path = require('path');
        let sql = fs.readFileSync(path.join(__dirname, '../sql/models/ModelAnalysisBySeason.sql')).toString();

        let { season } = req.params;
        let { weeks, teams, min_spread } = req.query;

        // if any params = "null", set to null
        if (weeks.toLowerCase() === 'null') {
            weeks = null;
        } else {
            // manually replace SQL for :weeks IS NULL OR with ''
            sql = sql.replace(':weeks IS NULL OR', '');

            weeks = weeks.split(',').map(Number);
        }
        
        if (teams.toLowerCase() === 'null') {
            teams = null;
        } else {
            // manually replace SQL for :teams IS NULL OR with ''
            sql = sql.replace(/:teams IS NULL OR/g, '');

            teams = teams.split(',').map(Number);
        }
        
        if (min_spread.toLowerCase() === 'null') {
            min_spread = null;
        }

        const params = {
            season: season,
            weeks: weeks,
            teams: teams,
            min_spread: min_spread,
        };

        let modelPredictions = await nflDb.sequelize.query(sql, {
            replacements: params,
            type: nflDb.Sequelize.QueryTypes.SELECT,
            logging: false,
        });

        // limit to first row
        modelPredictions = modelPredictions[0];

        return res.status(200).send(modelPredictions);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * List all model predictions for given season, and optionally week and team
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * 
 * @api {get} /api/model-predictions/:season List all model predictions for given season, and optionally week and team
 * @apiName ListModelPredictionsBySeason
 * @apiGroup ModelPrediction
 * 
 * @apiParam {number} season - The season.
 * @apiParam {number[]} [week] - The week numbers
 * @apiParam {number[]} [team] - The team ids
 * @apiSuccess {object} data - The data object.
 * 
 * @returns {object}
 */
exports.listModelPredictionsBySeason = async (req, res) => {
    try {
        const { season } = req.params;
        let { week, team } = req.query;

        let gameWhere = {
            season: season,
        };

        if (week) {
            gameWhere.week = week;
        }

        if (team) {
            gameWhere.team_id = team;
        }

        const modelPredictions = await ModelPrediction.findAll({
            include: [
                {
                    model: nflDb.schedules,
                    as: 'schedule',
                    where: gameWhere,
                    attributes: ['season', 'week', 'home_team_id', 'away_team_id', 'home_score', 'away_score'],
                },
            ]
        });

        return res.status(200).send({ modelPredictions });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Update model predictions for given week to reflect actual results
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * 
 * @api {get} /api/model-predictions/settle-predictions/:season/:week Update model predictions for given week to reflect actual results
 * @apiName SettleModelPredictionsBySeasonAndWeek
 * @apiGroup ModelPrediction
 * 
 * @apiParam {number} season - The season.
 * @apiParam {number} week - The week number.
 * 
 * @apiSuccess {object} data - The data object.
 */
exports.settleModelPredictionsBySeasonAndWeek = async (req, res) => {
    try {
        const { season, week } = req.params;

        // Get the actual results from the database
        const actualResults = await nflDb.schedules.findAll({
            attributes: ['id', 'home_score', 'away_score', 'over_under', 'home_moneyline', 'away_moneyline'],
            where: {
                season: season,
                week: week,
                home_score: {
                    [nflDb.Sequelize.Op.not]: null
                }
            },
        });

        // get all model predictions for ids of actual results
        const modelPredictions = await ModelPrediction.findAll({
            where: {
                schedule_id: actualResults.map(result => result.id),
            },
        });

        // update model predictions with actual results
        await Promise.all(modelPredictions.map(async (modelPrediction) => {
            const actualResult = actualResults.find(result => result.id === modelPrediction.schedule_id);
            if (actualResult) {
                // calculate correct_winner, correct_spread, correcT_over_under, correct_underdog_win, home_team_error, away_team_error, total_error
                let correctWinner = (actualResult.home_score > actualResult.away_score) === (modelPrediction.home_team_score > modelPrediction.away_team_score);
                const newData = {
                    correct_winner: correctWinner,
                    correct_spread: _actualSpreadCovered(actualResult.home_score, actualResult.away_score, modelPrediction.spread) == modelPrediction.cover_spread,
                    correct_over_under: (actualResult.home_score + actualResult.away_score) > actualResult.over_under === (modelPrediction.over_under === 'OVER'),
                    correct_underdog_win: correctWinner ? (actualResult.home_score > actualResult.away_score) === (actualResult.home_moneyline > actualResult.away_moneyline) : false,
                    home_team_error: actualResult.home_score - modelPrediction.home_team_score,
                    away_team_error: actualResult.away_score - modelPrediction.away_team_score,
                    total_error: (actualResult.home_score + actualResult.away_score) - modelPrediction.total_score,
                };

                await modelPrediction.update(newData);
            }
        }));

        return res.status(200).send({ message: 'Model predictions settled successfully.' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Calculate covered actual spread given home score, away score, and spread
 * 
 * @param {number} homeScore - The home score.
 * @param {number} awayScore - The away score.
 * @param {number} spread - The spread.
 * 
 * @returns {boolean} - The correct spread.
 */
function _actualSpreadCovered(homeScore, awayScore, spread) {
    if (spread > 0) {
        return homeScore - awayScore - spread > 0;
    } else {
        return awayScore - homeScore - spread > 0;
    }
}