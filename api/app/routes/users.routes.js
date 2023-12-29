module.exports = app => {
    const userController = require("../controllers/user.controller.js");
    const isAuthenticated = require("../middleware/auth.middleware").isAuthenticated;

    var router = require("express").Router();

    router.use(isAuthenticated);

    // Get user by id
    router.get("/user/:id", async (req, res) => {
        try {
            const user = await userController.find(req.params.id);
            if (!user) {
                res.status(404).send({
                    message: `User with id ${req.params.id} was not found.`
                });
            } else {
                res.status(200).send(user);
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || "Error occurred while retrieving user."
            });
        }
    });

    // Get all users
    router.get("/users", userController.list);

    app.use('/api', router);
}