const { handleDisplayableException } = require('../helpers');
const db = require('../models');
const DisplayableException = require('../exceptions/CustomExceptions').DisplayableException;

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

        if (!prices.data[0]) {
            return res.status(400).send({ error: 'No prices found' });
        }

        let customerId = req.user?.stripe_customer_id;

        if (!customerId) {
            // create customer
            customerId = await this._createCustomer({ user: req.user, stripe });
        }

        if (!customerId) {
            return res.status(500).send({ error: 'No customer found and unable to create' });
        }

        // ensure customer exists in stripe
        let customer;
        try {
            customer = await stripe.customers.retrieve(customerId);

            if (!customer || (customer?.deleted)) {
                // create customer
                customerId = await this._createCustomer({ user: req.user, stripe, forceRecreate: true });

                if (!customerId) {
                    return res.status(500).send({ error: 'Unable to create customer in Stripe' });
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({ error: 'Unable to retrieve customer from Stripe' });
        }

        let sessionCreateObject = {
            billing_address_collection: 'auto',
            line_items: [
              {
                price: prices.data[0].id,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${FRONT_DOMAIN}/profile?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONT_DOMAIN}/profile?canceled=true`,
            customer: customerId,
        }

        const session = await stripe.checkout.sessions.create(sessionCreateObject);

        res.json({ session_id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Create a Stripe customer connected to authorized user
 * 
 * @param {Object} user - The user object.
 * @param {Object} stripe - The Stripe object.
 * @param {boolean} forceRecreate - Whether to force recreate the customer.
 * 
 * @throws {DisplayableException} - If the user is not found or if the customer creation fails.
 * 
 * @returns {string} - The Stripe customer ID or an error.
 */
exports._createCustomer = async ({user, stripe=null, forceRecreate = false}) => {
    try {
        if (!user) {
            throw new DisplayableException('User not found');
        }
        if (user.stripe_customer_id && !forceRecreate) {
            return user.stripe_customer_id;
        }

        if (!stripe) 
            stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.first_name ? user.first_name : (user.username ?? '')} ${user.last_name ?? ''}`,
            metadata: {
                user_id: user.id,
            },
        });

        if (!customer) {
            throw new DisplayableException('Failed to create Stripe customer');
        }

        // Update the user with the Stripe customer ID
        await db.User.update(
            { stripe_customer_id: customer.id },
            { where: { id: user.id } }
        );

        console.info(`Created Stripe customer ${customer.id} for user ${user.id}`);

        return customer.id;
    } catch (error) {
        console.error(error)
        error = handleDisplayableException(error);
        throw error
    }
}

/**
 * Endpoint to get user's subscriptions
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The ID of the user making the request.
 * 
 * @throws {DisplayableException} - If the user is not found or if the subscription retrieval fails.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 */
exports.getUserSubscriptions = async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const userId = req.params.id

        if (!userId) {
            return res.status(400).send({ error: 'User not provided' });
        }

        const user = await db.User.findOne({
            where: { id: userId },
            attributes: ['id', 'email', 'first_name', 'last_name', 'stripe_customer_id'],
            logging: false,
        });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const subscriptions = await _checkSubscription({ user, stripe });
        if (!subscriptions) {
            return res.status(404).send({ error: 'No subscriptions found' });
        }

        const subscriptionData = subscriptions.data.map((subscription) => {
            return {
                id: subscription.id,
                status: subscription.status,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                items: subscription.items.data.map((item) => ({
                    id: item.id,
                    price: item.price.unit_amount,
                    product: item.price.product.name,
                    quantity: item.quantity,
                })),
            };
        });

        res.status(200).send({ subscriptions: subscriptionData });
    } catch (error) {
        console.error(error)
        error = handleDisplayableException(error);
        res.status(400).send({ error: error.message });
    }
}

/**
 * Check user's subscription status in stripe
 * 
 * @param {Object} user - The user object.
 * @param {Object} stripe - The Stripe object.
 * 
 * @throws {DisplayableException} - If the user is not found or if the subscription retrieval fails.
 */
