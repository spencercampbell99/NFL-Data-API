module.exports = (app, authMiddleware) => {
    const stripeController = require("../controllers/stripe.controller.js");
    var router = require("express").Router();

    router.post('/stripe/webhooks', stripeController.webhook);

    router.post('/stripe/create-checkout-session', authMiddleware, stripeController.createCheckoutSession);

    router.post('/stripe/create-portal-session', authMiddleware, stripeController.createPortalSession);

    router.post('/stripe/create-subscription', authMiddleware, stripeController.createSubscription);

    router.get('/stripe/user/:id/subscriptions', authMiddleware, stripeController.getUserSubscriptions);

    app.use('/api', router);
}