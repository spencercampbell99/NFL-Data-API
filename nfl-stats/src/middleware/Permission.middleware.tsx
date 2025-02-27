"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";

export function PermissionProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
      } else {
        // check user permissions
        console.log(user)

        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  console.log(user, loading, isChecking)

  if (loading || isChecking) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