_checkSubscription = async ({user, stripe=null}) => {
    try {
        if (!user) {
            throw new DisplayableException('User not found');
        }

        if (!stripe) 
            stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const customerId = user.stripe_customer_id;

        if (!customerId) {
            throw new DisplayableException('Customer not found');
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            expand: ['data.default_payment_method'],
        });

        if (!subscriptions) {
            throw new DisplayableException('Failed to retrieve subscriptions');
        }

        return subscriptions;
    } catch (error) {
        console.error(error)
        error = handleDisplayableException(error);
        throw error
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
                await db.User.update(
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
        let event = req.body;
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

        console.log(`Received event: ${event.type}`);

        if (event.type.startsWith('customer.subscription')) {
            subscription = event.data.object;
                
            await _updateUserSubscription(subscription);
        } else {
            // Handle the event with a switch
            switch (event.type) {
                // MAKE SURE THESE ARE ALL REGISTERED IN STRIPE
                case 'customer.updated':
                    console.log(`Customer updated`);
                    break;
                case 'entitlements.active_entitlement_summary.updated':
                    _updateUserAccess({ user: event.data.object.customer, searchType: 'stripe_customer_id' });
                    break;
                case 'entitlements.active_entitlement_summary.updated':
                    break;
                default:
                    // console.log(`Unhandled event type ${event.type}`);
            }
        }

        res.status(200).send({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        error = handleDisplayableException(error);
        res.status(400).send({ error: error.message });
    }
}

/**
 * Update User's Access Endpoint
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
exports.updateUserAccess = async (req, res) => {
    try {
        const userId = req.params.id

        await _updateUserAccess({ user: userId, searchType: 'user_id' });

        res.status(200).send({ message: 'User access updated' });
    } catch (error) {
        console.error(error);
        error = handleDisplayableException(error);
        res.status(400).send({ error: error.message });
    }
}

/**
 * Update user's access
 * 
 * @param {Object|number} user - The user object or ID.
 * @param {string} searchType - The search type. 'user', 'user_id', or 'stripe_customer_id'.
 * 
 * @returns {void}
 */
_updateUserAccess = async ({ user, searchType}) => {
    try {
        if (!['user', 'user_id', 'stripe_customer_id'].includes(searchType)) {
            throw new Error('Invalid search type');
        }

        if (searchType === 'user_id') {
            user = await db.User.findOne({ where: { id: user } });
        } else if (searchType === 'stripe_customer_id') {
            user = await db.User.findByStripeCustomerId(user);
        }

        if (!user) {
            throw new DisplayableException('User not found.');
        }

        // Get user's permissions
        let userPermissions = await user.listUserPermissions();
        const overrideAccessPermissions = ["owner"]
        if (userPermissions && userPermissions.length > 0) {
            console.log(userPermissions)
            // if user has override permissions, give them full access
            userPermissions = userPermissions.filter((permission) => overrideAccessPermissions.includes(permission.slug));

            console.log(userPermissions)

            if (userPermissions.length > 0) {
                // user has permissions, so they have access
                await db.User.update(
                    { access_level: 'full' },
                    { where: { id: user.id } }
                );

                return;
            }
        }

        if (!user.stripe_customer_id) {
            throw new DisplayableException('User does not have a Stripe customer ID.');
        }

        const entitlements = await _listEntitlements(user.stripe_customer_id);
        let accessLevel = 'free';

        entitlements.data.forEach((entitlement) => {
            if (entitlement.lookup_key === 'basic-access') {
                accessLevel = 'basic';
            }
        });

        const oldAccessLevel = user.access_level;

        await db.User.update(
            { access_level: accessLevel },
            { where: { id: user.id } }
        );

        if (oldAccessLevel !== accessLevel && accessLevel == 'free') {
            // log out
            await db.User.update(
                { session_token: null, session_expiration: null },
                { where: { id: user.id } }
            );
        }

        console.debug(`Updated user ${user.id} access level to ${accessLevel}`);
    } catch (error) {
        console.error(error);
        error = handleDisplayableException(error);
        throw error;
    }
}

/**
 * List entitlements
 * 
 * @param {string} customerId - The customer ID.
 * 
 * @returns {Object|null} - The entitlements.
 */
_listEntitlements = async (customerId) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const entitlements = await stripe.entitlements.activeEntitlements.list({
            customer: customerId,
        });

        return entitlements;
    } catch (error) {
        console.error(error);
        error = handleDisplayableException(error);
        throw error;
    }
}

/**
 * Take subscription event data and update user's subscription
 * 
 * @param {Object} subscription - The subscription object.
 * 
 * @throws {Error} - If the subscription is not found or if the user is not found.
 * 
 * @returns {void}
 */
_updateUserSubscription = async (subscription) => {
    try {
        return; // No currently tracking in db

        // Find user
        const user = await db.User.findByStripeCustomerId(subscription.customer);
        if (!user) {
            throw new DisplayableException('User not found');
        }

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Subscription statuses: https://docs.stripe.com/billing/subscriptions/webhooks#state-changes
        const userSubscriptionInfo = {
            user_id: user.id,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            stripe_latest_invoice_id: subscription.latest_invoice,
            stripe_price_id: subscription.items.data[0].price.id,
            is_active: subscription.status === 'active' || subscription.status === 'trialing',
            is_recurring: subscription.collection_method === 'charge_automatically',
            start_date: new Date(subscription.current_period_start * 1000),
            end_date: subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null,
            valid_through: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        };

        // Find subscription
        const userSubscription = await db.UserSubscription.findOne({
            where: { user_id: user.id, stripe_subscription_id: subscription.id, stripe_customer_id: subscription.customer },
            logging: false,
        });

        if (!userSubscription) {
            // Create subscription
            await db.UserSubscription.create(userSubscriptionInfo);
        } else {
            // Update subscription
            await db.UserSubscription.update(userSubscriptionInfo, {
                where: { user_id: user.id, stripe_subscription_id: subscription.id },
            });
        }
    } catch (error) {
        console.error(error);
        error = handleDisplayableException(error);
        throw error;
    }
};

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
            await db.User.update(
                { stripe_customer_id: customer.id },
                { where: { id: req.user.id } }
            );
        } else {
            customer = { id: customerId };

            if (!req.user.stripe_customer_id) {
                await db.User.update(
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