/**
 * Just-in-Time (JIT) Student Provisioning Middleware
 *
 * When an authenticated Clerk user hits a protected API endpoint for the first
 * time, automatically creates a minimal student record in our database using
 * the data Clerk has (name, email). This way users don't need to fill in a
 * profile before accessing the dashboard — they can do it later.
 */

import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";

export const jitProvisioning: RequestHandler = async (req, _res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return next();

    const existing = await db
      .select({ id: studentsTable.id })
      .from(studentsTable)
      .where(eq(studentsTable.clerkId, userId))
      .limit(1);

    if (existing.length) return next();

    const clerkUser = await clerkClient.users.getUser(userId);

    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") ||
      clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      "Student";

    await db.insert(studentsTable).values({
      clerkId: userId,
      fullName,
      schoolName: "",
      phoneNumber: null,
      classLevel: "SSS1",
    });
  } catch {
    // JIT provisioning failure should never block the request
  }

  next();
};
