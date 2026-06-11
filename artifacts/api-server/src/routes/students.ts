import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, studentsTable, assessmentsTable, recommendationsTable } from "@workspace/db";
import { CreateStudentProfileBody } from "@workspace/api-zod";

const router = Router();

// GET /api/students/profile
router.get("/students/profile", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!student.length) return res.status(404).json({ error: "Profile not found" });
  return res.json(student[0]);
});

// POST /api/students/profile
router.post("/students/profile", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const parsed = CreateStudentProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const existing = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (existing.length) {
    const updated = await db
      .update(studentsTable)
      .set({
        fullName: parsed.data.fullName,
        schoolName: parsed.data.schoolName,
        phoneNumber: parsed.data.phoneNumber ?? null,
        classLevel: parsed.data.classLevel,
      })
      .where(eq(studentsTable.userId, req.userId))
      .returning();
    return res.status(201).json(updated[0]);
  }

  const created = await db
    .insert(studentsTable)
    .values({
      userId: req.userId,
      fullName: parsed.data.fullName,
      schoolName: parsed.data.schoolName,
      phoneNumber: parsed.data.phoneNumber ?? null,
      classLevel: parsed.data.classLevel,
    })
    .returning();

  return res.status(201).json(created[0]);
});

// GET /api/students/dashboard
router.get("/students/dashboard", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  const student = students[0] ?? null;

  if (!student) {
    return res.json({
      student: null,
      assessmentCount: 0,
      savedRecommendationsCount: 0,
      latestRecommendation: null,
      hasCompletedAssessment: false,
    });
  }

  const [assessments, savedRecs] = await Promise.all([
    db.select().from(assessmentsTable).where(eq(assessmentsTable.studentId, student.id)),
    db.select().from(recommendationsTable).where(eq(recommendationsTable.studentId, student.id)),
  ]);

  const saved = savedRecs.filter((r) => r.isSaved);
  const latest =
    savedRecs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] ?? null;

  return res.json({
    student,
    assessmentCount: assessments.length,
    savedRecommendationsCount: saved.length,
    latestRecommendation: latest,
    hasCompletedAssessment: assessments.length > 0,
  });
});

export default router;
