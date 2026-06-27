import { GoogleGenAI } from "@google/genai";

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
    courses: ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering"],
    jambSubjects: ["Mathematics", "Physics", "Chemistry", "English Language"],
    jobRoles: ["Civil Engineer", "Mechanical Engineer", "Project Manager", "Design Engineer"],
    requiredSkills: ["Mathematics", "Problem Solving", "Technical Drawing", "Analytical Thinking"],
    keywords: ["physics", "mathematics", "building", "construction", "machines", "technical"],
  },
  {
    name: "Computer Science/Technology",
    description:
      "Build the digital future through software, artificial intelligence, and technology systems.",
    courses: ["Computer Science", "Software Engineering", "Information Technology", "Cyber Security"],
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
    jambSubjects: ["Mathematics", "Economics", "Government or Commerce", "English Language"],
    jobRoles: ["Business Manager", "Accountant", "Marketing Executive", "Entrepreneur"],
    requiredSkills: ["Leadership", "Communication", "Numeracy", "Strategic Thinking"],
    keywords: ["business", "money", "management", "leadership", "economics", "trade"],
  },
  {
    name: "Law",
    description:
      "Defend rights, uphold justice, and shape the legal and governance frameworks of society.",
    courses: ["Law (LLB)", "International Law", "Criminology"],
    jambSubjects: ["English Language", "Literature in English", "Government or History", "Mathematics or CRS"],
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
    jambSubjects: ["English Language", "Government", "Economics or History", "Mathematics or CRS"],
    jobRoles: ["Sociologist", "Psychologist", "Social Worker", "Policy Analyst"],
    requiredSkills: ["Empathy", "Research", "Communication", "Critical Thinking"],
    keywords: ["people", "society", "helping", "research", "community", "behaviour"],
  },
  {
    name: "Agriculture",
    description:
      "Feed the nation and build sustainable food systems through modern agricultural science.",
    courses: ["Agricultural Science", "Animal Science", "Agronomy", "Food Science and Technology"],
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
    jambSubjects: ["English Language", "Literature in English", "Government or History", "CRS or IRS"],
    jobRoles: ["Journalist", "Author", "Historian", "Media Producer", "Communications Officer"],
    requiredSkills: ["Creativity", "Communication", "Research", "Critical Thinking"],
    keywords: ["writing", "arts", "creativity", "language", "culture", "media", "communication"],
  },
  {
    name: "Environmental Sciences",
    description:
      "Protect and restore the natural world through environmental research, policy, and action.",
    courses: ["Environmental Science", "Geography", "Geology", "Urban and Regional Planning"],
    jambSubjects: ["Geography", "Chemistry or Biology", "Physics or Mathematics", "English Language"],
    jobRoles: ["Environmental Consultant", "Geologist", "Urban Planner", "Climate Analyst"],
    requiredSkills: ["Science", "Research", "Environmental Awareness", "Analytical Thinking"],
    keywords: ["environment", "geography", "nature", "climate", "research", "planning"],
  },
];

export interface RecommendationResult {
  topCareer: CareerPath;
  alternatives: CareerPath[];
  reason: string;
}

interface AssessmentAnswers {
  [key: string]: string | string[];
}

// ---------------------------------------------------------------------------
// Fallback: rule-based keyword scoring (used when Gemini is unavailable)
// ---------------------------------------------------------------------------
function scoreCareer(career: CareerPath, answers: AssessmentAnswers): number {
  let score = 0;
  const allAnswers = Object.values(answers).flat().join(" ").toLowerCase();

  for (const keyword of career.keywords) {
    if (allAnswers.includes(keyword)) score += 2;
  }

  const subjects = answers.subjects ?? answers.favouriteSubjects ?? [];
  const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  for (const subject of subjectList) {
    const s = subject.toString().toLowerCase();
    if (career.keywords.some((k) => s.includes(k))) score += 3;
  }

  const interests = answers.interests ?? answers.interestAreas ?? [];
  const interestList = Array.isArray(interests) ? interests : [interests];
  for (const interest of interestList) {
    const i = interest.toString().toLowerCase();
    if (career.keywords.some((k) => i.includes(k))) score += 3;
  }

  return score;
}

function fallbackRecommend(answers: AssessmentAnswers): RecommendationResult {
  const scored = CAREER_PATHS.map((career) => ({
    career,
    score: scoreCareer(career, answers),
  })).sort((a, b) => b.score - a.score);

  return {
    topCareer: scored[0].career,
    alternatives: scored.slice(1, 3).map((s) => s.career),
    reason: `Based on your assessment answers, your interests and strengths align well with ${scored[0].career.name}. Your responses suggest the natural aptitude and curiosity needed to thrive in this field.`,
  };
}

