export const conferenceSeed = {
  name: "International Scientific Conference 2026",
  slogan: "Research, Collaboration, and Sustainable Innovation",
  description:
    "Demo seed conference dataset for agenda, registration, submission tracking, and certificate workflows.",
  startDate: new Date("2026-11-12T08:00:00.000Z"),
  endDate: new Date("2026-11-14T17:30:00.000Z"),
  venue: "University Central Auditorium",
  city: "Algiers",
  country: "Algeria",
  contactEmail: "seed-conference@portal.test",
  isActive: true,
};

export const themeSeeds = [
  {
    key: "ai",
    code: "AI",
    label: "Artificial Intelligence",
    description: "Applied AI, responsible systems, and intelligent services.",
    displayOrder: 1,
  },
  {
    key: "data",
    code: "DATA",
    label: "Data Science and Analytics",
    description: "Data pipelines, predictive analytics, and evidence-driven research.",
    displayOrder: 2,
  },
  {
    key: "energy",
    code: "ENERGY",
    label: "Sustainable Energy Systems",
    description: "Smart energy, renewable systems, and sustainable infrastructure.",
    displayOrder: 3,
  },
];

export const speakerSeeds = [
  {
    key: "leila",
    fullName: "Prof. Leila Benkacem",
    academicTitle: "Professor",
    affiliation: "National School of Computer Science",
    country: "Algeria",
    topic: "Ethical AI for Academic Platforms",
    biography:
      "Researcher focused on trustworthy machine learning, governance, and digital higher education systems.",
    photoUrl: "https://images.portal.test/speakers/leila-benkacem.jpg",
    email: "leila.benkacem@portal.test",
  },
  {
    key: "omar",
    fullName: "Dr. Omar Rahmani",
    academicTitle: "Associate Professor",
    affiliation: "Institute of Applied Data Science",
    country: "Tunisia",
    topic: "Healthcare Analytics and Decision Support",
    biography:
      "Works on applied data science for public health, forecasting, and decision-support systems.",
    photoUrl: "https://images.portal.test/speakers/omar-rahmani.jpg",
    email: "omar.rahmani@portal.test",
  },
];

export const sessionSeeds = [
  {
    sessionTitle: "Opening Keynote: Ethical AI for Academic Platforms",
    themeKey: "ai",
    speakerKey: "leila",
    startsAt: new Date("2026-11-12T09:00:00.000Z"),
    endsAt: new Date("2026-11-12T10:00:00.000Z"),
    room: "Main Hall",
    description: "Keynote session on trustworthy AI design in university-facing digital services.",
  },
  {
    sessionTitle: "Healthcare Analytics and Decision Support",
    themeKey: "data",
    speakerKey: "omar",
    startsAt: new Date("2026-11-12T10:30:00.000Z"),
    endsAt: new Date("2026-11-12T11:30:00.000Z"),
    room: "Room B2",
    description: "Case studies on predictive analytics and clinical decision support pipelines.",
  },
  {
    sessionTitle: "Renewable Grid Planning Roundtable",
    themeKey: "energy",
    speakerKey: null,
    startsAt: new Date("2026-11-13T13:30:00.000Z"),
    endsAt: new Date("2026-11-13T14:30:00.000Z"),
    room: "Room C1",
    description: "Panel slot reserved for the sustainable energy track before a speaker is assigned.",
  },
  {
    sessionTitle: "Applied AI Poster Walkthrough",
    themeKey: "ai",
    speakerKey: "leila",
    startsAt: new Date("2026-11-14T11:00:00.000Z"),
    endsAt: new Date("2026-11-14T12:00:00.000Z"),
    room: "Innovation Lab",
    description: "Guided overview of selected poster contributions in the AI track.",
  },
];

