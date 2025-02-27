import AuthProtected from "@/middleware/Auth.middleware";
import { PermissionProtectedRoute } from "@/middleware/Permission.middleware";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProtected>
      <PermissionProtectedRoute>
        {children}
      </PermissionProtectedRoute>
    </AuthProtected>
  );
}