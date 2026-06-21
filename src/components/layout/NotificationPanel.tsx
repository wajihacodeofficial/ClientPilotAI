import { useEffect, useRef, useState } from 'react'
import { Bell, X, CheckCheck, Trash2, Star, GitBranch, Mail, FileText, Cpu } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Notification, NotificationType } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bgClass: string }
> = {
  lead:     { icon: Star,      color: 'var(--accent)',   bgClass: 'notif-icon-lead'     },
  pipeline: { icon: GitBranch, color: 'var(--primary)',  bgClass: 'notif-icon-pipeline' },
  outreach: { icon: Mail,      color: 'var(--success)',  bgClass: 'notif-icon-outreach' },
  proposal: { icon: FileText,  color: 'var(--warning)',  bgClass: 'notif-icon-proposal' },
  system:   { icon: Cpu,       color: 'var(--danger)',   bgClass: 'notif-icon-system'   },
}

// ─── Single notification row ─────────────────────────────────────────────────

function NotificationRow({ notification, onMarkRead }: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const cfg = typeConfig[notification.type]
  const Icon = cfg.icon

  return (
    <div
      className={`notif-row ${notification.read ? 'notif-row--read' : 'notif-row--unread'}`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
      role="listitem"
    >
      {/* Type icon */}
      <div className={`notif-icon-wrap ${cfg.bgClass}`}>
        <Icon size={14} color={cfg.color} />
      </div>

      {/* Content */}
      <div className="notif-content">
        <p className="notif-title">{notification.title}</p>
        <p className="notif-message">{notification.message}</p>
        <span className="notif-time">{relativeTime(notification.timestamp)}</span>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="notif-unread-dot" aria-label="Unread" />
      )}
    </div>
  )
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const notifications        = useAppStore((s) => s.notifications)
  const markRead             = useAppStore((s) => s.markNotificationRead)
  const markAllRead          = useAppStore((s) => s.markAllNotificationsRead)
  const clear                = useAppStore((s) => s.clearNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="notif-bell-wrap">
      {/* Bell trigger */}
      <button
        ref={btnRef}
        id="notification-bell-btn"
        aria-label="Open notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative h-10 w-10 flex items-center justify-center clay-raised text-(--text-secondary) hover:text-(--text-primary) transition-colors ${open ? 'notif-bell--active' : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} unread`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          id="notification-panel"
          role="dialog"
          aria-label="Notifications"
          className="notif-panel clay-floating"
        >
          {/* Header */}
          <div className="notif-header">
            <div className="notif-header-left">
              <Bell size={16} color="var(--primary)" />
              <h2 className="notif-header-title">Notifications</h2>
              {unreadCount > 0 && (
                <span className="notif-count-chip">{unreadCount} new</span>
              )}
            </div>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  className="notif-action-btn"
                  onClick={markAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notif-action-btn notif-action-btn--danger"
                  onClick={clear}
                  title="Clear all notifications"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                className="notif-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="notif-divider" />

          {/* List */}
          <div className="notif-list" role="list" aria-live="polite">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={32} color="var(--text-secondary)" />
                <p>All caught up!</p>
                <span>No notifications right now.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <div className="notif-divider" />
              <div className="notif-footer">
                <span className="notif-footer-text">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
                </span>
                {notifications.every((n) => n.read) && (
                  <span className="notif-all-read-chip">
                    <CheckCheck size={11} />
                    All read
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
