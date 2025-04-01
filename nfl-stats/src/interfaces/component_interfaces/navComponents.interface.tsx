import User from "@/interfaces/user.interface";
interface NavRequirements {
    requireAuth?: boolean
    requireNotAuth?: boolean
    accessLevelToRequire?: 'free' | 'basic' | null
    user?: User|null|undefined
}

export type {
    NavRequirements
}