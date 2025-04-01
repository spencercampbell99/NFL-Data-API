import { NavRequirements } from "@/interfaces/component_interfaces/navComponents.interface";

class AuthService {
    static handleNavRequirements(navRequirements: NavRequirements) {
        if (navRequirements.requireAuth && !navRequirements.user) {
            return false;
        }

        if (navRequirements.requireNotAuth && navRequirements.user) {
            return false;
        }

        if (navRequirements.accessLevelToRequire && navRequirements?.accessLevelToRequire && navRequirements.user?.access_level != navRequirements?.accessLevelToRequire) {
            return null;
        }

        return true;
    }
}

export default AuthService;