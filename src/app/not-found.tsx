"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCurrentTheme } from "@/hooks/use-current-theme"

export default function NotFound() {
  const currentTheme = useCurrentTheme()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        {/* Logo and Brand */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <Image 
            src='/cookdev_logo.png' 
            alt='DevCook logo' 
            width={60} 
            height={60} 
            className="opacity-80"
          />
          <span className="text-2xl font-semibold text-foreground">DevCook</span>
        </div>

        {/* 404 Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Recipe Not Found</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Looks like this page got burned in the kitchen! 
            The recipe you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              Back to Kitchen
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects">
              View Projects
            </Link>
          </Button>
        </div>

        {/* Theme-aware decorative element */}
        <div className={`mt-12 text-xs text-muted-foreground ${
          currentTheme === 'dark' ? 'opacity-50' : 'opacity-70'
        }`}>
          🍳 Let's cook up something amazing instead!
        </div>
      </div>
    </div>
  )
}