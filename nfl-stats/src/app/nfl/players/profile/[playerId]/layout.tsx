import AuthProtected from "@/middleware/Auth.middleware";
import { AccessLevelProtectedRoute } from "@/middleware/AccessLevel.middleware";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProtected>
      <AccessLevelProtectedRoute accessLevelRequired="basic">
        {children}
      </AccessLevelProtectedRoute>
    </AuthProtected>
  );
}