import React from 'react'

interface AppIconProps {
  className?: string
  size?: number
}

export function AppIcon({ className = '', size = 24 }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rectangle with rounded corners */}
      <rect
        x="2"
        y="3"
        width="20"
        height="18"
        rx="3"
        fill="#10B981"
        stroke="#10B981"
        strokeWidth="1"
      />
      
      {/* "EX" text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        EX
      </text>
      
      {/* Grid lines to suggest spreadsheet */}
      <line x1="8" y1="3" x2="8" y2="21" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="16" y1="3" x2="16" y2="21" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="2" y1="9" x2="22" y2="9" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="2" y1="15" x2="22" y2="15" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

// Alternative minimal version without grid lines
export function AppIconMinimal({ className = '', size = 24 }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="3"
        width="20"
        height="18"
        rx="3"
        fill="#10B981"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        EX
      </text>
    </svg>
  )
}

// Logo version with app name
export function AppLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AppIcon size={28} />
      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
        Exceletto
      </span>
    </div>
  )
}
