"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import { LoginForm } from "@/components/login-form";

export function LoginShell() {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-gray-50 px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 50% -10%, rgba(17,24,39,0.06), transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0.05 }}
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-lg font-semibold text-white shadow-lg shadow-gray-900/20"
          >
            M
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Metadox Nexus
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            AI-powered lead management for agent outreach
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.12 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-900/5 sm:p-8"
        >
          <LoginForm />
        </motion.div>
      </motion.div>
    </div>
  );
}
