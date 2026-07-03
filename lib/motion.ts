import type { Transition, Variants } from "framer-motion";

export const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOut } },
};

export const staggerContainer = (stagger = 0.04, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: easeOut } },
};
