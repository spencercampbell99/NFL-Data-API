const db = require('../models');
const ModelPrediction = db.modelPredictions;

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
                    model: db.schedules,
                    as: 'schedule',
                    where: {
                        season: season,
                        week: week,
                        game_type: 'REG',
                    },
                    attributes: ['season', 'week', 'over_under', 'spread', 'date', 'home_moneyline', 'away_moneyline', 'home_team_char_id', 'away_team_char_id'],
                    include: [
                        {
                            model: db.boxscores,
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