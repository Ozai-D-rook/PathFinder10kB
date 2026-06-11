import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, studentsTable, assessmentsTable, recommendationsTable } from "@workspace/db";

const router = Router();

async function requireAdmin(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
) {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const students = await db
    .select({ isAdmin: studentsTable.isAdmin })
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length || !students[0].isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

// GET /api/admin/overview
router.get("/admin/overview", requireAdmin, async (_req, res) => {
  const [students, assessmentRows, recommendationRows] = await Promise.all([
    db.select().from(studentsTable).orderBy(studentsTable.createdAt),
    db.select({ studentId: assessmentsTable.studentId }).from(assessmentsTable),
    db.select({ studentId: recommendationsTable.studentId, isSaved: recommendationsTable.isSaved }).from(recommendationsTable),
  ]);

  const assessmentCountByStudent = assessmentRows.reduce<Record<number, number>>((acc, r) => {
    acc[r.studentId] = (acc[r.studentId] ?? 0) + 1;
    return acc;
  }, {});

  const savedCountByStudent = recommendationRows.reduce<Record<number, number>>((acc, r) => {
    if (r.isSaved) acc[r.studentId] = (acc[r.studentId] ?? 0) + 1;
    return acc;
  }, {});

  const enriched = students.map((s) => ({
    ...s,
    assessmentCount: assessmentCountByStudent[s.id] ?? 0,
    savedCount: savedCountByStudent[s.id] ?? 0,
  }));

  return res.json({
    totalStudents: students.length,
    totalAssessments: assessmentRows.length,
    totalSaved: recommendationRows.filter((r) => r.isSaved).length,
    students: enriched,
  });
});

export default router;
