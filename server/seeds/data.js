const conferenceBlueprints = [
  {
    slug: "isc-2026",
    name: "International Scientific Conference 2026",
    slogan: "Research, Collaboration, and Sustainable Innovation",
    description:
      "A multidisciplinary conference focused on practical research and collaborative innovation.",
    startDate: new Date("2026-11-12T08:00:00.000Z"),
    endDate: new Date("2026-11-14T17:30:00.000Z"),
    venue: "University Central Auditorium",
    city: "Algiers",
    country: "Algeria",
  },
  {
    slug: "aicc-2026",
    name: "Applied Intelligence and Cloud Conference 2026",
    slogan: "Scalable Intelligence for Real Systems",
    description:
      "Bringing together experts in AI, cloud architecture, and software systems engineering.",
    startDate: new Date("2026-09-10T08:30:00.000Z"),
    endDate: new Date("2026-09-12T17:00:00.000Z"),
    venue: "Digital Innovation Center",
    city: "Oran",
    country: "Algeria",
  },
  {
    slug: "dsa-2026",
    name: "Data Systems and Analytics Forum 2026",
    slogan: "From Data to Decisions",
    description:
      "A forum on data pipelines, analytics governance, and decision-support in modern organizations.",
    startDate: new Date("2026-10-07T09:00:00.000Z"),
    endDate: new Date("2026-10-09T16:45:00.000Z"),
    venue: "Science and Technology Hub",
    city: "Constantine",
    country: "Algeria",
  },
  {
    slug: "set-2026",
    name: "Smart Education Technologies Summit 2026",
    slogan: "Future-Ready Learning Ecosystems",
    description:
      "Discussing learning platforms, accessibility, and technology-enabled pedagogy.",
    startDate: new Date("2026-05-21T08:30:00.000Z"),
    endDate: new Date("2026-05-23T17:15:00.000Z"),
    venue: "Innovation Campus Hall",
    city: "Tlemcen",
    country: "Algeria",
  },
  {
    slug: "gsn-2026",
    name: "Green Systems and Networks Conference 2026",
    slogan: "Engineering Sustainable Digital Infrastructure",
    description:
      "A conference dedicated to energy-aware systems, resilient networks, and sustainability practices.",
    startDate: new Date("2026-06-18T08:45:00.000Z"),
    endDate: new Date("2026-06-20T17:00:00.000Z"),
    venue: "EcoTech Convention Center",
    city: "Annaba",
    country: "Algeria",
  },
  {
    slug: "rse-2026",
    name: "Research Software Engineering Congress 2026",
    slogan: "Reliable Tools for Reproducible Science",
    description:
      "Covering best practices in scientific software quality, reproducibility, and collaboration.",
    startDate: new Date("2026-07-15T08:00:00.000Z"),
    endDate: new Date("2026-07-17T16:30:00.000Z"),
    venue: "National Polytechnic Hall",
    city: "Sidi Bel Abbes",
    country: "Algeria",
  },
  {
    slug: "cis-2026",
    name: "Cybersecurity and Information Safety Expo 2026",
    slogan: "Trust, Privacy, and Secure Transformation",
    description:
      "Focused on applied security, secure-by-design systems, and privacy engineering.",
    startDate: new Date("2026-12-03T09:00:00.000Z"),
    endDate: new Date("2026-12-05T17:00:00.000Z"),
    venue: "Secure Tech Arena",
    city: "Blida",
    country: "Algeria",
  },
];

const themeTemplates = [
  {
    key: "ai",
    code: "AI",
    label: "Artificial Intelligence",
    description:
      "Applied AI systems, responsible automation, and intelligent services.",
    displayOrder: 1,
  },
  {
    key: "data",
    code: "DATA",
    label: "Data Science",
    description:
      "Data engineering, analytics workflows, and evidence-driven decision models.",
    displayOrder: 2,
  },
  {
    key: "web",
    code: "WEB",
    label: "Web Engineering",
    description:
      "Modern web architectures, user experience, and distributed application delivery.",
    displayOrder: 3,
  },
  {
    key: "cyber",
    code: "CYBER",
    label: "Cybersecurity",
    description:
      "Security practices, threat mitigation, and privacy-preserving systems.",
    displayOrder: 4,
  },
];

