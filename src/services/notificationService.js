import { isSupabaseConfigured, supabase } from './supabase'

function assertNotifications() {
  if (!isSupabaseConfigured || !supabase) throw new Error('Notifications are unavailable until the service is configured.')
}

export async function getNotifications(userId) {
  assertNotifications()
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, link, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data || []
}

export async function markNotificationRead(userId, notificationId) {
  assertNotifications()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function markAllNotificationsRead(userId) {
  assertNotifications()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
}

export function subscribeToNotifications(userId, onInsert) {
  if (!supabase || !userId) return () => {}
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, onInsert)
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}