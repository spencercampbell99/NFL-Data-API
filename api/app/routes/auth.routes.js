module.exports = (app, authMiddleware) => {
    const authController = require("../controllers/auth.controller.js");

    var router = require("express").Router();

    router.post("/register", authController.register);

    router.post("/login", authController.login);

    router.post("/logout", authMiddleware, authController.logout);

    router.get("/me", authMiddleware, authController.me);

    app.use('/api/auth', router);
}