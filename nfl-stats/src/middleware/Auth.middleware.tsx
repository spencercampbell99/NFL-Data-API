"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";
import axios from '@/axiosConfig';

export default function AuthProtected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // clear any tokens or user data from local storage or context
        sessionStorage.removeItem("token");

        axios.post('/auth/logout')
          .finally(() => {
            router.replace("/auth/login");
          });
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  if (loading || isChecking) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
