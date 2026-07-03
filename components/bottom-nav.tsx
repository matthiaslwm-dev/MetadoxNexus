"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navLinks } from "@/components/nav-links";
import { Icon } from "@/components/icons";
import { logout } from "@/app/actions/auth";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium leading-none transition-colors ${
                active ? "text-gray-900" : "text-gray-400"
              }`}
              style={{ minHeight: 44 }}
            >
              <span className="relative">
                <Icon name={link.icon} className="h-5 w-5" />
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active-dot"
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gray-900"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </span>
              {link.shortLabel}
            </Link>
          );
        })}

        <form action={logout} className="contents">
          <button
            type="submit"
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-400 transition-colors active:text-gray-600"
            style={{ minHeight: 44 }}
          >
            <Icon name="logout" className="h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
