-- Additive, verified CERVICARE resources for healthcare_resources.
-- Run in the Supabase SQL Editor after the existing schema is applied.
-- This seed contains INSERT-only statements and never updates or deletes records.

-- Source: https://abdm.gov.in/
-- Verifies that the Government of India's Ayushman Bharat Digital Mission
-- develops an integrated national digital health ecosystem and includes a
-- Health Facility Registry for health facilities across India.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Ayushman Bharat Digital Mission (ABDM)',
  'government_scheme',
  NULL,
  'India',
  'Government of India digital-health mission with an integrated national health ecosystem and a Health Facility Registry. Confirm facility details directly through the official portal.',
  '1800-11-4477',
  'https://abdm.gov.in/',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Ayushman Bharat Digital Mission (ABDM)'))
);

-- Source: https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1043&lid=604
-- Verifies the Government of India's National Programme for Prevention and
-- Control of Non-Communicable Diseases (NP-NCD) programme page.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'National Programme for Prevention and Control of Non-Communicable Diseases (NP-NCD)',
  'government_scheme',
  NULL,
  'India',
  'Government of India programme for prevention and control of non-communicable diseases. Programme scope and local services should be confirmed through official health channels.',
  'See official website',
  'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1043&lid=604',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('National Programme for Prevention and Control of Non-Communicable Diseases (NP-NCD)'))
);

-- Source: https://hmfw.ap.gov.in/ntr-vaidya-initiative.aspx
-- Verifies that the Andhra Pradesh Government initiative provides free
-- essential laboratory investigations to patients visiting public health facilities.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'NTR Vaidya Pariksha',
  'government_scheme',
  'Andhra Pradesh',
  'Andhra Pradesh',
  'Andhra Pradesh Government initiative providing free essential laboratory investigations to patients visiting public health facilities. Confirm availability and eligibility locally.',
  'See official website',
  'https://hmfw.ap.gov.in/ntr-vaidya-initiative.aspx',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('NTR Vaidya Pariksha'))
);

-- Source: https://hmfw.ap.gov.in/tele-radiology-initiative.aspx
-- Verifies that the Andhra Pradesh Government initiative provides free
-- radiology services at CHCs, Area Hospitals, and District Hospitals when
-- prescribed by a doctor.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Andhra Pradesh Tele-Radiology Initiative',
  'government_scheme',
  'Andhra Pradesh',
  'Andhra Pradesh',
  'Andhra Pradesh Government initiative for free radiology services at Community Health Centres, Area Hospitals, and District Hospitals when prescribed by a doctor. Confirm current availability locally.',
  'See official website',
  'https://hmfw.ap.gov.in/tele-radiology-initiative.aspx',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Andhra Pradesh Tele-Radiology Initiative'))
);

-- Source: https://tmc.gov.in/
-- Verifies Tata Memorial Hospital, Parel, Mumbai as an official Tata
-- Memorial Centre institution. This entry does not claim a specific screening service.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Tata Memorial Hospital',
  'hospital',
  'Mumbai',
  'Maharashtra, India',
  'Official Tata Memorial Centre hospital in Parel, Mumbai. Contact the institution directly to confirm current services, appointments, and eligibility.',
  'See official website',
  'https://tmc.gov.in/TMH',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Tata Memorial Hospital'))
);

-- Source: https://www.indiancancersociety.org/
-- Verifies Indian Cancer Society cancer awareness, cancer care, cancer
-- detection/screening, survivorship and rehabilitation activities, plus its
-- Mumbai address and published helpline. This is classified as an NGO, not a screening centre.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Indian Cancer Society',
  'ngo',
  'Mumbai',
  'Maharashtra, India',
  'Cancer-support organisation whose official website documents cancer awareness, detection/screening, care, and survivorship and rehabilitation activities. Confirm current programmes directly with the organisation.',
  '+91-22-2413 9445 / 51; Cancer Helpline: 1800-22-1951',
  'https://www.indiancancersociety.org/',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Indian Cancer Society'))
);

-- Source: https://visakhapatnam.ap.gov.in/public-utility-category/hospitals/
-- The official Visakhapatnam District Administration directory verifies the
-- hospital name, Visakhapatnam location, and the published Apollo website.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Apollo Hospitals',
  'hospital',
  'Visakhapatnam',
  'Andhra Pradesh, India',
  'Hospital listed by the official Visakhapatnam District Administration directory. Confirm current services and appointments directly with the institution.',
  '08912727272',
  'https://www.askapollo.com/',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Apollo Hospitals'))
);

-- Source: https://visakhapatnam.ap.gov.in/public-utility-category/hospitals/
-- The official Visakhapatnam District Administration directory verifies the
-- hospital name, Visakhapatnam location, and the published contact number.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'CARE Hospitals',
  'hospital',
  'Visakhapatnam',
  'Andhra Pradesh, India',
  'Hospital listed by the official Visakhapatnam District Administration directory. Confirm current services and appointments directly with the institution.',
  '08913067000',
  NULL,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('CARE Hospitals'))
);

-- Source: https://visakhapatnam.ap.gov.in/public-utility-category/hospitals/
-- The official Visakhapatnam District Administration directory verifies the
-- hospital name, Visakhapatnam location, and the published contact number.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Indus Hospitals',
  'hospital',
  'Visakhapatnam',
  'Andhra Pradesh, India',
  'Hospital listed by the official Visakhapatnam District Administration directory. Confirm current services and appointments directly with the institution.',
  '9848724365',
  NULL,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Indus Hospitals'))
);

-- Source: https://visakhapatnam.ap.gov.in/public-utility-category/hospitals/
-- The official Visakhapatnam District Administration directory verifies the
-- hospital name and Visakhapatnam location. No contact or website is added
-- because that directory does not publish one for this entry.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'King George Hospital',
  'hospital',
  'Visakhapatnam',
  'Andhra Pradesh, India',
  'Hospital listed by the official Visakhapatnam District Administration directory. Confirm current services and appointments directly with the institution.',
  NULL,
  NULL,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('King George Hospital'))
);

-- Sources: https://hbchrcv.tmc.gov.in/ and official Tata Memorial Centre
-- documentation on Prevention and Screening services at the Visakhapatnam
-- centre, including women's and cervical cancer screening activities.
INSERT INTO public.healthcare_resources (
  name, resource_type, city, region, description, contact, website, is_demo
)
SELECT
  'Homi Bhabha Cancer Hospital & Research Centre',
  'screening_centre',
  'Visakhapatnam',
  'Andhra Pradesh, India',
  'Tata Memorial Centre facility with official documentation of Prevention and Screening services, including women''s and cervical cancer screening activities at the Visakhapatnam centre. Confirm current services directly with the institution.',
  NULL,
  'https://hbchrcv.tmc.gov.in/',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.healthcare_resources
  WHERE lower(trim(name)) = lower(trim('Homi Bhabha Cancer Hospital & Research Centre'))
);
