// frontend/app/(auth)/login/page.tsx

"use client"; // This component has user interaction

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to LogiPro</h1>
        <Button
          onClick={login}
          disabled={loading} // <-- 4. Disable the button while loading
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </div>
    </div>
  );
}