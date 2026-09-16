import { demoCareResources } from '../data/careResources.demo'
import { isSupabaseConfigured, supabase } from './supabase'

function normalizeLocationValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function matches(resource, query, type, location) {
  const q = query.trim().toLowerCase()
  const typeOk = type === 'all' || resource.resource_type === type
  const locations = [resource.city, resource.region].map(normalizeLocationValue)
  const locationOk =
    location === 'all' ||
    (location === 'andhra-pradesh' && locations.some((value) => value.includes('andhra pradesh'))) ||
    (location === 'india' && locations.some((value) => value.includes('india') || value.includes('nationwide')))

  if (!typeOk || !locationOk) return false
  if (!q) return true
  return [resource.name, resource.city, resource.region, resource.description]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(q))
}

export async function listResources({ query = '', type = 'all', location = 'all' } = {}) {
  if (isSupabaseConfigured && supabase) {
    let request = supabase.from('healthcare_resources').select('*').order('name')
    if (type !== 'all') {
      request = request.eq('resource_type', type)
    }
    const { data, error } = await request
    if (error) throw error
    return (data || []).filter((row) => matches(row, query, type, location))
  }

  return demoCareResources.filter((row) => matches(row, query, type, location))
}

export function usingDemoCareData() {
  return !isSupabaseConfigured
}
