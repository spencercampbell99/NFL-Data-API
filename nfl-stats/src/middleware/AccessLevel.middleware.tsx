"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";
import { MessageProvider, useMessage } from "@/contexts/Message.context";
import ACCESS_LEVEL_MAPPING from "@/interfaces/enums/accessLevelMapping.interface";

const REDIRECT_URL = "/";

export function AccessLevelProtectedRoute({ children, accessLevelRequired }: { children: React.ReactNode, accessLevelRequired?: 'free' | 'basic' | 'full' | undefined | null; }) {
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
        const userAccessLevelNumber = user.access_level ? ACCESS_LEVEL_MAPPING[user.access_level] : 0;
        const accessLevelRequiredNumber = accessLevelRequired ? ACCESS_LEVEL_MAPPING[accessLevelRequired] : 0;
        if (userAccessLevelNumber < accessLevelRequiredNumber) {
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