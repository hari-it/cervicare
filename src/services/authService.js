import { isSupabaseConfigured, supabase } from './supabase'

export const AUTH_NOT_CONNECTED =
  'Authentication is not connected yet. Check the Supabase environment configuration, then restart the dev server.'

function friendlyAuthError(error, fallback) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('invalid login credentials')) return 'The email or password is incorrect.'
  if (message.includes('user already registered')) return 'An account with this email already exists.'
  if (message.includes('email not confirmed')) return 'Please confirm your email before logging in.'
  if (message.includes('password')) return 'Please choose a valid password and try again.'
  if (message.includes('email')) return 'Please enter a valid email address.'
  return fallback
}

export async function getSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getProfile(user) {
  if (!supabase || !user) return null
  const { data, error } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (data) return data

  const fullName = user.user_metadata?.full_name?.trim()
  if (!fullName) return null
  const { data: created, error: createError } = await supabase
    .from('profiles')
    .insert({ id: user.id, full_name: fullName })
    .select('full_name, role')
    .single()
  if (createError) throw createError
  return created
}

export async function getAccessState(user) {
  if (!supabase || !user) return { role: null, hospitalStatus: 'none', isAdmin: false, isHospitalVerified: false }
  const [{ data: reviewer, error: reviewerError }, { data: representations, error: representationsError }] = await Promise.all([
    supabase.rpc('support_is_reviewer'),
    supabase.from('hospital_representatives').select('status, hospitals(verification_status)').eq('user_id', user.id),
  ])
  if (reviewerError) throw reviewerError
  if (representationsError) throw representationsError
  const isAdmin = reviewer === true
  const isHospitalVerified = (representations || []).some((item) => item.status === 'verified' && item.hospitals?.verification_status === 'verified')
  const hasPendingHospital = (representations || []).some((item) => item.status === 'pending' || item.hospitals?.verification_status === 'pending')
  return {
    role: isAdmin ? 'admin' : isHospitalVerified ? 'hospital' : null,
    hospitalStatus: isHospitalVerified ? 'verified' : hasPendingHospital ? 'pending' : 'none',
    isAdmin,
    isHospitalVerified,
  }
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe() {} } } }
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured) {
    throw new Error(AUTH_NOT_CONNECTED)
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(friendlyAuthError(error, 'Unable to log in. Please try again.'))
  return data
}

export async function signUp(email, password, fullName) {
  if (!isSupabaseConfigured) {
    throw new Error(AUTH_NOT_CONNECTED)
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(friendlyAuthError(error, 'Unable to create an account. Please try again.'))
  if (data.session && data.user) await getProfile(data.user)
  return data
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    throw new Error(AUTH_NOT_CONNECTED)
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(friendlyAuthError(error, 'Unable to log out. Please try again.'))
}
