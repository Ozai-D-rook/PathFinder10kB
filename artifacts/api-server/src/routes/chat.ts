import { Router } from "express";
import { eq, and, asc, desc } from "drizzle-orm";
import {
  db,
  studentsTable,
  assessmentsTable,
  recommendationsTable,
  conversations,
  messages,
} from "@workspace/db";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// GET /api/chat/conversations — List user's conversations
router.get("/chat/conversations", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.json([]);

  const student = students[0];

  const list = await db
    .select()
    .from(conversations)
    .where(eq(conversations.studentId, student.id))
    .orderBy(desc(conversations.createdAt));

  return res.json(list);
});

// POST /api/chat/conversations — Create a new conversation
router.post("/chat/conversations", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) {
    return res
      .status(404)
      .json({ error: "Student profile not found. Please complete your profile first." });
  }

  const student = students[0];
  const title = (req.body?.title as string | undefined)?.trim() || "Career Discussion";

  const [newConv] = await db
    .insert(conversations)
    .values({
      studentId: student.id,
      title,
    })
    .returning();

  return res.status(201).json(newConv);
});

// DELETE /api/chat/conversations/:id — Delete a conversation
router.delete("/chat/conversations/:id", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.status(404).json({ error: "Student not found" });

  const student = students[0];

  await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.studentId, student.id)));

  return res.json({ success: true });
});

// GET /api/chat/conversations/:id/messages — Get messages for a conversation
router.get("/chat/conversations/:id/messages", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.status(404).json({ error: "Student not found" });

  const student = students[0];

  const conv = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.studentId, student.id)))
    .limit(1);

  if (!conv.length) return res.status(404).json({ error: "Conversation not found" });

  const msgList = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return res.json(msgList);
});

// POST /api/chat/conversations/:id/messages — Send a message and generate AI reply
router.post("/chat/conversations/:id/messages", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  const content = (req.body?.content as string | undefined)?.trim();
  if (!content) return res.status(400).json({ error: "Message content cannot be empty" });

  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, req.userId))
    .limit(1);

  if (!students.length) return res.status(404).json({ error: "Student profile not found" });

  const student = students[0];

  const conv = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.studentId, student.id)))
    .limit(1);

  if (!conv.length) return res.status(404).json({ error: "Conversation not found" });

  // Save user's message
  const [userMsg] = await db
    .insert(messages)
    .values({
      conversationId: id,
      role: "user",
      content,
    })
    .returning();

  // If title is default, update title based on first user message
  if (conv[0].title === "Career Discussion" || conv[0].title === "New Chat") {
    const truncatedTitle = content.length > 30 ? content.substring(0, 30) + "..." : content;
    await db
      .update(conversations)
      .set({ title: truncatedTitle })
      .where(eq(conversations.id, id));
  }

  // Fetch full conversation history
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  // Fetch student assessment & recommendation for personalized context
  const assessment = await db
    .select()
    .from(assessmentsTable)
    .where(eq(assessmentsTable.studentId, student.id))
    .orderBy(desc(assessmentsTable.createdAt))
    .limit(1);

  let recommendationContext = "";
  if (assessment.length) {
    const recs = await db
      .select()
      .from(recommendationsTable)
      .where(eq(recommendationsTable.assessmentId, assessment[0].id))
      .limit(1);

    if (recs.length) {
      const r = recs[0];
      recommendationContext = `Based on their recent career assessment result:
- Recommended Primary Career: ${r.topCareer}
- Alternative Careers: ${Array.isArray(r.alternativeCareers) ? (r.alternativeCareers as string[]).join(", ") : "N/A"}
- Recommended JAMB Subjects: ${Array.isArray(r.jambSubjects) ? (r.jambSubjects as string[]).join(", ") : "N/A"}
- Suitable Degree Courses: ${Array.isArray(r.suitableCourses) ? (r.suitableCourses as string[]).join(", ") : "N/A"}`;
    }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

  let aiContent = "";

  if (!apiKey) {
    aiContent = `Hello ${student.fullName}! I am your PathFinder AI Career Advisor.

Currently, the GEMINI_API_KEY environment variable is not configured on this server. To enable my live Gemini AI responses, please add \`GEMINI_API_KEY=your_key\` to your \`.env\` file.

In the meantime, feel free to explore your assessment recommendations and saved results on the dashboard!`;
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are PathFinder AI Advisor, a warm, highly encouraging, and knowledgeable career guidance counselor dedicated to helping Nigerian secondary school students (SSS1, SSS2, SSS3, and JAMBites).

Student Profile:
- Name: ${student.fullName}
- School: ${student.schoolName}
- Class Level: ${student.classLevel}
${recommendationContext}

Guidelines for your response:
1. Provide accurate guidance on Nigerian educational choices, including SSCE/WAEC subject combinations, JAMB UTME subject combinations, O'Level requirements, Federal and State university choices, polytechnics, and career growth in Nigeria.
2. Be warm, encouraging, and supportive. Inspire confidence in their academic journey.
3. Keep formatting clean with bullet points and short paragraphs so it's easy to read on mobile devices.
4. Keep responses concise yet rich in actionable advice.`;

      const contents = history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,

        config: {
          systemInstruction,
          maxOutputTokens: 2048,
        },
      });

      aiContent =
        response.text?.trim() ||
        "I'm sorry, I couldn't process your request right now. Please try asking again!";
    } catch (err: any) {
      console.error("Error communicating with Gemini API:", err);
      aiContent =
        "I encountered a temporary connection issue while thinking. Please try sending your message again in a moment!";
    }
  }

  // Save AI response
  const [aiMsg] = await db
    .insert(messages)
    .values({
      conversationId: id,
      role: "model",
      content: aiContent,
    })
    .returning();

  return res.status(201).json({ userMessage: userMsg, aiMessage: aiMsg });
});

export default router;
