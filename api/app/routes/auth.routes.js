module.exports = app => {
    const authController = require("../controllers/auth.controller.js");

    var router = require("express").Router();

    router.post("/register", authController.register);

    router.post("/login", authController.login);

    router.post("/logout", authController.logout);

    router.get("/me", authController.me);

    app.use('/api/auth', router);
}