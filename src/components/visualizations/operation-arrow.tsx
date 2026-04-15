"use client";

import { motion } from "framer-motion";

interface OperationArrowProps {
  label: string;
  visible?: boolean;
}

export function OperationArrow({ label, visible = true }: OperationArrowProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-1 mx-4"
    >
      <div className="relative flex items-center">
        {/* Arrow body */}
        <div className="h-[40px] w-[100px] bg-[#EE4C2C] rounded-l-md flex items-center justify-center">
          <span className="text-white font-bold text-sm whitespace-nowrap px-2">
            {label}
          </span>
        </div>
        {/* Arrow head */}
        <div
          className="w-0 h-0"
          style={{
            borderTop: "28px solid transparent",
            borderBottom: "28px solid transparent",
            borderLeft: "24px solid #EE4C2C",
          }}
        />
      </div>
    </motion.div>
  );
}