const speakerTemplates = [
  {
    key: "speaker-1",
    fullName: "Dr. Sara Khelifi",
    academicTitle: "Associate Professor",
    affiliation: "National School of AI",
    country: "Algeria",
    topic: "Designing Responsible AI Services",
  },
  {
    key: "speaker-2",
    fullName: "Prof. Karim Ziani",
    academicTitle: "Professor",
    affiliation: "Institute of Data and Systems",
    country: "Algeria",
    topic: "Practical Data Governance at Scale",
  },
  {
    key: "speaker-3",
    fullName: "Dr. Lina Bensalem",
    academicTitle: "Senior Lecturer",
    affiliation: "School of Web and Media Technologies",
    country: "Tunisia",
    topic: "Building Resilient User-Centered Platforms",
  },
  {
    key: "speaker-4",
    fullName: "Prof. Yacine Meziane",
    academicTitle: "Professor",
    affiliation: "Cyber Defense Research Lab",
    country: "Algeria",
    topic: "Security by Design for Critical Systems",
  },
];

const participantTemplates = [
  {
    fullName: "Amina Belhadj",
    phone: "+213555000101",
    affiliation: "USTHB",
    country: "Algeria",
    participantType: "STUDENT",
  },
  {
    fullName: "Youssef Mansouri",
    phone: "+213555000202",
    affiliation: "University of Oran",
    country: "Algeria",
    participantType: "RESEARCHER",
  },
  {
    fullName: "Nadia Trabelsi",
    phone: "+216555000303",
    affiliation: "Tunis Institute of Technology",
    country: "Tunisia",
    participantType: "PROFESSOR",
  },
  {
    fullName: "Adel Cherif",
    phone: "+213555000404",
    affiliation: "Algiers Tech Park",
    country: "Algeria",
    participantType: "INDUSTRY",
  },
];

