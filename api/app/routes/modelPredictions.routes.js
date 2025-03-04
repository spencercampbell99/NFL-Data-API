module.exports = (app, authMiddleware) => {
    const modelPredictionController = require("../controllers/modelPrediction.controller.js");
    var router = require("express").Router();

    // get model predictions by week and season
    router.get("/model-predictions/overview/:season/:week", authMiddleware, modelPredictionController.getModelPredictionsOverviewBySeasonAndWeek);

    // get model analysis results for season
    router.get("/model-predictions/analysis/:season", authMiddleware, modelPredictionController.getModelPredictionsAnalysisBySeason);

    // list model predictions for given season
    router.get("/model-predictions/:season", authMiddleware, modelPredictionController.listModelPredictionsBySeason);

    // settle model predictions for given week
    router.get("/model-predictions/settle-predictions/:season/:week", authMiddleware, modelPredictionController.settleModelPredictionsBySeasonAndWeek);

    app.use('/api', router);
}