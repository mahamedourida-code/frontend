"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

export function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState<number>(127)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Function to get random interval - more frequent updates (10-40 seconds)
    const getRandomInterval = () => {
      return Math.floor(Math.random() * (40000 - 10000 + 1)) + 10000
    }

    const updateActiveUsers = () => {
      // Random number around 127 (between 115-140)
      const baseCount = 127
      const variation = Math.floor(Math.random() * 26) - 13
      const newCount = Math.max(115, Math.min(140, baseCount + variation))
      setActiveUsers(newCount)
      
      if (isLoading) {
        setIsLoading(false)
      }

      // Schedule next update with random interval
      const nextInterval = getRandomInterval()
      setTimeout(updateActiveUsers, nextInterval)
    }

    // Start updating users count
    updateActiveUsers()
    
    // Blinking indicator - appears/disappears like live indicator
    const blinkInterval = setInterval(() => {
      setIsVisible(prev => !prev)
    }, 800) // Blink every 800ms
    
    return () => {
      clearInterval(blinkInterval)
    }
  }, [isLoading])

  if (isLoading) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors">
      <div className="relative">
        <Users className="h-4 w-4" />
        <span 
          className={`absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full transition-opacity duration-200 ${
            isVisible ? 'opacity-100 shadow-[0_0_8px_rgba(34,197,94,1)]' : 'opacity-0'
          }`}
        />
      </div>
      <span className="font-medium transition-all duration-300">
        {activeUsers} active
      </span>
    </div>
  )
}
