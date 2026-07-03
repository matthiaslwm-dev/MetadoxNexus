"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { secondaryButtonClass } from "@/lib/ui";

export function LeadsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(target));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className={secondaryButtonClass}
        style={{ minHeight: 44 }}
      >
        Previous
      </motion.button>
      <p className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-900">{page}</span> of{" "}
        {totalPages}
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className={secondaryButtonClass}
        style={{ minHeight: 44 }}
      >
        Next
      </motion.button>
    </div>
  );
}
