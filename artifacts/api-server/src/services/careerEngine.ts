// Mock ML career recommendation engine
// Structured so it can be replaced with a real ML API later

export interface CareerPath {
  name: string;
  description: string;
  courses: string[];
  jambSubjects: string[];
  jobRoles: string[];
  requiredSkills: string[];
  keywords: string[];
}

export const CAREER_PATHS: CareerPath[] = [
  {
    name: "Engineering",
    description:
      "Design, build and maintain structures, machines, and systems that shape our world.",
    courses: [
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Chemical Engineering",
    ],
    jambSubjects: ["Mathematics", "Physics", "Chemistry", "English Language"],
    jobRoles: ["Civil Engineer", "Mechanical Engineer", "Project Manager", "Design Engineer"],
    requiredSkills: ["Mathematics", "Problem Solving", "Technical Drawing", "Analytical Thinking"],
    keywords: ["physics", "mathematics", "building", "construction", "machines", "technical"],
  },
  {
    name: "Computer Science/Technology",
    description:
      "Build the digital future through software, artificial intelligence, and technology systems.",
    courses: [
      "Computer Science",
      "Software Engineering",
      "Information Technology",
      "Cyber Security",
    ],
    jambSubjects: ["Mathematics", "Physics", "Chemistry or Biology", "English Language"],
    jobRoles: ["Software Developer", "Data Scientist", "Cybersecurity Analyst", "IT Consultant"],
    requiredSkills: ["Logical Thinking", "Programming", "Mathematics", "Problem Solving"],
    keywords: ["technology", "computers", "programming", "internet", "software", "digital"],
  },
  {
    name: "Medicine/Health Sciences",
    description:
      "Serve humanity by diagnosing, treating, and preventing illness across all areas of healthcare.",
    courses: ["Medicine and Surgery", "Nursing", "Pharmacy", "Medical Laboratory Science"],
    jambSubjects: ["Biology", "Chemistry", "Physics or Mathematics", "English Language"],
    jobRoles: ["Medical Doctor", "Pharmacist", "Nurse", "Laboratory Scientist"],
    requiredSkills: ["Biology", "Chemistry", "Empathy", "Attention to Detail", "Communication"],
    keywords: ["health", "medicine", "helping", "biology", "hospital", "caring", "science"],
  },
  {
    name: "Business",
    description:
      "Lead organisations, manage resources, and create value through commerce and entrepreneurship.",
    courses: ["Business Administration", "Accounting", "Economics", "Marketing"],
    jambSubjects: [
      "Mathematics",
      "Economics",
      "Government or Commerce",
      "English Language",
    ],
    jobRoles: ["Business Manager", "Accountant", "Marketing Executive", "Entrepreneur"],
    requiredSkills: ["Leadership", "Communication", "Numeracy", "Strategic Thinking"],
    keywords: ["business", "money", "management", "leadership", "economics", "trade"],
  },
  {
    name: "Law",
    description:
      "Defend rights, uphold justice, and shape the legal and governance frameworks of society.",
    courses: ["Law (LLB)", "International Law", "Criminology"],
    jambSubjects: [
      "English Language",
      "Literature in English",
      "Government or History",
      "Mathematics or CRS",
    ],
    jobRoles: ["Lawyer", "Judge", "Legal Advisor", "Human Rights Advocate"],
    requiredSkills: ["Communication", "Critical Thinking", "Research", "Persuasion"],
    keywords: ["law", "justice", "government", "rights", "debate", "argument", "social"],
  },
  {
    name: "Education",
    description:
      "Shape the minds of the next generation and drive lasting change through teaching and learning.",
    courses: ["Education (various subjects)", "Educational Management", "Guidance & Counselling"],
    jambSubjects: ["English Language", "Mathematics", "Any two relevant subjects"],
    jobRoles: ["Teacher", "School Administrator", "Education Officer", "Curriculum Developer"],
    requiredSkills: ["Communication", "Patience", "Organisation", "Empathy"],
    keywords: ["teaching", "helping", "education", "mentoring", "social", "communication"],
  },
  {
    name: "Social Sciences",
    description:
      "Understand human behaviour, society, and policy to drive positive social change.",
    courses: ["Sociology", "Psychology", "Political Science", "Social Work"],
    jambSubjects: [
      "English Language",
      "Government",
      "Economics or History",
      "Mathematics or CRS",
    ],
    jobRoles: [
      "Sociologist",
      "Psychologist",
      "Social Worker",
      "Policy Analyst",
    ],
    requiredSkills: ["Empathy", "Research", "Communication", "Critical Thinking"],
    keywords: ["people", "society", "helping", "research", "community", "behaviour"],
  },
  {
    name: "Agriculture",
    description:
      "Feed the nation and build sustainable food systems through modern agricultural science.",
    courses: [
      "Agricultural Science",
      "Animal Science",
      "Agronomy",
      "Food Science and Technology",
    ],
    jambSubjects: ["Biology", "Chemistry", "Agriculture or Physics", "English Language"],
    jobRoles: ["Agronomist", "Farm Manager", "Food Scientist", "Agricultural Extension Officer"],
    requiredSkills: ["Biology", "Practical Skills", "Problem Solving", "Environmental Awareness"],
    keywords: ["farming", "agriculture", "nature", "biology", "food", "environment"],
  },
  {
    name: "Arts and Humanities",
    description:
      "Express human experience through language, culture, history, and the creative arts.",
    courses: ["English Language", "History", "Mass Communication", "Fine Arts", "Theatre Arts"],
    jambSubjects: [
      "English Language",
      "Literature in English",
      "Government or History",
      "CRS or IRS",
    ],
    jobRoles: [
      "Journalist",
      "Author",
      "Historian",
      "Media Producer",
      "Communications Officer",
    ],
    requiredSkills: ["Creativity", "Communication", "Research", "Critical Thinking"],
    keywords: ["writing", "arts", "creativity", "language", "culture", "media", "communication"],
  },
  {
    name: "Environmental Sciences",
    description:
      "Protect and restore the natural world through environmental research, policy, and action.",
    courses: [
      "Environmental Science",
      "Geography",
      "Geology",
      "Urban and Regional Planning",
    ],
    jambSubjects: ["Geography", "Chemistry or Biology", "Physics or Mathematics", "English Language"],
    jobRoles: ["Environmental Consultant", "Geologist", "Urban Planner", "Climate Analyst"],
    requiredSkills: ["Science", "Research", "Environmental Awareness", "Analytical Thinking"],
    keywords: ["environment", "geography", "nature", "climate", "research", "planning"],
  },
];

