import axios from '@/axiosConfig';
import { loadStripe } from '@stripe/stripe-js';

class StripeService {
    static async handleCreateSubscription(lookupKey: string) {
        try {
            const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
            const stripe = await stripePromise;
            const { data } = await axios.post('/stripe/create-checkout-session', {
                lookup_key: lookupKey
            });
            if (data.session_id) {
                const result = await stripe?.redirectToCheckout({
                    sessionId: data.session_id,
                });
                if (result?.error) {
                    console.error(result.error.message);
                }
            }  else {
                console.error('Session ID not found in response');
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
        }
    }

    static async handleCheckSubscriptionStatus() {
        try {
            const { data } = await axios.get('/stripe/check-subscription-status');
            return data;
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    }

    static async getStripePortalUrl() {
        try {
            const { data } = await axios.post('/stripe/create-portal-session');

            if (data.url) {
                return data.url;
            }
        } catch (error) {
            console.error('Error creating portal session:', error);
        }
        return null;
    }
}

export default StripeService;