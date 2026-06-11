import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";

export const jitProvisioning: RequestHandler = async (req, _res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return next();

    const existing = await db
      .select({ id: studentsTable.id })
      .from(studentsTable)
      .where(eq(studentsTable.userId, userId))
      .limit(1);

    if (existing.length) return next();

    await db.insert(studentsTable).values({
      userId,
      fullName: req.userName ?? "Student",
      schoolName: "",
      phoneNumber: null,
      classLevel: "SSS1",
    });
  } catch {
    // Never block the request
  }

  next();
};
