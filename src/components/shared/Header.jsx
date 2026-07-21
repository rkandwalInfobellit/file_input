import { useState } from "react"
import { Search, Bell, ChevronDown, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUser, logout } from "@/lib/auth"
import headerLogo from "@/assets/amd-header-logo.svg"

export default function Header({ notificationCount = 0 }) {
  const [accountOpen, setAccountOpen] = useState(false)

  const user = getUser()
  const displayName = user.email || user.username || "User"

  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-15.5 items-center justify-between border-b border-border bg-foreground px-4">
      {/* Brand */}
      <a href="/" className="flex h-full items-center" aria-label="Home">
        <img src={headerLogo} alt="Company logo" width={80} />
      </a>

      {/* Utility cluster */}
      <div className="flex items-center gap-1.5">
        
        <button
          type="button"
          className="rounded-md p-2 text-primary-foreground transition-colors hover:bg-sidebar-accent/60 sm:hidden"
          aria-label="Search"
        >
          <Search className="h-4.5 w-4.5" strokeWidth={2} />
        </button>

        <button
          type="button"
          className="relative rounded-md p-2 text-primary-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          aria-label={notificationCount > 0 ? `${notificationCount} unread notifications` : "Notifications"}
        >
          <Bell className="h-4.5 w-4.5" strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-status-overdue">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-overdue opacity-75" />
            </span>
          )}
        </button>
 

        <div className="mx-1 h-6 w-px bg-sidebar-border" />

        {/* Account menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((open) => !open)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-sidebar-accent/60"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary font-mono text-xs font-semibold text-sidebar-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm text-primary-foreground md:inline">{displayName}</span>
            <ChevronDown
              className={cn(
                "hidden h-3.5 w-3.5 text-primary-foreground transition-transform md:block",
                accountOpen && "rotate-180"
              )}
              strokeWidth={2}
            />
          </button>

          {accountOpen && (
            <>
              {/* Click-away layer */}
              <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-popover py-1 shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium text-popover-foreground">{displayName}</p>
                </div>
                <button className="block w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent">
                  Profile
                </button>
                <button className="block w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent">
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
