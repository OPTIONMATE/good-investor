"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (!user.disclaimerAccepted) router.push("/disclaimer");
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return children;
}
