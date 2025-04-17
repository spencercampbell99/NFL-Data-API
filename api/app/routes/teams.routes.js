module.exports = (app, authMiddleware) => {
    const teamController = require("../controllers/team.controller.js");

    var router = require("express").Router();

    // List teams
    router.get("/teams/list", authMiddleware, teamController.list);

    // get team by id
    router.get("/team/:id", authMiddleware, teamController.getTeamById);

    // historical matchups
    router.get("/teams/historical-matchups", authMiddleware, teamController.historicalMatchups);

    // get team's season schedule
    router.get("/team/:id/season-schedule/:season", teamController.getTeamScheduleForSeason);

    // get team's average performance going into given week and season for weeks back
    router.get("/team/:id/average-window-performance/:season/:week", authMiddleware, teamController.getTeamAveragePerformanceGoingIntoWeek);

    app.use('/api', router);
};