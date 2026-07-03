"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { easeOut } from "@/lib/motion";

export function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: easeOut,
    });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{rounded}</motion.span>;
}
