module.exports = app => {
    const stripeController = require("../controllers/stripe.controller.js");
    var router = require("express").Router();

    router.post('/stripe/webhooks', stripeController.webhook);

    const isAuthenticated = require("../middleware/auth.middleware").isAuthenticated;

    router.use(isAuthenticated);

    router.post('/stripe/create-checkout-session', stripeController.createCheckoutSession);

    router.post('/stripe/create-portal-session', stripeController.createPortalSession);

    router.post('/stripe/create-subscription', stripeController.createSubscription);

    app.use('/api', router);
}