// ---------------------------------------------------------------------------
// Primary: Render ML Model recommendation
// ---------------------------------------------------------------------------
function mapAnswersToMLFeatures(answers: AssessmentAnswers) {
  const getVal = (field: string): string => {
    const val = answers[field];
    if (Array.isArray(val)) return val[0]?.toString() || "";
    return val?.toString() || "";
  };

  let math_score = 60;
  if (getVal("subjects") === "mathematics") math_score += 20;
  if (getVal("academicStrengths") === "maths") math_score += 20;

  let english_score = 65;
  if (getVal("subjects") === "english") english_score += 15;
  if (getVal("academicStrengths") === "languages") english_score += 15;
  if (getVal("communication") === "very_confident") english_score += 5;

  let biology_score = 60;
  if (getVal("subjects") === "biology") biology_score += 20;
  if (getVal("academicStrengths") === "sciences") biology_score += 10;
  if (getVal("healthInterest") === "very_high") biology_score += 10;

  let chemistry_score = 60;
  if (getVal("subjects") === "physics") chemistry_score += 10;
  if (getVal("academicStrengths") === "sciences") chemistry_score += 20;
  if (getVal("healthInterest") === "very_high") chemistry_score += 10;

  let physics_score = 60;
  if (getVal("subjects") === "physics") physics_score += 20;
  if (getVal("academicStrengths") === "sciences") physics_score += 20;

  let economics_score = 60;
  if (getVal("subjects") === "economics") economics_score += 20;
  if (getVal("academicStrengths") === "commercial") economics_score += 20;

  let tech_interest = 50;
  const tech = getVal("technologyInterest");
  if (tech === "very_high") tech_interest = 95;
  else if (tech === "high") tech_interest = 80;
  else if (tech === "moderate" || tech === "medical_tech" || tech === "agricultural_tech") tech_interest = 60;
  else if (tech === "low") tech_interest = 20;
  if (getVal("interests") === "technology") tech_interest = Math.max(tech_interest, 90);

  let health_interest = 50;
  const health = getVal("healthInterest");
  if (health === "very_high") health_interest = 95;
  else if (health === "high") health_interest = 80;
  else if (health === "moderate" || health === "pharmacy" || health === "nursing") health_interest = 60;
  else if (health === "low") health_interest = 20;
  if (getVal("interests") === "health") health_interest = Math.max(health_interest, 90);

  let business_interest = 50;
  const biz = getVal("businessInterest");
  if (biz === "very_high") business_interest = 95;
  else if (biz === "high") business_interest = 80;
  else if (biz === "moderate" || biz === "social_enterprise" || biz === "agriculture_business") business_interest = 60;
  else if (biz === "low") business_interest = 20;
  if (getVal("interests") === "business") business_interest = Math.max(business_interest, 90);

  let arts_interest = 50;
  if (getVal("interests") === "writing") arts_interest = 85;
  if (getVal("academicStrengths") === "arts") arts_interest = Math.max(arts_interest, 80);

  let social_help_interest = 50;
  const soc = getVal("socialInterest");
  if (soc === "very_high") social_help_interest = 95;
  else if (soc === "high") social_help_interest = 80;
  else if (soc === "moderate" || soc === "teaching" || soc === "policy") social_help_interest = 65;
  else if (soc === "low") social_help_interest = 25;

  let analytical_thinking = 55;
  if (getVal("personality") === "analytical") analytical_thinking = 85;
  if (getVal("skills") === "numbers") analytical_thinking = Math.max(analytical_thinking, 80);

  let problem_solving = 60;
  const ps = getVal("problemSolving");
  if (ps === "calculate" || ps === "experiment" || ps === "research") problem_solving = 85;
  else if (ps === "practical" || ps === "creative" || ps === "discuss") problem_solving = 75;

  let creativity = 50;
  const creat = getVal("creativity");
  if (creat === "very_creative" || creat === "technical" || creat === "literary") creativity = 90;
  else if (creat === "moderately") creativity = 75;
  else if (creat === "practical") creativity = 50;
  else if (creat === "not_sure") creativity = 40;
  if (getVal("personality") === "creative") creativity = Math.max(creativity, 85);

  let leadership = 55;
  if (getVal("skills") === "leadership") leadership = 85;
  if (getVal("personality") === "ambitious") leadership = Math.max(leadership, 75);

  let teamwork = 60;
  if (getVal("problemSolving") === "discuss") teamwork = 85;
  if (getVal("personality") === "social") teamwork = Math.max(teamwork, 80);

  let communication = 60;
  const comm = getVal("communication");
  if (comm === "very_confident") communication = 95;
  else if (comm === "confident") communication = 80;
  else if (comm === "moderate" || comm === "one_on_one") communication = 65;
  else if (comm === "prefer_writing" || comm === "working_on_it") communication = 50;
  if (getVal("skills") === "communication") communication = Math.max(communication, 85);

  let decision_making = 60;
  if (getVal("problemSolving") === "research" || getVal("personality") === "analytical") decision_making = 80;

  const stem_score = Math.round((math_score + physics_score + chemistry_score + tech_interest) / 4);
  const health_score = Math.round((biology_score + chemistry_score + health_interest) / 3);
  const business_score = Math.round((economics_score + math_score + business_interest) / 3);

  return {
    math_score,
    english_score,
    biology_score,
    chemistry_score,
    physics_score,
    economics_score,
    tech_interest,
    health_interest,
    business_interest,
    arts_interest,
    social_help_interest,
    analytical_thinking,
    problem_solving,
    creativity,
    leadership,
    teamwork,
    communication,
    decision_making,
    stem_score,
    health_score,
    business_score
  };
}

