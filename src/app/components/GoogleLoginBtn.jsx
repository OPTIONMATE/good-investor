"use client";

import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginBtn() {
  const handleGoogleLogin = () => {
    // Passport backend handles everything
    window.location.href = "/api/auth/google";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full border py-2 rounded flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
    >
      <FcGoogle className="h-5 w-5" aria-hidden="true" />
      Continue with Google
    </button>
  );
}
