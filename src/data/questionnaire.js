export const questionnaireIntro = {
  title: 'Self-Awareness Check',
  subtitle:
    'A short educational questionnaire about screening, vaccination, and when to seek care. It is not a test for cancer and does not calculate risk.',
}

export const questionnaireQuestions = [
  {
    id: 'screening-knowledge',
    prompt: 'How familiar are you with cervical screening (HPV test, Pap test, or VIA, depending on local programmes)?',
    options: [
      { value: 'new', label: 'I am just learning what screening is' },
      { value: 'some', label: 'I know the general idea, but not the details' },
      { value: 'confident', label: 'I understand screening well enough to discuss it with a clinician' },
    ],
  },
  {
    id: 'vaccine-knowledge',
    prompt: 'Which statement best matches your current understanding of HPV vaccination?',
    options: [
      { value: 'unsure', label: 'I am not sure what the vaccine does' },
      { value: 'prevention', label: 'I know it helps prevent HPV infection, not treat cancer' },
      { value: 'clinic', label: 'I already know I should ask a clinician about eligibility in my area' },
    ],
  },
  {
    id: 'symptoms-action',
    prompt: 'If you noticed unusual bleeding, unusual discharge, or pelvic pain, what would you do?',
    options: [
      { value: 'wait', label: 'I would wait and see, or search online only' },
      { value: 'unsure-action', label: 'I am not sure whom to contact' },
      { value: 'clinician', label: 'I would contact a qualified healthcare professional' },
    ],
  },
  {
    id: 'guidelines',
    prompt: 'Screening ages and intervals differ by country and personal history. How would you use that information?',
    options: [
      { value: 'copy', label: 'I might copy an interval I read online without checking locally' },
      { value: 'local', label: 'I would confirm recommendations with a clinician or official programme' },
      { value: 'learn', label: 'I want to learn more before deciding' },
    ],
  },
  {
    id: 'care-access',
    prompt: 'Do you know where to look for screening centres, vaccination programmes, or public schemes?',
    options: [
      { value: 'no', label: 'Not yet' },
      { value: 'some-access', label: 'I have a few ideas, but want clearer options' },
      { value: 'yes', label: 'Yes, I already have a plan to ask a local service' },
    ],
  },
]

export function buildGuidance(answers) {
  const cards = [
    {
      title: 'This is not a diagnosis',
      body: 'Your answers do not indicate whether you have cancer. CERVICARE does not score risk or predict disease.',
    },
  ]

  if (answers['screening-knowledge'] !== 'confident') {
    cards.push({
      title: 'Learn how screening works',
      body: 'Public health agencies recommend cervical screening because precancer often has no symptoms. Review the Screening page, then confirm the right test and interval with a clinician.',
    })
  }

  if (answers['vaccine-knowledge'] === 'unsure') {
    cards.push({
      title: 'HPV vaccination is prevention',
      body: 'Vaccines help prevent infection with high-risk HPV types. They do not treat existing cancer. A clinician can explain eligibility in your area.',
    })
  }

  if (answers['symptoms-action'] !== 'clinician') {
    cards.push({
      title: 'Symptoms deserve professional advice',
      body: 'Unusual bleeding, discharge, or pelvic pain has many possible causes. Only a qualified professional can evaluate them. Please do not rely on this website for that decision.',
    })
  }

  if (answers.guidelines !== 'local') {
    cards.push({
      title: 'Follow local clinical guidance',
      body: 'Ages, tests, and intervals published for one country may not apply to you. Use official programmes and a clinician as your source of personal recommendations.',
    })
  }

  if (answers['care-access'] !== 'yes') {
    cards.push({
      title: 'Find care and support',
      body: 'Use the Find Care page for labelled sample listings and official government scheme links. Live facility directories can be connected later through the project database.',
    })
  }

  cards.push({
    title: 'A reasonable next step',
    body: 'If you are due for screening, considering vaccination, or have symptoms, contact a qualified healthcare professional or an official public health service.',
  })

  return cards
}
