module.exports = (app, authMiddleware) => {
    const betController = require("../controllers/bet.controller.js");

    var router = require("express").Router();

    // List all bets for authed user
    router.get("/my-bets", authMiddleware, betController.list);

    // List games for bet selection
    router.get("/bets/list-games", authMiddleware, betController.gamesForBetSelection);

    // Create a new bet
    router.post("/bet", authMiddleware, betController.create);

    // Delete bets for authed user
    router.delete("/my-bets", authMiddleware, betController.deleteMyBets);

    app.use('/api', router);
}