"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";

export function PermissionProtectedRoute({ children, permissionsRequired }: { children: React.ReactNode, permissionsRequired?: string[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
      } else {
        // Check if user has the required permissions
        console.log(permissionsRequired, user.permissions);
        if (permissionsRequired && !permissionsRequired.every(permission => user.permissions?.some(userPermission => userPermission.slug === permission))) {
          router.replace("/");
        }
        setIsChecking(false);
      }
    }
  }, [user, loading, router, permissionsRequired]);

  if (loading || isChecking) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}