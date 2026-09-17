import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAllNotificationsRead, markNotificationRead, subscribeToNotifications } from '../../services/notificationService'
import Button from '../ui/Button'

function NotificationBell({ user }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const panelRef = useRef(null)
  const unreadCount = notifications.filter((item) => !item.read).length

  useEffect(() => {
    let active = true
    if (!user) return undefined
    getNotifications(user.id)
      .then((items) => { if (active) setNotifications(items) })
      .catch((loadError) => { if (active) setError(loadError.message) })
    const unsubscribe = subscribeToNotifications(user.id, ({ new: item }) => {
      setNotifications((current) => [item, ...current.filter((existing) => existing.id !== item.id)].slice(0, 30))
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    function closeOnOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [])

  async function handleRead(notification) {
    setOpen(false)
    if (!notification.read) {
      try {
        await markNotificationRead(user.id, notification.id)
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item))
      } catch (readError) {
        setError(readError.message)
      }
    }
    if (notification.link) navigate(notification.link)
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead(user.id)
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    } catch (readError) {
      setError(readError.message)
    }
  }

  return (
    <div className="notification-control" ref={panelRef}>
      <button type="button" className="notification-bell" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span aria-hidden="true">&#128276;</span>
        {unreadCount ? <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
      </button>
      {open ? (
        <div className="notification-panel" role="dialog" aria-label="Notifications">
          <div className="notification-panel-heading">
            <strong>Notifications</strong>
            <Button size="sm" variant="ghost" onClick={handleMarkAllRead} disabled={!unreadCount}>Mark all as read</Button>
          </div>
          {error ? <p className="notification-error">{error}</p> : null}
          {!notifications.length ? <p className="notification-empty">You're all caught up.</p> : null}
          <div className="notification-list">
            {notifications.map((notification) => (
              <button key={notification.id} type="button" className={`notification-item ${notification.read ? 'read' : 'unread'}`} onClick={() => handleRead(notification)}>
                <span className="notification-item-title">{notification.title}</span>
                <span>{notification.message}</span>
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationBell