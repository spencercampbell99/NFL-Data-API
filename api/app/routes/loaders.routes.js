module.exports = (app, authMiddleware) => {
    const loaders = require("../controllers/loader.controller.js");
    const gameController = require("../controllers/game.controller.js");

    var router = require("express").Router();

    // Load in teams given an array of teams
    router.post("/teams", authMiddleware, loaders.loadTeams);

    // Load in schedules given an array of schedules
    router.post("/schedules", authMiddleware, loaders.loadSchedules);

    // load in boxscores for given season and week
    router.get("/boxscores/week/:week/season/:season", authMiddleware, async (req, res) => {
        // load the games for given week and season
        try {
            const games = await gameController.getGamesBySeasonAndWeek({ week: req.params.week, season: req.params.season, idsOnly: true });
            if (!games) {
                res.status(404).send({
                    message: `Games for week ${req.params.week} of season ${req.params.season} were not found.`
                });
            } else {
                // load the boxscores for each game
                for (const game of games) {
                    await loaders.loadBoxscoreForGame(game.id);
                }
                res.status(200).send({
                    message: `Boxscores for week ${req.params.week} of season ${req.params.season} were loaded.`
                });
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error occurred while retrieving games.",
                week: req.params.week,
                season: req.params.season,
            });
        }
    });

    // Load in boxscores given a game id
    router.get("/boxscores/:gameId", authMiddleware, async (req, res) => {
        try {
            const boxscore = await loaders.loadBoxscoreForGame(req.params.gameId);
            res.status(200).send(boxscore);
        } catch (err) {
            console.log(err?.message);
            res.status(500).send({
                message: err.message || "Error occurred while retrieving boxscore.",
                gameId: req.params.gameId,
            });
        }
    
    });

    // load in player stats for a given game id
    router.get("/playerStats/:gameId", authMiddleware, async (req, res) => {
        try {
            const verbose = req.query.verbose == 1 ? 
                (sql) => {
                    console.log(sql)
                }
                 : false;
            const playerStats = await loaders.loadPlayerStatsForGame(req.params.gameId, verbose);
            res.status(200).send(playerStats);
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error occurred while retrieving player stats.",
                gameId: req.params.gameId,
                stackTrace: err.stack,
            });
        }
    });

    // default route
    router.get("/", authMiddleware, (req, res) => {
        res.json({ message: "Welcome to the NFL Stats API. These routes are for loading data in." });
    });

    app.use('/api/loaders', router);
}