import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, studentsTable, assessmentsTable, recommendationsTable } from "@workspace/db";
import { SubmitAssessmentBody, GetAssessmentParams } from "@workspace/api-zod";
import { recommendCareers } from "../services/careerEngine";
import { generateCareerExplanation } from "../services/geminiService";

const router = Router();

// GET /api/assessments
router.get("/assessments", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.json([]);

  const assessments = await db
    .select()
    .from(assessmentsTable)
    .where(eq(assessmentsTable.studentId, students[0].id));

  return res.json(assessments);
});

// POST /api/assessments
router.post("/assessments", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const parsed = SubmitAssessmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length)
    return res.status(404).json({ error: "Student profile not found. Please complete your profile first." });

  const student = students[0];

  const [assessment] = await db
    .insert(assessmentsTable)
    .values({ studentId: student.id, answers: parsed.data.answers })
    .returning();

  const { topCareer, alternatives, reason } = await recommendCareers(
    parsed.data.answers as Record<string, string | string[]>
  );

  const aiExplanation = await generateCareerExplanation(topCareer.name, student.fullName);

  const [recommendation] = await db
    .insert(recommendationsTable)
    .values({
      studentId: student.id,
      assessmentId: assessment.id,
      topCareer: topCareer.name,
      alternativeCareers: alternatives.map((a) => a.name),
      jambSubjects: topCareer.jambSubjects,
      aiExplanation: aiExplanation.explanation,
      aiRoadmap: aiExplanation.roadmap,
      aiSkills: aiExplanation.skills,
      aiEncouragement: aiExplanation.encouragement,
      isSaved: false,
      reasonForRecommendation: reason,
      suitableCourses: topCareer.courses,
      jobRoles: topCareer.jobRoles,
      requiredSkills: topCareer.requiredSkills,
    })
    .returning();

  return res.status(201).json({ assessment, recommendation });
});

// GET /api/assessments/:id
router.get("/assessments/:id", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const params = GetAssessmentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.status(404).json({ error: "Not found" });

  const assessment = await db
    .select()
    .from(assessmentsTable)
    .where(eq(assessmentsTable.id, params.data.id))
    .limit(1);

  if (!assessment.length || assessment[0].studentId !== students[0].id)
    return res.status(404).json({ error: "Assessment not found" });

  return res.json(assessment[0]);
});

export default router;
