import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, studentsTable, recommendationsTable } from "@workspace/db";
import { GetRecommendationParams, SaveRecommendationParams } from "@workspace/api-zod";
import { CAREER_PATHS } from "../services/careerEngine";

const router = Router();

// GET /api/recommendations
router.get("/recommendations", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.json([]);

  const recs = await db
    .select()
    .from(recommendationsTable)
    .where(
      and(
        eq(recommendationsTable.studentId, students[0].id),
        eq(recommendationsTable.isSaved, true)
      )
    );

  return res.json(recs);
});

// GET /api/recommendations/:id
router.get("/recommendations/:id", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const params = GetRecommendationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.status(404).json({ error: "Not found" });

  const recs = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.id, params.data.id))
    .limit(1);

  if (!recs.length || recs[0].studentId !== students[0].id)
    return res.status(404).json({ error: "Recommendation not found" });

  return res.json(recs[0]);
});

// POST /api/recommendations/:id/save
router.post("/recommendations/:id/save", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const params = SaveRecommendationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.status(404).json({ error: "Not found" });

  const updated = await db
    .update(recommendationsTable)
    .set({ isSaved: true })
    .where(
      and(
        eq(recommendationsTable.id, params.data.id),
        eq(recommendationsTable.studentId, students[0].id)
      )
    )
    .returning();

  if (!updated.length) return res.status(404).json({ error: "Recommendation not found" });

  return res.json(updated[0]);
});

// GET /api/careers
router.get("/careers", (_req, res) => {
  return res.json(CAREER_PATHS);
});

export default router;
