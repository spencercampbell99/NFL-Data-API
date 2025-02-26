import User from "@/interfaces/user.interface";

interface NavRequirements {
    requireAuth?: boolean
    requireNotAuth?: boolean
    requireSubscription?: boolean
    user?: User|null|undefined
}

export type {
    NavRequirements
}