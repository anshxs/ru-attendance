"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeftFloatingHeader() {
  const [isDark, setIsDark] = useState(true)
  const [currentTime, setCurrentTime] = useState("")

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
      setCurrentTime(timeString)
    }

    updateTime() // Initial call
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDark(savedTheme === "dark")
      document.documentElement.className = savedTheme
    } else {
      // Default to dark theme
      setIsDark(true)
      document.documentElement.className = "dark"
      localStorage.setItem("theme", "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setIsDark(!isDark)
    document.documentElement.className = newTheme
    localStorage.setItem("theme", newTheme)
  }

  return (
    <header className="fixed top-4 left-4 z-50 backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-full px-4 py-2 shadow-2xl">
      <div className="flex h-9 items-center space-x-3">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button> */}
        
        <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono tracking-wider">
            {currentTime}
          </span>
        </div>
      </div>
    </header>
  )
}