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

        const modelPredictions = await nflDb.sequelize.query(sql, {
            replacements: params,
            type: nflDb.Sequelize.QueryTypes.SELECT,
            logging: true,
        });

        return res.status(200).send(modelPredictions);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}