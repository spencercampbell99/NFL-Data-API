import Permission from "./permission.interface";
import StripeProduct from "./stripe/stripeProduct.interface";

interface UserSubscription {
    user_id: string;
    stripe_product_id?: string|null;
    stripe_product?: StripeProduct|null;
    stripe_subscription_id?: string|null;
    is_active: boolean;
    is_recurring: boolean;
    start_date: Date;
    end_date?: Date|null;
    valid_through?: Date|null;
}

export default interface User {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    permissions?: Permission[]|undefined;
    access_level?: string;
}