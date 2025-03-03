const db = require('../models');

/**
 * Creates a Stripe checkout session.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.protocol - The protocol used in the request (http or https).
 * @param {Function} req.get - Function to get headers from the request.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
exports.createCheckoutSession = async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const FRONT_DOMAIN = process.env.FRONTEND_URL;

        if (!req.body.lookup_key) {
            return res.status(400).send({ error: 'Missing lookup_key' });
        }

        if (!FRONT_DOMAIN) {
            throw new Error('Missing return domain');
        }

        const prices = await stripe.prices.list({
            lookup_keys: [req.body.lookup_key],
            expand: ['data.product'],
        });

        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [
              {
                price: prices.data[0].id,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${FRONT_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONT_DOMAIN}?canceled=true`,
        });

        res.json({ session_id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Create portal session
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.protocol - The protocol used in the request (http or https).
 * @param {Function} req.get - Function to get headers from the request.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
exports.createPortalSession = async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const FRONT_DOMAIN = process.env.FRONTEND_URL;
        if (!FRONT_DOMAIN) {
            throw new Error('Missing return domain');
        }

        const { sessionId } = req.body;
        let customerId = req.user?.stripe_customer_id;
        if (sessionId) {
            const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
            
            if (checkoutSession.customer && checkoutSession.customer !== customerId) {
                customerId = checkoutSession.customer;

                // Update the user with the new Stripe customer ID
                await db.users.update(
                    { stripe_customer_id: customerId },
                    { where: { id: user.id } }
                );
            }
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${FRONT_DOMAIN}/profile`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Handle stripe webhook events
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.headers - The headers of the request.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
exports.webhook = async (req, res) => {
    try {
        let event = request.body;
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (endpointSecret) {
            const sig = req.headers['stripe-signature'];
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err) {
                throw new Error(`Webhook signature verification failed: ${err.message}`);
            }
        }

        let subscription;
        let status;

        // Handle the event with a switch
        switch (event.type) {
            // MAKE SURE THESE ARE ALL REGISTERED IN STRIPE
            case 'customer.updated':
                subscription = event.data.object;
                status = subscription.status;

                console.log(`Customer updated: ${status}`);
                break;
            case 'customer.subscription.trial_will_end':
                subscription = event.data.object;
                status = subscription.status;

                console.log(`Subscription status is ${status}.`);
                break;
            case 'customer.subscription.deleted':
                subscription = event.data.object;
                status = subscription.status;

                console.log(`Subscription status is ${status}.`);
                break;
            case 'customer.subscription.created':
                subscription = event.data.object;
                status = subscription.status;

                console.log(`Subscription status is ${status}.`);
                break;
            case 'customer.subscription.updated':
                subscription = event.data.object;
                status = subscription.status;

                console.log(`Subscription status is ${status}.`);
                break;
            case 'entitlements.active_entitlement_summary.updated':
                subscription = event.data.object;
                status = subscription.status;

                // handle update to entitlement summary
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).send({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Create a Stripe subscription
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.protocol - The protocol used in the request (http or https).
 * @param {Function} req.get - Function to get headers from the request.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
exports.createSubscription = async (req, res) => {
    throw new Error('Not implemented yet');

    let { plan, customerId } = req.body;

    try {
        console.log(process.env.STRIPE_SECRET_KEY)
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const email = req.user?.email
        if (!email) {
            return res.status(400).send({ error: "User not found. Can't get email" });
        }

        customerId = customerId || req.user?.stripe_customer_id;

        // Find or create the Stripe Customer
        let customer;
        if (!customerId) {
            customer = await stripe.customers.create({
                email: email,
                name: `${req.user.first_name ? req.user.first_name : (req.user.username ?? '')} ${req.user.last_name ?? ''}`,
                metadata: {
                    user_id: req.user.id,
                },
            });

            if (!customer) {
                return res.status(400).send({ error: "Can't create customer" });
            }

            // Update the user with the Stripe customer ID
            await db.users.update(
                { stripe_customer_id: customer.id },
                { where: { id: req.user.id } }
            );
        } else {
            customer = { id: customerId };

            if (!req.user.stripe_customer_id) {
                await db.users.update(
                    { stripe_customer_id: customerId },
                    { where: { id: req.user.id } }
                );
            }
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: plan, // Ensure this is the correct price ID from Stripe
                },
            ],
            trial_period_days: 0,
            expand: ['latest_invoice.payment_intent'],
        });

        res.send(subscription);
    } catch (error) {
        console.error(error)
        res.status(400).send({ error: error.message });
    }
}