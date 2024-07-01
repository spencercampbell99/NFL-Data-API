module.exports = app => {
    const betController = require("../controllers/bet.controller.js");
    const authMiddleware = require("../middleware/auth.middleware.js");

    var router = require("express").Router();

    // List all bets for authed user
    router.get("/my-bets", authMiddleware.isAuthenticated, betController.list);

    // List games for bet selection
    router.get("/bets/list-games", authMiddleware.isAuthenticated, betController.gamesForBetSelection);

    // Create a new bet
    router.post("/bet", authMiddleware.isAuthenticated, betController.create);

    app.use('/api', router);
}