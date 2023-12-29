module.exports = app => {
    const modelPredictionController = require("../controllers/modelPrediction.controller.js");
    var router = require("express").Router();

    // get model predictions by week and season
    router.get("/model-predictions/overview/:season/:week", modelPredictionController.getModelPredictionsOverviewBySeasonAndWeek);

    app.use('/api', router);
}