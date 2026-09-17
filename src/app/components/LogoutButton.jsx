"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/app/lib/utils";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function LogoutButton({ className = "", label = "Logout", onLoggedOut }) {
  const router = useRouter();
  const { setUser, setLoggingOut } = useAuth();

  const logout = async () => {
    setLoggingOut(true);
    await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (onLoggedOut) onLoggedOut();
    
    // Keep overlay visible for smooth transition, then redirect
    setTimeout(() => {
      setLoggingOut(false);
    }, 1200);
    router.push("/login");
  };
  
  return (
    <button
      onClick={logout}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition",
        className
      )}
    >
      {label}
    </button>
  );
}
