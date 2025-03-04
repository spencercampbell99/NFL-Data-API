module.exports = (app, authMiddleware) => {
    const gameController = require("../controllers/game.controller.js");

    var router = require("express").Router();

    // Get game by id
    router.get("/game/:id", authMiddleware, async (req, res) => {
        try {
            const game = await gameController.find(req.params.id);
            if (!game) {
                res.status(404).send({
                    message: `Game with id ${req.params.id} was not found.`
                });
            } else {
                res.status(200).send(game);
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error occurred while retrieving game."
            });
        }
    });

    // get games by week and season
    router.get("/games/week/:week/season/:season", authMiddleware, async (req, res) => {
        // get additional query params
        const queryParams = req.query;

        var idsOnly = false;
        var withModelPredictions = false;
        if (queryParams) {
            console.log(queryParams);
            if (queryParams.ids_only == 'true' || queryParams.ids_only == '1') {
                idsOnly = true;
            }
            if (queryParams.with_model_predictions == 'true' || queryParams.with_model_predictions == '1') {
                withModelPredictions = true;
            }
        }

        try {
            const games = await gameController.getGamesBySeasonAndWeek({ week: req.params.week, season: req.params.season, idsOnly: idsOnly, withModelPredictions: withModelPredictions });
            if (!games) {
                res.status(404).send({
                    message: `Games for week ${req.params.week} of season ${req.params.season} were not found.`
                });
            } else {
                res.status(200).send(games);
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error occurred while retrieving games."
            });
        }
    });

    // get overview for game
    router.get("/game/:id/overview", authMiddleware, gameController.getGameOverviewById);

    // get games overview by week and season
    router.get('/games/overview/:season/:week', authMiddleware, gameController.getGamesOverviewBySeasonAndWeek);

    // default route
    router.get("/games", authMiddleware, (req, res) => {
        res.json({ message: "Getting all games is not currently allowed due to size." });
    });

    app.use('/api', router);
}