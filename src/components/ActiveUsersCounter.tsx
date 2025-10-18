"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

export function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching active users count
    // In production, this would be a real API call
    const fetchActiveUsers = async () => {
      try {
        // Simulated count - you can replace with actual API call
        // const response = await fetch('/api/active-users')
        // const data = await response.json()
        
        // For now, using a realistic random number between 1200-1500
        const baseCount = 1247
        const variation = Math.floor(Math.random() * 50) - 25
        setActiveUsers(baseCount + variation)
      } catch (error) {
        console.error('Error fetching active users:', error)
        setActiveUsers(1247) // Fallback number
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveUsers()
    
    // Update count every 30 seconds for real-time feel
    const interval = setInterval(fetchActiveUsers, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-purple-600 transition-colors">
      <div className="relative">
        <Users className="h-3 w-3" />
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
      </div>
      <span className="font-medium">
        {activeUsers.toLocaleString()} active users
      </span>
    </div>
  )
}
