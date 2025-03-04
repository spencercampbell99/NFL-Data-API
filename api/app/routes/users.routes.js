module.exports = (app, authMiddleware) => {
    const userController = require("../controllers/user.controller.js");

    var router = require("express").Router();

    // Get user by id
    router.get("/user/:id", authMiddleware, async (req, res) => {
        try {
            throw new Error("Test error"); // Simulate an error
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
    router.get("/users", authMiddleware, userController.list);

    app.use('/api', router);
}