import { isSupabaseConfigured, supabase } from './supabase'

function assertAdminConnection(userId) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Admin management is unavailable until the service is configured.')
  if (!userId) throw new Error('A signed-in administrator is required.')
}

export async function getDonorAccessRequests(userId) {
  assertAdminConnection(userId)
  const { data, error } = await supabase
    .from('donor_access_requests')
    .select('id, user_id, email, full_name, status, created_at, reviewed_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function reviewDonorAccess(requestId, decision) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Donor management is unavailable.')
  const functionName = decision === 'approve' ? 'approve_donor_access' : 'reject_donor_access'
  const { error } = await supabase.rpc(functionName, { p_request_id: requestId })
  if (error) throw error
}