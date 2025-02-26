import { NavRequirements } from "@/interfaces/component_interfaces/navComponents.interface";

class AuthService {
    static handleNavRequirements(navRequirements: NavRequirements) {
        if (navRequirements.requireAuth && !navRequirements.user) {
            return false;
        }

        if (navRequirements.requireNotAuth && navRequirements.user) {
            return false;
        }

        // if (navRequirements.requireSubscription && !navRequirements.user?.is_subscribed) {
        //     return null;
        // }

        return true;
    }
}

export default AuthService;