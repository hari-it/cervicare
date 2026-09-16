import { isSupabaseConfigured, supabase } from './supabase'

function assertSupportConnection(userId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Hospital verification is unavailable until Supabase is configured.')
  }
  if (!userId) {
    throw new Error('A signed-in user is required for the hospital portal.')
  }
}

export async function requestHospitalRegistration(userId, hospital) {
  assertSupportConnection(userId)
  const { data, error } = await supabase.rpc('register_hospital', {
    p_name: hospital.name,
    p_city: hospital.city,
    p_region: hospital.region,
    p_official_website: hospital.officialWebsite,
  })
  if (error) throw error

  const result = Array.isArray(data) ? data[0] : data
  return {
    hospital: {
      id: result.hospital_id,
      verification_status: result.verification_status,
    },
    representation: {
      id: result.representative_id,
      user_id: userId,
      hospital_id: result.hospital_id,
      status: result.representative_status,
    },
  }
}

export async function getMyHospitalRepresentations(userId) {
  assertSupportConnection(userId)
  const { data: representations, error } = await supabase
    .from('hospital_representatives')
    .select('id, user_id, hospital_id, status, reviewed_at, hospitals(id, name, city, region, official_website, verification_status, verified_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return representations || []
}

export async function getAssignedHospitalCases(userId, hospitalIds) {
  assertSupportConnection(userId)
  if (!hospitalIds.length) return []
  const { data: cases, error } = await supabase
    .from('patient_cases')
    .select('id, case_reference, diagnosis_description, treatment_description, estimated_treatment_cost, assistance_requested, assistance_received, case_status, hospital_verification_status, admin_verification_status, created_at, hospital_id')
    .in('hospital_id', hospitalIds)
    .order('created_at', { ascending: false })
  if (error) throw error

  const caseIds = (cases || []).map((item) => item.id)
  if (!caseIds.length) return cases || []
  const { data: documents, error: documentsError } = await supabase
    .from('case_documents')
    .select('id, case_id, document_type, verification_status, verified_at, created_at')
    .in('case_id', caseIds)
  if (documentsError) throw documentsError

  return (cases || []).map((item) => ({
    ...item,
    documents: (documents || []).filter((document) => document.case_id === item.id),
  }))
}

export async function verifyPatientCase(caseId) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Hospital verification is unavailable.')
  const { error } = await supabase.rpc('verify_patient_case', { p_case_id: caseId })
  if (error) throw error
}

export async function rejectPatientCase(caseId) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Hospital verification is unavailable.')
  const { error } = await supabase.rpc('reject_patient_case', { p_case_id: caseId })
  if (error) throw error
}

export async function getReviewerHospitals(userId) {
  assertSupportConnection(userId)
  const { data, error } = await supabase
    .from('hospitals')
    .select('id, name, city, region, official_website, verification_status, created_at, hospital_representatives(user_id, status)')
    .in('verification_status', ['pending', 'under_review'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function reviewHospital(hospitalId, representativeUserId, decision) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Hospital verification is unavailable.')
  const functionName = decision === 'approve' ? 'approve_hospital_registration' : 'reject_hospital_registration'
  const { error } = await supabase.rpc(functionName, {
    p_hospital_id: hospitalId,
    p_representative_user_id: representativeUserId,
  })
  if (error) throw error
}

export async function getReviewerCases(userId) {
  assertSupportConnection(userId)
  const { data, error } = await supabase
    .from('patient_cases')
    .select('id, case_reference, diagnosis_description, treatment_description, case_status, hospital_verification_status, admin_verification_status, hospital_id, hospitals(name, city, region)')
    .eq('hospital_verification_status', 'verified')
    .in('admin_verification_status', ['pending', 'under_review'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function reviewPatientCase(caseId, decision) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Case review is unavailable.')
  const { error } = await supabase.rpc('review_patient_case', {
    p_case_id: caseId,
    p_decision: decision,
  })
  if (error) throw error
}

export async function getVerifiedHospitals() {
  if (!isSupabaseConfigured || !supabase) throw new Error('Support cases are unavailable until Supabase is configured.')
  const { data, error } = await supabase
    .from('hospitals')
    .select('id, name, city, region, official_website')
    .eq('verification_status', 'verified')
    .order('name')
  if (error) throw error
  return data || []
}

export async function getMyPatientCases(userId) {
  assertSupportConnection(userId)
  const { data: cases, error } = await supabase
    .from('patient_cases')
    .select('id, case_reference, diagnosis_description, treatment_description, hospital_id, estimated_treatment_cost, assistance_requested, assistance_received, case_status, hospital_verification_status, admin_verification_status, created_at, updated_at, hospitals(name, city, region)')
    .eq('patient_user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const caseIds = (cases || []).map((item) => item.id)
  if (!caseIds.length) return cases || []
  const { data: documents, error: documentsError } = await supabase
    .from('case_documents')
    .select('id, case_id, document_type, verification_status, verified_at, created_at')
    .in('case_id', caseIds)
  if (documentsError) throw documentsError

  return (cases || []).map((item) => ({
    ...item,
    documents: (documents || []).filter((document) => document.case_id === item.id),
  }))
}

function makeCaseReference() {
  return `CV-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function submitPatientCase(userId, details, files) {
  assertSupportConnection(userId)
  const { data: createdCase, error: caseError } = await supabase
    .from('patient_cases')
    .insert({
      patient_user_id: userId,
      case_reference: makeCaseReference(),
      diagnosis_description: details.caseInformation.trim(),
      treatment_description: details.treatmentInformation.trim(),
      hospital_id: details.hospitalId,
      estimated_treatment_cost: Number(details.estimatedTreatmentCost),
      assistance_requested: Number(details.assistanceRequested),
      assistance_received: 0,
    })
    .select('id, case_reference')
    .single()
  if (caseError) throw caseError

  const uploadedPaths = []
  try {
    for (const file of files) {
      const path = `${userId}/${createdCase.id}/${Date.now()}-${safeFileName(file.name)}`
      const { error: uploadError } = await supabase.storage.from('patient-case-documents').upload(path, file, {
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      })
      if (uploadError) throw uploadError
      uploadedPaths.push(path)

      const { error: metadataError } = await supabase.from('case_documents').insert({
        case_id: createdCase.id,
        document_type: file.type || 'supporting_document',
        storage_path: path,
        verification_status: 'pending',
      })
      if (metadataError) throw metadataError
    }
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from('patient-case-documents').remove(uploadedPaths)
    }
    await supabase.from('patient_cases').delete().eq('id', createdCase.id).eq('patient_user_id', userId)
    throw error
  }

  return createdCase
}

export async function getApprovedSupportCases(userId) {
  assertSupportConnection(userId)
  const { data, error } = await supabase
    .from('patient_cases')
    .select('id, case_reference, treatment_description, hospital_id, estimated_treatment_cost, assistance_requested, assistance_received, case_status, hospital_verification_status, admin_verification_status, created_at, updated_at, hospitals(name, city, region)')
    .eq('case_status', 'published')
    .eq('hospital_verification_status', 'verified')
    .eq('admin_verification_status', 'approved')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createSupportIntent(userId, caseId, amount) {
  assertSupportConnection(userId)
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Enter a support amount greater than zero.')
  }
  const { data, error } = await supabase.rpc('create_support_intent', {
    p_case_id: caseId,
    p_amount: numericAmount,
  })
  if (error) throw error
  return data
}

export async function getMySupportRecords(userId) {
  assertSupportConnection(userId)
  const { data, error } = await supabase
    .from('support_records')
    .select('id, case_id, amount, status, created_at, patient_cases(case_reference)')
    .eq('donor_user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