async function renderModelRecommend(answers: AssessmentAnswers): Promise<RecommendationResult | null> {
  const modelUrl = process.env.RENDER_ML_API_URL || "https://pathfinder-1-ck5b.onrender.com/predict";
  const payload = mapAnswersToMLFeatures(answers);

  try {
    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ML model returned status ${response.status}`);
    }

    const data = await response.json();
    const predictedRole = data.recommended_career;
    if (!predictedRole) return null;

    // Matching logic
    // 1. Direct match with name (case-insensitive)
    let topCareer = CAREER_PATHS.find(
      (c) => c.name.toLowerCase() === predictedRole.toLowerCase()
    );

    // 2. Match with jobRoles (case-insensitive)
    if (!topCareer) {
      topCareer = CAREER_PATHS.find((c) =>
        c.jobRoles.some((role) => role.toLowerCase() === predictedRole.toLowerCase())
      );
    }

    // 3. Match with keywords (case-insensitive)
    if (!topCareer) {
      topCareer = CAREER_PATHS.find((c) =>
        c.keywords.some((kw) => predictedRole.toLowerCase().includes(kw.toLowerCase()))
      );
    }

    // Fallback to rules-based top career if no matching category was found
    const fallback = fallbackRecommend(answers);
    if (!topCareer) {
      topCareer = fallback.topCareer;
    }

    // Calculate alternatives from fallback engine, excluding the matched top career
    const alternatives = [fallback.topCareer, ...fallback.alternatives]
      .filter((c) => c.name !== topCareer!.name)
      .slice(0, 2);

    const reason = `Based on your assessment answers, our machine learning model recommends a career path in ${topCareer.name} (closest match to your predicted role: '${predictedRole}'). Your responses align with the interests, skills, and strengths typical for this field.`;

    return {
      topCareer,
      alternatives,
      reason,
    };
  } catch (error) {
    console.error("Render ML Model prediction failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Secondary: Gemini AI-powered recommendation
// ---------------------------------------------------------------------------
const CAREER_NAMES = CAREER_PATHS.map((c) => c.name);

async function geminiRecommend(answers: AssessmentAnswers): Promise<RecommendationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  const answersText = Object.entries(answers)
    .map(([q, a]) => `${q}: ${Array.isArray(a) ? a.join(", ") : a}`)
    .join("\n");

  const prompt = `You are an expert Nigerian career guidance counselor for secondary school students (SSS1–SSS3 and JAMBites).

A student has completed a career assessment. Here are their answers:
${answersText}

Available career paths to choose from (you MUST pick from this exact list):
${CAREER_NAMES.map((n, i) => `${i + 1}. ${n}`).join("\n")}

Based on the student's answers, determine:
1. The single best career match (topCareer) — must be the exact name from the list above
2. Two alternative careers (alternatives) — must be exact names from the list above, different from topCareer
3. A concise, warm reason (2-3 sentences) explaining why the top career fits this student specifically, referencing their actual answers

Respond with JSON only:
{
  "topCareer": "<exact career name>",
  "alternatives": ["<career name>", "<career name>"],
  "reason": "<2-3 sentence personalised explanation>"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text ?? "{}");

    const topCareer = CAREER_PATHS.find((c) => c.name === parsed.topCareer);
    const alternatives = (parsed.alternatives as string[] | undefined)
      ?.map((name: string) => CAREER_PATHS.find((c) => c.name === name))
      .filter((c): c is CareerPath => Boolean(c)) ?? [];

    if (!topCareer) return null;

    return {
      topCareer,
      alternatives: alternatives.slice(0, 2),
      reason: parsed.reason ?? "",
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API — tries Render ML first, falls back to Gemini, then rules-based
// ---------------------------------------------------------------------------
export async function recommendCareers(answers: AssessmentAnswers): Promise<RecommendationResult> {
  const mlResult = await renderModelRecommend(answers);
  if (mlResult) return mlResult;

  const aiResult = await geminiRecommend(answers);
  return aiResult ?? fallbackRecommend(answers);
}
