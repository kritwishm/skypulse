"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plane, Eye, EyeOff, Loader2 } from "lucide-react";
import GradientMesh from "@/components/ui/GradientMesh";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!username.trim() || !password.trim()) {
        setError("Username and password are required");
        return;
      }
      if (mode === "register" && password.length < 4) {
        setError("Password must be at least 4 characters");
        return;
      }

      setIsSubmitting(true);
      try {
        if (mode === "login") {
          await login(username.trim(), password);
        } else {
          await register(username.trim(), password);
        }
        router.replace("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, username, password, login, register, router]
  );

  if (authLoading) return null;
  if (isAuthenticated) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GradientMesh />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Plane className="h-5 w-5 text-blue-400 rotate-[-30deg]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">SkyPulse</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/40 bg-[#131b2e]/80 backdrop-blur-xl p-6">
          {/* Mode tabs */}
          <div className="flex rounded-xl bg-slate-800/60 p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl border border-slate-700/50 bg-slate-800/40 px-3.5 py-2.5
                           text-sm text-slate-100 placeholder-slate-600
                           focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30
                           transition-colors"
                placeholder="Enter username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/40 px-3.5 py-2.5 pr-10
                             text-sm text-slate-100 placeholder-slate-600
                             focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30
                             transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                         bg-blue-600 text-sm font-medium text-white
                         hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Track flight prices in real-time
        </p>
      </motion.div>
    </div>
  );
}
