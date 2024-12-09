module.exports = app => {
    const playerController = require("../controllers/player.controller.js");

    var router = require("express").Router();

    // List teams
    router.post("/players", playerController.list);

    // get team by id
    router.get("/player/:id", playerController.getPlayerById);

    // get player overview info for season
    router.get("/player/:id/overview-season/:season", playerController.getPlayerOverviewBySeason);

    app.use('/api', router);
};