export const participantSeeds = [
  {
    fullName: "Amina Belhadj",
    email: "amina.belhadj@portal.test",
    phone: "+213555000101",
    affiliation: "USTHB",
    country: "Algeria",
    participantType: "STUDENT",
  },
  {
    fullName: "Youssef Mansouri",
    email: "youssef.mansouri@portal.test",
    phone: "+213555000202",
    affiliation: "University of Oran",
    country: "Algeria",
    participantType: "RESEARCHER",
  },
  {
    fullName: "Nadia Trabelsi",
    email: "nadia.trabelsi@portal.test",
    phone: "+216555000303",
    affiliation: "Tunis Institute of Technology",
    country: "Tunisia",
    participantType: "PROFESSOR",
  },
];

export const registrationSeeds = [
  {
    participantEmail: "amina.belhadj@portal.test",
    registrationStatus: "REGISTERED",
    attendanceConfirmed: false,
    notes: "Attending as a graduate student presenter.",
    registeredAt: new Date("2026-10-25T09:15:00.000Z"),
  },
  {
    participantEmail: "youssef.mansouri@portal.test",
    registrationStatus: "CONFIRMED",
    attendanceConfirmed: true,
    notes: "Confirmed for conference attendance and certificate generation.",
    registeredAt: new Date("2026-10-26T10:45:00.000Z"),
  },
  {
    participantEmail: "nadia.trabelsi@portal.test",
    registrationStatus: "CONFIRMED",
    attendanceConfirmed: true,
    notes: "Invited academic participant with confirmed attendance.",
    registeredAt: new Date("2026-10-27T14:20:00.000Z"),
  },
];

export const submissionSeeds = [
  {
    paperTitle: "A Practical Framework for Explainable Academic AI Assistants",
    themeKey: "ai",
    abstract:
      "This paper proposes an explainable AI framework for university-facing assistant systems with emphasis on transparency, trust, and operational accountability.",
    institution: "USTHB",
    country: "Algeria",
    status: "UNDER_REVIEW",
    reviewComment: "Assigned to reviewers for methodological assessment.",
    pdfUrl: "https://files.portal.test/submissions/explainable-academic-ai.pdf",
    submittedAt: new Date("2026-10-20T08:30:00.000Z"),
    authors: [
      {
        fullName: "Amina Belhadj",
        email: "amina.belhadj@portal.test",
        affiliation: "USTHB",
        country: "Algeria",
        authorOrder: 1,
        isCorresponding: true,
      },
      {
        fullName: "Samir Kaci",
        email: "samir.kaci@portal.test",
        affiliation: "USTHB",
        country: "Algeria",
        authorOrder: 2,
        isCorresponding: false,
      },
    ],
  },
  {
    paperTitle: "Predictive Models for Hospital Resource Allocation",
    themeKey: "data",
    abstract:
      "The study evaluates forecasting techniques for hospital demand planning and resource allocation using interpretable feature engineering and validation pipelines.",
    institution: "University of Oran",
    country: "Algeria",
    status: "ACCEPTED",
    reviewComment: "Accepted after minor revisions.",
    pdfUrl: "https://files.portal.test/submissions/hospital-resource-allocation.pdf",
    submittedAt: new Date("2026-10-21T11:00:00.000Z"),
    authors: [
      {
        fullName: "Youssef Mansouri",
        email: "youssef.mansouri@portal.test",
        affiliation: "University of Oran",
        country: "Algeria",
        authorOrder: 1,
        isCorresponding: true,
      },
      {
        fullName: "Nadia Trabelsi",
        email: "nadia.trabelsi@portal.test",
        affiliation: "Tunis Institute of Technology",
        country: "Tunisia",
        authorOrder: 2,
        isCorresponding: false,
      },
    ],
  },
];

export const certificateSeeds = [
  {
    participantEmail: "youssef.mansouri@portal.test",
    certificateType: "PARTICIPANT",
    issueDate: new Date("2026-11-14T15:45:00.000Z"),
    status: "ISSUED",
    pdfUrl: "https://files.portal.test/certificates/youssef-mansouri.pdf",
  },
  {
    participantEmail: "nadia.trabelsi@portal.test",
    certificateType: "PARTICIPANT",
    issueDate: new Date("2026-11-14T16:00:00.000Z"),
    status: "ISSUED",
    pdfUrl: "https://files.portal.test/certificates/nadia-trabelsi.pdf",
  },
];
