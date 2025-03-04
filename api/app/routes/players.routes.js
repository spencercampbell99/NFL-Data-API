module.exports = (app, authMiddleware) => {
    const playerController = require("../controllers/player.controller.js");

    var router = require("express").Router();

    // List teams
    router.post("/players", authMiddleware, playerController.list);

    // get team by id
    router.get("/player/:id", authMiddleware, playerController.getPlayerById);

    // get player overview info for season
    router.get("/player/:id/overview-season/:season", authMiddleware, playerController.getPlayerOverviewBySeason);

    app.use('/api', router);
};