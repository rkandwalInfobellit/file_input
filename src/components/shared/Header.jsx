import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Bell, ChevronDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { getUser, logout } from "@/lib/auth"
import { ROUTES } from "@/lib/routes"
import headerLogo from "@/assets/amd-header-logo.svg"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  fetchNotifications,
  markNotificationRead,
  clearNotifications,
} from "@/store/slice/notification.slice"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return ""
  }
}

// ---------------------------------------------------------------------------
// Single notification row
// ---------------------------------------------------------------------------
function NotificationItem({ item, onRead }) {
  return (
    <button
      type="button"
      onClick={() => onRead(item)}
      className={cn(
        "w-full text-left rounded-md px-3 py-2.5 transition-colors hover:bg-accent focus-visible:outline-none cursor-pointer",
        !item.is_read && "bg-primary/5"
      )}
    >
      {/* Row 1: actor name + timestamp */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="text-xs font-semibold text-foreground truncate">
          {item.actor_full_name ?? "System"}
        </span>
        <span className="text-[11px] text-muted-foreground/60 shrink-0">
          {timeAgo(item.created_at)}
        </span>
      </div>

      {/* Row 2: title + unread dot */}
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">
          {item.title}
        </p>
        {!item.is_read && (
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        )}
      </div>

      {/* Row 3: message */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
        {item.message}
      </p>

      {/* Row 4: actor_role badge */}
      {item.actor_role && (
        <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize font-normal">
          {item.actor_role}
        </Badge>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, unreadCount, fetchStatus } = useSelector((s) => s.notifications)

  const user = getUser()
  const displayName = user.email || user.username || "User"
  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  function handleRead(item) {
    const versionId = item.metadata?.version_id
    if (!item.is_read) {
      dispatch(markNotificationRead({ notification_ids: [item.notification_id] }))
    }
    if (versionId) {
      navigate(ROUTES.FILE_DETAIL(versionId))
    }
  }

  function handleReadAll() {
    if (!items.some((n) => !n.is_read)) return
    dispatch(markNotificationRead({ notification_ids: [], type: "all" }))
  }

  function handleClearAll() {
    if (!items.length) return
    dispatch(clearNotifications({ notification_ids: items.map((n) => n.notification_id), type: "all" }))
  }

  const loading = fetchStatus === "loading"
  const allRead = !items.some((n) => !n.is_read)

  return (
    <header className="flex h-14 items-center justify-between border-b bg-foreground px-4">
      {/* Brand */}
      <a href="/" className="flex h-full items-center" aria-label="Home">
        <img src={headerLogo} alt="Company logo" width={80} />
      </a>

      {/* Utility cluster */}
      <div className="flex items-center gap-1">

        {/* ── Notification bell ─────────────────────────────────────── */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" strokeWidth={2} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center rounded-full pointer-events-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            }
          />

          <PopoverContent
            side="bottom"
            align="end"
            className="w-95 p-0 gap-0"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-popover-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 rounded-full">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Notification list */}
            <ScrollArea className="h-100">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-1.5">
                  <Bell className="h-7 w-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">You're all caught up</p>
                </div>
              ) : (
                <div className="flex flex-col p-2 gap-0.5">
                  {items.map((item, i) => (
                    <div key={item.notification_id}>
                      <NotificationItem item={item} onRead={handleRead} />
                      {i < items.length - 1 && <Separator className="my-0.5 opacity-40" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator />

            {/* Footer: mark all read + clear all */}
            <div className="grid grid-cols-2 gap-2 p-1">
              <Button
                // variant="secondary"
                size="sm"
                className="text-xs h-8"
                disabled={allRead || loading}
                onClick={handleReadAll}
              >
                Mark all read
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs h-8"
                disabled={!items.length || loading}
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-1.5 h-5 w-px bg-white/20" />

        {/* ── Account dropdown ──────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary font-mono text-xs font-semibold text-sidebar-primary-foreground">
                  {initials}
                </span>
                <span className="hidden text-sm md:inline">{displayName}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 md:block" strokeWidth={2} />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <span className="text-sm font-medium">{displayName}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={logout}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