interface AssessmentAnswers {
  [key: string]: string | string[];
}

function scoreCareer(career: CareerPath, answers: AssessmentAnswers): number {
  let score = 0;
  const allAnswers = Object.values(answers)
    .flat()
    .join(" ")
    .toLowerCase();

  for (const keyword of career.keywords) {
    if (allAnswers.includes(keyword)) {
      score += 2;
    }
  }

  // Subject matching bonus
  const subjects = answers.subjects || answers.favouriteSubjects || [];
  const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  for (const subject of subjectList) {
    const s = subject.toString().toLowerCase();
    if (career.keywords.some((k) => s.includes(k))) {
      score += 3;
    }
  }

  // Interest matching
  const interests = answers.interests || answers.interestAreas || [];
  const interestList = Array.isArray(interests) ? interests : [interests];
  for (const interest of interestList) {
    const i = interest.toString().toLowerCase();
    if (career.keywords.some((k) => i.includes(k))) {
      score += 3;
    }
  }

  return score;
}

export interface RecommendationResult {
  topCareer: CareerPath;
  alternatives: CareerPath[];
  reason: string;
}

export function recommendCareers(answers: AssessmentAnswers): RecommendationResult {
  const scored = CAREER_PATHS.map((career) => ({
    career,
    score: scoreCareer(career, answers),
  })).sort((a, b) => b.score - a.score);

  const topCareer = scored[0].career;
  const alternatives = scored.slice(1, 3).map((s) => s.career);

  const reason = `Based on your assessment answers, you show strong alignment with the skills, interests, and academic strengths that match ${topCareer.name}. Your responses suggest you have the natural curiosity and aptitude to thrive in this field.`;

  return { topCareer, alternatives, reason };
}
