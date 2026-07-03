"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navLinks } from "@/components/nav-links";
import { Icon } from "@/components/icons";
import { logout } from "@/app/actions/auth";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="px-6 py-6">
        <span className="text-lg font-semibold tracking-tight text-gray-900">
          Metadox Nexus
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-gray-900"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon name={link.icon} className="relative z-10 h-5 w-5" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <form action={logout}>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Icon name="logout" className="h-5 w-5" />
            Logout
          </motion.button>
        </form>
      </div>
    </aside>
  );
}
