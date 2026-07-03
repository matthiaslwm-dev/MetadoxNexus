"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login, type LoginState } from "@/app/actions/auth";
import { inputClass, primaryButtonClass } from "@/lib/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <AnimatePresence>
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={pending}
        whileTap={{ scale: 0.98 }}
        className={`w-full ${primaryButtonClass}`}
        style={{ minHeight: 44 }}
      >
        {pending ? (
          <motion.span
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
            />
            Signing in...
          </motion.span>
        ) : (
          "Sign in"
        )}
      </motion.button>
    </form>
  );
}
