"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Heart, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import useSWR from "swr"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/scores", label: "My Scores", icon: Target },
  { href: "/dashboard/draws", label: "Draws", icon: Trophy },
  { href: "/dashboard/charity", label: "My Charity", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: user } = useSWR("user", async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user
  })

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = user?.user_metadata?.first_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-serif text-sm font-bold text-primary-foreground">B4</span>
            </div>
            <span className="font-serif text-lg font-semibold">Birdies4Good</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">
                    {user?.user_metadata?.first_name ?? "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-serif text-sm font-bold text-primary-foreground">B4</span>
          </div>
          <span className="font-serif text-lg font-semibold">Birdies4Good</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Mobile Nav */}
      <nav className={cn(
        "fixed inset-x-0 top-16 z-30 border-b border-border bg-card p-4 transition-transform lg:hidden",
        mobileOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </nav>

      {/* Spacer for mobile header */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
