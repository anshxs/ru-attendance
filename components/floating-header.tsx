"use client"

import { Github, Linkedin, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FloatingHeader() {
  const handleGithubClick = () => {
    window.open("https://github.com/anshxs", "_blank")
  }

  const handleLinkedinClick = () => {
    window.open("https://linkedin.com/in/anshsx", "_blank")
  }

  const handleInstagramClick = () => {
    window.open("https://instagram.com/ansh_xs", "_blank")
  }

  return (
    <header className="fixed top-4 right-4 z-50 backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-full px-3 py-2 shadow-2xl">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLinkedinClick}
          className="h-9 w-9 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
        >
          <Linkedin className="h-4 w-4" />
          <span className="sr-only">LinkedIn</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleInstagramClick}
          className="h-9 w-9 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
        >
          <Instagram className="h-4 w-4" />
          <span className="sr-only">Instagram</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGithubClick}
          className="h-9 w-9 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
        >
          <Github className="h-4 w-4" />
          <span className="sr-only">GitHub</span>
        </Button>
      </div>
    </header>
  )
}
