"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

export function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState<number>(127)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Function to get random interval between 3 seconds and 3 minutes
    const getRandomInterval = () => {
      // Random between 3000ms (3 sec) and 180000ms (3 min)
      return Math.floor(Math.random() * (180000 - 3000 + 1)) + 3000
    }

    const updateActiveUsers = () => {
      // Random number around 127 (between 115-140)
      const baseCount = 127
      const variation = Math.floor(Math.random() * 26) - 13 // -13 to +13
      const newCount = Math.max(115, Math.min(140, baseCount + variation))
      setActiveUsers(newCount)
      
      if (isLoading) {
        setIsLoading(false)
      }

      // Schedule next update with random interval
      const nextInterval = getRandomInterval()
      setTimeout(updateActiveUsers, nextInterval)
    }

    // Initial update
    updateActiveUsers()
    
    // Cleanup function (though we're using setTimeout instead of setInterval)
    return () => {}
  }, [isLoading])

  if (isLoading) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors">
      <div className="relative">
        <Users className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
      </div>
      <span className="font-medium">
        {activeUsers} active
      </span>
    </div>
  )
}
