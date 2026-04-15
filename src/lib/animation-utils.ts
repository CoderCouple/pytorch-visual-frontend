import { type Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const cellHighlight: Variants = {
  idle: { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
  active: {
    scale: 1.1,
    boxShadow: "0 0 12px 2px rgba(238,76,44,0.4)",
    transition: { duration: 0.3 },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export function getStepDelay(index: number, speed: number = 1) {
  return index * (0.5 / speed);
}
