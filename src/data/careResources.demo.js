export const RESOURCE_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'screening_centre', label: 'Screening centres' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'ngo', label: 'NGOs' },
  { value: 'government_scheme', label: 'Government schemes' },
]

export const demoCareResources = [
  {
    id: 'demo-screening-1',
    name: 'Sample District Screening Centre (DEMO)',
    resource_type: 'screening_centre',
    city: 'Sample City',
    region: 'Sample State',
    description:
      'Illustrative listing only. This is not a real clinic. Use it to preview search and filters until live data is connected.',
    contact: 'Not a real phone number',
    website: '',
    is_demo: true,
  },
  {
    id: 'demo-hospital-1',
    name: 'Sample Women’s Hospital Outreach Desk (DEMO)',
    resource_type: 'hospital',
    city: 'Sample City',
    region: 'Sample State',
    description:
      'Fictional hospital desk used for demonstration. Do not travel here or treat this as a verified facility.',
    contact: 'Not a real phone number',
    website: '',
    is_demo: true,
  },
  {
    id: 'demo-ngo-1',
    name: 'Sample Community Women’s Health NGO (DEMO)',
    resource_type: 'ngo',
    city: 'Sample City',
    region: 'Sample State',
    description:
      'Placeholder NGO record. Real organisations should be added only from verified directories after Supabase is connected.',
    contact: 'Not a real helpline',
    website: '',
    is_demo: true,
  },
  {
    id: 'scheme-pmjay',
    name: 'Ayushman Bharat — PM-JAY',
    resource_type: 'government_scheme',
    city: 'Nationwide (India)',
    region: 'India',
    description:
      'Official Government of India health assurance scheme. Eligibility, hospitals, and benefits must be confirmed on the official PM-JAY site — not through CERVICARE.',
    contact: 'See official website',
    website: 'https://nha.gov.in/PM-JAY',
    is_demo: false,
  },
  {
    id: 'scheme-nhm',
    name: 'National Health Mission (NHM)',
    resource_type: 'government_scheme',
    city: 'Nationwide (India)',
    region: 'India',
    description:
      'Flagship public health mission of the Government of India. Screening and community services vary by state. Confirm details through official NHM channels.',
    contact: 'See official website',
    website: 'https://nhm.gov.in/',
    is_demo: false,
  },
  {
    id: 'scheme-immunisation',
    name: 'Universal Immunisation Programme / national HPV vaccine guidance',
    resource_type: 'government_scheme',
    city: 'Nationwide (India)',
    region: 'India',
    description:
      'HPV vaccine availability in public programmes changes over time. Confirm current eligibility with MoHFW, your state immunisation officer, or a clinician.',
    contact: 'See MoHFW',
    website: 'https://mohfw.gov.in/',
    is_demo: false,
  },
]
