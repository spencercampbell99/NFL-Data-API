import { NavRequirements } from "@/interfaces/component_interfaces/navComponents.interface";
import ACCESS_LEVEL_MAPPING from "@/interfaces/enums/accessLevelMapping.interface";

class AuthService {
    static handleNavRequirements(navRequirements: NavRequirements) {
        if (navRequirements.requireAuth && !navRequirements.user) {
            return false;
        }

        if (navRequirements.requireNotAuth && navRequirements.user) {
            return false;
        }

        if (navRequirements.accessLevelToRequire && navRequirements?.accessLevelToRequire) {
            const userAccessLevelNumber = navRequirements.user?.access_level ? ACCESS_LEVEL_MAPPING[navRequirements.user.access_level] : 0;
            const accessLevelRequiredNumber = navRequirements.accessLevelToRequire ? ACCESS_LEVEL_MAPPING[navRequirements.accessLevelToRequire] : 0;
            if (userAccessLevelNumber < accessLevelRequiredNumber) {
                return false;
            }
        }

        return true;
    }
}

export default AuthService;