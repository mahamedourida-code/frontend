"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const assetPaths = {
  chaos: "/what-is/chaos-invoices.svg",
  cpu: "/what-is/axliner-cpu.svg",
  output: "/what-is/chill-output.svg",
};

type FlowPacketProps = {
  delay: number;
  duration: number;
  shouldReduceMotion: boolean;
};

function FlowPacket({ delay, duration, shouldReduceMotion }: FlowPacketProps) {
  const repeat = shouldReduceMotion ? 0 : Infinity;

  return (
    <motion.div
      className="absolute left-1/2 z-20 h-28 w-44 -translate-x-1/2 overflow-hidden"
      initial={false}
      animate={
        shouldReduceMotion
          ? { top: "45%", opacity: 0.85 }
          : { top: ["-12%", "105%"], opacity: [0, 1, 1, 0] }
      }
      transition={{
        delay,
        duration: Math.max(duration, 0.01),
        ease: "linear",
        repeat,
        times: [0, 0.08, 0.9, 1],
      }}
    >
      <motion.img
        src={assetPaths.chaos}
        alt=""
        className="absolute inset-0 h-full w-full object-contain p-2"
        animate={
          shouldReduceMotion
            ? { opacity: 0 }
            : {
                opacity: [1, 1, 0, 0],
                clipPath: [
                  "inset(0% 0% 0% 0%)",
                  "inset(0% 0% 0% 0%)",
                  "inset(0% 0% 100% 0%)",
                  "inset(0% 0% 100% 0%)",
                ],
              }
        }
        transition={{
          delay,
          duration: Math.max(duration, 0.01),
          ease: "linear",
          repeat,
          times: [0, 0.42, 0.56, 1],
        }}
      />

      <motion.div
        className="absolute inset-0 grid grid-cols-3 gap-1.5 p-3"
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : {
                opacity: [0, 0, 1, 1],
                clipPath: [
                  "inset(100% 0% 0% 0%)",
                  "inset(100% 0% 0% 0%)",
                  "inset(0% 0% 0% 0%)",
                  "inset(0% 0% 0% 0%)",
                ],
              }
        }
        transition={{
          delay,
          duration: Math.max(duration, 0.01),
          ease: "linear",
          repeat,
          times: [0, 0.45, 0.6, 1],
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="rounded-[3px] bg-[#441F84]/75"
            style={{ opacity: index % 4 === 0 ? 0.45 : 0.78 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function ProcessVisualizer() {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0 : isHovered ? 11 : 6.25;
  const repeat = shouldReduceMotion ? 0 : Infinity;

  return (
    <motion.div
      aria-label="Axliner automation pipeline"
      className="relative mx-auto min-h-[940px] w-full max-w-[820px] overflow-visible p-0 sm:min-h-[980px]"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      <svg
        className="pointer-events-none absolute left-1/2 top-16 h-[calc(100%-8rem)] w-10 -translate-x-1/2"
        viewBox="0 0 40 520"
        fill="none"
      >
        <motion.path
          d="M20 0V520"
          stroke="#A78BFA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="6 12"
          animate={shouldReduceMotion ? {} : { strokeDashoffset: [0, -72] }}
          transition={{ duration: isHovered ? 3 : 1.55, ease: "linear", repeat }}
          opacity="0.75"
        />
      </svg>

      <FlowPacket delay={0} duration={duration} shouldReduceMotion={Boolean(shouldReduceMotion)} />
      <FlowPacket delay={duration / 2} duration={duration} shouldReduceMotion={Boolean(shouldReduceMotion)} />

      <div className="relative z-10 flex h-full min-h-[900px] flex-col justify-between sm:min-h-[940px]">
        <div className="mx-auto flex h-72 w-full max-w-[720px] items-center justify-center">
          <img src={assetPaths.chaos} alt="" className="h-full w-full object-contain drop-shadow-xl" />
        </div>

        <motion.div
          className="relative mx-auto flex h-80 w-full max-w-[760px] items-center justify-center"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.035, 1] }}
          transition={{ duration: 2.4, repeat, ease: "easeInOut" }}
        >
          <img src={assetPaths.cpu} alt="" className="relative h-full w-full object-contain" />
        </motion.div>

        <motion.div
          className="mx-auto flex h-72 w-full max-w-[720px] items-center justify-center"
          animate={{
            scale: isHovered ? 1.045 : 1,
            filter: isHovered ? "drop-shadow(0 18px 32px rgba(15, 23, 42, 0.16))" : "drop-shadow(0 12px 24px rgba(15, 23, 42, 0.08))",
          }}
          transition={{ duration: 0.28 }}
        >
          <img src={assetPaths.output} alt="" className="h-full w-full object-contain" />
        </motion.div>
      </div>
    </motion.div>
  );
}
