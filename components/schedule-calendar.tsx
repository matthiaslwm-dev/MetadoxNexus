"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  addMonths,
  getMonthGrid,
  isSameMonth,
  isToday,
  monthLabel,
  monthParam,
  toDateKey,
} from "@/lib/calendar";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { EmptyState } from "@/components/empty-state";

export type ScheduleItem = {
  id: string;
  name: string;
  status: string;
  next_follow_up: string;
  organisations: { name: string } | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleCalendar({
  year,
  monthIndex,
  items,
}: {
  year: number;
  monthIndex: number;
  items: ScheduleItem[];
}) {
  const router = useRouter();
  const grid = useMemo(() => getMonthGrid(year, monthIndex), [year, monthIndex]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const item of items) {
      const list = map.get(item.next_follow_up) ?? [];
      list.push(item);
      map.set(item.next_follow_up, list);
    }
    return map;
  }, [items]);

  const todayKey = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  function goToMonth(delta: number) {
    const { year: y, monthIndex: m } = addMonths(year, monthIndex, delta);
    router.push(`/schedule?month=${monthParam(y, m)}`);
  }

  const selectedItems = itemsByDate.get(selectedDate) ?? [];

  return (
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthLabel(year, monthIndex)}
          </h2>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 sm:h-11 sm:w-11"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 sm:h-11 sm:w-11"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>

          <motion.div
            key={monthParam(year, monthIndex)}
            variants={staggerContainer(0.008)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-7"
          >
            {grid.map((date) => {
              const key = toDateKey(date);
              const dayItems = itemsByDate.get(key) ?? [];
              const inMonth = isSameMonth(date, year, monthIndex);
              const selected = key === selectedDate;
              const hasMeeting = dayItems.some((i) => i.status === "Meeting Booked");

              return (
                <motion.button
                  key={key}
                  type="button"
                  variants={fadeInUp}
                  onClick={() => setSelectedDate(key)}
                  className={`relative flex h-12 flex-col items-center justify-center gap-0.5 border-b border-r border-gray-100 text-sm transition-colors sm:h-14 lg:h-16 ${
                    inMonth ? "text-gray-900" : "text-gray-300"
                  } ${selected ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday(date) && !selected ? "bg-gray-900 text-white" : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="flex gap-0.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          hasMeeting
                            ? "bg-purple-500"
                            : selected
                              ? "bg-white"
                              : "bg-blue-500"
                        }`}
                      />
                      {dayItems.length > 1 && (
                        <span
                          className={`text-[10px] font-medium leading-none ${
                            selected ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {dayItems.length}
                        </span>
                      )}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Follow-up due
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Meeting booked
          </span>
        </div>
      </div>

      <div className="mt-4 flex max-h-[60vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:mt-0 lg:max-h-[calc(100dvh-11rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <p className="shrink-0 border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>

            {selectedItems.length === 0 ? (
              <div className="flex-1 p-4">
                <EmptyState title="Nothing scheduled this day" />
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {selectedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/leads/${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">
                        {item.organisations?.name ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === "Meeting Booked"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.status === "Meeting Booked" ? "Meeting" : "Follow-up"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
