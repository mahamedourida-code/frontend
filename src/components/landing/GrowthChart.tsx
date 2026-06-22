"use client";

/* A recreation of the Stripe/Baremetrics-style MRR card, re-skinned for
   AxLiner: bigger headline number, purple growth line (#8B5DFE), a
   greyed dashed "previous period" line underneath. It stands in as the
   product "screenshot" inside a use-case card — the upward trend is the
   quiet payoff of getting data-entry hours back. All text is black/green
   (no grey text); only the comparison line and gridlines are light. */

const MAIN = [
  0.30, 0.34, 0.31, 0.39, 0.43, 0.41, 0.48, 0.51, 0.53, 0.56,
  0.59, 0.63, 0.67, 0.71, 0.75, 0.79, 0.84, 0.89, 0.93, 0.98,
];
const PREV = [
  0.12, 0.14, 0.13, 0.16, 0.18, 0.17, 0.20, 0.21, 0.23, 0.22,
  0.25, 0.27, 0.26, 0.29, 0.31, 0.33, 0.35, 0.37, 0.41, 0.47,
];

const W = 540;
const H = 250;
const PAD_L = 8;
const PAD_R = 56;
const PAD_T = 10;
const PAD_B = 26;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;

function toPoints(arr: number[]) {
  return arr
    .map((v, i) => `${PAD_L + (i / (arr.length - 1)) * CW},${PAD_T + (1 - v) * CH}`)
    .join(" ");
}

const Y_LABELS = ["$60K", "$40K", "$20K", "$0"];

export function GrowthChart() {
  return (
    <div className="flex h-full w-full flex-col bg-white px-6 pt-6">
      {/* Header — label + (i) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-semibold text-[#191919]">Revenue</span>
        <span className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border border-[#cbd5e1] text-[10px] font-bold leading-none text-[#475467]">
          i
        </span>
      </div>

      {/* Big number + delta */}
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[34px] font-bold leading-none tracking-[-0.03em] text-[#191919]">
          $48,200
        </span>
        <span className="text-[16px] font-bold text-[var(--data-money)]">+214%</span>
      </div>
      <p className="mt-1.5 text-[13px] font-medium text-[#191919]">
        $15,340 previous period
      </p>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full flex-1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* gridlines + y labels */}
        {Y_LABELS.map((label, i) => {
          const y = PAD_T + (i / (Y_LABELS.length - 1)) * CH;
          return (
            <g key={label}>
              <line
                x1={PAD_L}
                y1={y}
                x2={PAD_L + CW}
                y2={y}
                stroke="#e8eaf0"
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={W - PAD_R + 12}
                y={y + 4}
                className="fill-[#191919]"
                fontSize="13"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* previous period — light dashed */}
        <polyline
          points={toPoints(PREV)}
          fill="none"
          stroke="#c3c9d6"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 11"
          vectorEffect="non-scaling-stroke"
        />

        {/* current period — purple growth line (matches the source chart) */}
        <polyline
          points={toPoints(MAIN)}
          fill="none"
          stroke="#8B5DFE"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* x labels */}
      <div className="-mt-1 flex justify-between pr-14 text-[12px] font-medium text-[#191919]">
        <span>Mar 15</span>
        <span>Apr 5</span>
      </div>
    </div>
  );
}
