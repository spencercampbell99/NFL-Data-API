module.exports = app => {
    const authController = require("../controllers/auth.controller.js");

    var router = require("express").Router();

    router.post("/register", authController.register);

    router.post("/login", authController.login);

    app.use('/api/auth', router);
}