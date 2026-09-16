import { isSupabaseConfigured, supabase } from './supabase'

const TOPIC_IDS = new Set([
  'cervical-cancer',
  'hpv-vaccination',
  'prevention',
  'screening',
  'symptoms-risk-factors',
])

function assertProgressRequest(userId, topic) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Learning progress is unavailable until Supabase is configured.')
  }
  if (!userId) {
    throw new Error('A signed-in user is required to access learning progress.')
  }
  if (topic && !TOPIC_IDS.has(topic)) {
    throw new Error('The requested learning topic is not supported.')
  }
}

export async function getLearningProgress(userId) {
  assertProgressRequest(userId)
  const { data, error } = await supabase
    .from('learning_progress')
    .select('topic, completed_steps, total_steps, completed, updated_at')
    .eq('user_id', userId)
    .order('topic')
  if (error) throw error
  return data || []
}

export async function getTopicProgress(userId, topic) {
  assertProgressRequest(userId, topic)
  const { data, error } = await supabase
    .from('learning_progress')
    .select('topic, completed_steps, total_steps, completed, updated_at')
    .eq('user_id', userId)
    .eq('topic', topic)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveTopicProgress(userId, topic, completedSteps, completed) {
  assertProgressRequest(userId, topic)
  const safeCompletedSteps = Math.max(0, Math.min(3, completedSteps))
  const { data, error } = await supabase
    .from('learning_progress')
    .upsert(
      {
        user_id: userId,
        topic,
        completed_steps: safeCompletedSteps,
        total_steps: 3,
        completed: Boolean(completed),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic' },
    )
    .select('topic, completed_steps, total_steps, completed, updated_at')
    .single()
  if (error) throw error
  return data
}
