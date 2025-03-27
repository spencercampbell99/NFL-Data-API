export default interface StripeProduct {
    stripe_product_id: string;
    name: string;
    description?: string|null;
    created_at: Date;
}