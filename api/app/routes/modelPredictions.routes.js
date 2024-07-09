module.exports = app => {
    const modelPredictionController = require("../controllers/modelPrediction.controller.js");
    var router = require("express").Router();

    // get model predictions by week and season
    router.get("/model-predictions/overview/:season/:week", modelPredictionController.getModelPredictionsOverviewBySeasonAndWeek);

    // get model analysis results for season
    router.get("/model-predictions/analysis/:season", modelPredictionController.getModelPredictionsAnalysisBySeason);

    // list model predictions for given season
    router.get("/model-predictions/:season", modelPredictionController.listModelPredictionsBySeason);

    app.use('/api', router);
}