export const conferenceSeeds = conferenceBlueprints.map((conference, index) => {
  const conferenceOrdinal = index + 1;

  const themeSeeds = themeTemplates.map((themeTemplate) => ({
    ...themeTemplate,
  }));

  const speakerSeeds = speakerTemplates.map(
    (speakerTemplate, speakerIndex) => ({
      ...speakerTemplate,
      biography: `${speakerTemplate.fullName} contributes practical and research insights to conference ${conferenceOrdinal}.`,
      photoUrl: "",
      email: `${conference.slug}.speaker${speakerIndex + 1}@portal.test`,
    }),
  );

  const participantSeeds = participantTemplates.map(
    (participantTemplate, participantIndex) => ({
      ...participantTemplate,
      email: `${conference.slug}.participant${participantIndex + 1}@portal.test`,
    }),
  );

  const registrationSeeds = participantSeeds.map(
    (participantSeed, participantIndex) => ({
      participantEmail: participantSeed.email,
      registrationStatus: "PENDING",
      attendanceConfirmed: false,
      notes: "Pending admin validation.",
      registeredAt: new Date(
        2026,
        (index + participantIndex) % 12,
        5 + participantIndex,
        10,
        0,
        0,
      ),
    }),
  );

  const sessionSeeds = [
    {
      sessionTitle: `${conference.name} Keynote Session`,
      themeKey: "ai",
      speakerKey: "speaker-1",
      startsAt: new Date(conference.startDate.getTime() + 60 * 60 * 1000),
      endsAt: new Date(conference.startDate.getTime() + 2 * 60 * 60 * 1000),
      room: "Main Hall",
      description:
        "Opening keynote introducing conference objectives and flagship research topics.",
    },
    {
      sessionTitle: `${conference.name} Data Track Session`,
      themeKey: "data",
      speakerKey: "speaker-2",
      startsAt: new Date(conference.startDate.getTime() + 3 * 60 * 60 * 1000),
      endsAt: new Date(conference.startDate.getTime() + 4 * 60 * 60 * 1000),
      room: "Room B1",
      description:
        "Applied data science case studies and practical implementation lessons.",
    },
    {
      sessionTitle: `${conference.name} Web Engineering Session`,
      themeKey: "web",
      speakerKey: "speaker-3",
      startsAt: new Date(conference.startDate.getTime() + 5 * 60 * 60 * 1000),
      endsAt: new Date(conference.startDate.getTime() + 6 * 60 * 60 * 1000),
      room: "Room C2",
      description:
        "Scalable frontend and backend architectures with UX-first decisions.",
    },
    {
      sessionTitle: `${conference.name} Security Session`,
      themeKey: "cyber",
      speakerKey: "speaker-4",
      startsAt: new Date(conference.startDate.getTime() + 7 * 60 * 60 * 1000),
      endsAt: new Date(conference.startDate.getTime() + 8 * 60 * 60 * 1000),
      room: "Room D3",
      description:
        "Threat modeling, secure architecture, and operational defense strategies.",
    },
  ];

  const submissionSeeds = [
    {
      paperTitle: `${conference.name}: Explainable AI Workflows`,
      themeKey: "ai",
      abstract:
        "A pending submission discussing explainability patterns and governance controls in applied AI systems.",
      institution: participantSeeds[0].affiliation,
      country: participantSeeds[0].country,
      status: "PENDING",
      reviewComment: "Awaiting reviewer assignment.",
      pdfUrl: "",
      submittedAt: new Date(
        conference.startDate.getTime() - 20 * 24 * 60 * 60 * 1000,
      ),
      authors: [
        {
          fullName: participantSeeds[0].fullName,
          email: participantSeeds[0].email,
          affiliation: participantSeeds[0].affiliation,
          country: participantSeeds[0].country,
          authorOrder: 1,
          isCorresponding: true,
        },
        {
          fullName: participantSeeds[1].fullName,
          email: participantSeeds[1].email,
          affiliation: participantSeeds[1].affiliation,
          country: participantSeeds[1].country,
          authorOrder: 2,
          isCorresponding: false,
        },
      ],
    },
    {
      paperTitle: `${conference.name}: Analytics for Decision Support`,
      themeKey: "data",
      abstract:
        "A pending paper on data quality pipelines and explainable analytical decision support.",
      institution: participantSeeds[1].affiliation,
      country: participantSeeds[1].country,
      status: "PENDING",
      reviewComment: "Awaiting reviewer assignment.",
      pdfUrl: "",
      submittedAt: new Date(
        conference.startDate.getTime() - 19 * 24 * 60 * 60 * 1000,
      ),
      authors: [
        {
          fullName: participantSeeds[1].fullName,
          email: participantSeeds[1].email,
          affiliation: participantSeeds[1].affiliation,
          country: participantSeeds[1].country,
          authorOrder: 1,
          isCorresponding: true,
        },
        {
          fullName: participantSeeds[2].fullName,
          email: participantSeeds[2].email,
          affiliation: participantSeeds[2].affiliation,
          country: participantSeeds[2].country,
          authorOrder: 2,
          isCorresponding: false,
        },
      ],
    },
    {
      paperTitle: `${conference.name}: UX Patterns for Web Platforms`,
      themeKey: "web",
      abstract:
        "A pending submission exploring practical UX and architecture patterns for web delivery.",
      institution: participantSeeds[2].affiliation,
      country: participantSeeds[2].country,
      status: "PENDING",
      reviewComment: "Awaiting reviewer assignment.",
      pdfUrl: "",
      submittedAt: new Date(
        conference.startDate.getTime() - 18 * 24 * 60 * 60 * 1000,
      ),
      authors: [
        {
          fullName: participantSeeds[2].fullName,
          email: participantSeeds[2].email,
          affiliation: participantSeeds[2].affiliation,
          country: participantSeeds[2].country,
          authorOrder: 1,
          isCorresponding: true,
        },
        {
          fullName: participantSeeds[3].fullName,
          email: participantSeeds[3].email,
          affiliation: participantSeeds[3].affiliation,
          country: participantSeeds[3].country,
          authorOrder: 2,
          isCorresponding: false,
        },
      ],
    },
    {
      paperTitle: `${conference.name}: Security by Default`,
      themeKey: "cyber",
      abstract:
        "A pending submission on secure-by-design implementation and risk mitigation in distributed systems.",
      institution: participantSeeds[3].affiliation,
      country: participantSeeds[3].country,
      status: "PENDING",
      reviewComment: "Awaiting reviewer assignment.",
      pdfUrl: "",
      submittedAt: new Date(
        conference.startDate.getTime() - 17 * 24 * 60 * 60 * 1000,
      ),
      authors: [
        {
          fullName: participantSeeds[3].fullName,
          email: participantSeeds[3].email,
          affiliation: participantSeeds[3].affiliation,
          country: participantSeeds[3].country,
          authorOrder: 1,
          isCorresponding: true,
        },
        {
          fullName: participantSeeds[0].fullName,
          email: participantSeeds[0].email,
          affiliation: participantSeeds[0].affiliation,
          country: participantSeeds[0].country,
          authorOrder: 2,
          isCorresponding: false,
        },
      ],
    },
  ];

  return {
    conference: {
      ...conference,
      contactEmail: `${conference.slug}@portal.test`,
      isActive: conferenceOrdinal === 1,
    },
    themeSeeds,
    speakerSeeds,
    sessionSeeds,
    participantSeeds,
    registrationSeeds,
    submissionSeeds,
    certificateSeeds: [],
  };
});
