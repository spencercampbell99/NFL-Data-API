"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";
import { MessageProvider, useMessage } from "@/contexts/Message.context";

const REDIRECT_URL = "/";

export function AccessLevelProtectedRoute({ children, accessLevelRequired }: { children: React.ReactNode, accessLevelRequired?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { setMessage } = useMessage();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setMessage("You must be logged in to access this page", "error", 5);
        router.replace(REDIRECT_URL);
      } else {
        // Check if user has the required accessLevel
        console.log(accessLevelRequired, user.access_level);
        if (accessLevelRequired != user.access_level) {
            setMessage("You do not have the required access level to access this page", "error", 5);
            router.replace(REDIRECT_URL);
        }
        setIsChecking(false);
      }
    }
  }, [user, loading, router, accessLevelRequired]);

  if (loading || isChecking) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}