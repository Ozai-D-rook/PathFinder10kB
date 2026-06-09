import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { assessmentsTable } from "./assessments";

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => studentsTable.id),
  assessmentId: integer("assessment_id")
    .notNull()
    .references(() => assessmentsTable.id),
  topCareer: text("top_career").notNull(),
  alternativeCareers: jsonb("alternative_careers").notNull().$type<string[]>(),
  jambSubjects: jsonb("jamb_subjects").notNull().$type<string[]>(),
  aiExplanation: text("ai_explanation"),
  aiRoadmap: text("ai_roadmap"),
  aiSkills: text("ai_skills"),
  aiEncouragement: text("ai_encouragement"),
  isSaved: boolean("is_saved").default(false).notNull(),
  reasonForRecommendation: text("reason_for_recommendation"),
  suitableCourses: jsonb("suitable_courses").notNull().$type<string[]>(),
  jobRoles: jsonb("job_roles").notNull().$type<string[]>(),
  requiredSkills: jsonb("required_skills").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecommendationSchema = createInsertSchema(
  recommendationsTable
).omit({ id: true, createdAt: true });

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
