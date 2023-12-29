module.exports = app => {
    const gameController = require("../controllers/game.controller.js");

    var router = require("express").Router();

    // Get game by id
    router.get("/game/:id", async (req, res) => {
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
    router.get("/games/week/:week/season/:season", async (req, res) => {
        // get additional query params
        const queryParams = req.query;

        var idsOnly = false;
        if (queryParams) {
            if (queryParams.idsOnly) {
                idsOnly = true;
            }
        }

        try {
            const games = await gameController.getGamesBySeasonAndWeek({ week: req.params.week, season: req.params.season, idsOnly: idsOnly });
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

    // get games overview by week and season
    router.get('/games/overview/:season/:week', gameController.getGamesOverviewBySeasonAndWeek);

    // default route
    router.get("/games", (req, res) => {
        res.json({ message: "Getting all games is not currently allowed due to size." });
    });

    app.use('/api', router);
}