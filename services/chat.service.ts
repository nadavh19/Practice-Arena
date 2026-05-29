import { prisma } from "@/lib/prisma";
import { getSessionStats } from "@/services/session.service";
import type { ChatMessageInput } from "@/lib/validators";

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type ChatServiceSuccess = {
  success: true;
  model: string;
  reply: string;
};

type ChatServiceFailure = {
  success: false;
  status: number;
  code: string;
  message: string;
};

type ChatServiceResult = ChatServiceSuccess | ChatServiceFailure;

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GEMINI_FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];
const DEFAULT_GEMINI_MAX_OUTPUT_TOKENS = 2048;
const MAX_CONTEXT_SESSIONS = 5;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function getGeminiFallbackModels() {
  const configuredFallbacks = process.env.GEMINI_FALLBACK_MODELS?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return configuredFallbacks && configuredFallbacks.length > 0 ? configuredFallbacks : DEFAULT_GEMINI_FALLBACK_MODELS;
}

function getGeminiMaxOutputTokens() {
  const configuredValue = Number.parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS ?? "", 10);

  if (Number.isNaN(configuredValue)) {
    return DEFAULT_GEMINI_MAX_OUTPUT_TOKENS;
  }

  return Math.min(Math.max(configuredValue, 512), 8192);
}

function getGeminiModelCandidates() {
  return Array.from(new Set([getGeminiModel(), ...getGeminiFallbackModels()]));
}

function getLatestUserPromptPreview(messages: ChatMessageInput[]) {
  const latestUserMessage = messages.findLast((message) => message.role === "user");
  const content = latestUserMessage?.content.trim() ?? "";

  if (content.length <= 180) {
    return content;
  }

  return `${content.slice(0, 177)}...`;
}

function logCoachResponse({
  messages,
  model,
  reply,
  userId,
}: {
  messages: ChatMessageInput[];
  model: string;
  reply: string;
  userId: string;
}) {
  try {
    console.info("coach.response", {
      timestamp: new Date().toISOString(),
      userId,
      model,
      promptPreview: getLatestUserPromptPreview(messages),
      reply,
      replyLength: reply.length,
    });
  } catch {
    // Logging must never block a successful coach response.
  }
}

function toGeminiRole(role: ChatMessageInput["role"]) {
  return role === "assistant" ? "model" : "user";
}

function formatOptional(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "not provided";
  }

  return String(value);
}

function buildContextBlock(
  user: {
    email: string;
    goals: string;
    instrument: string;
    level: string;
    nickname: string | null;
  },
  stats: {
    avgDifficultyRating: number;
    avgFocusRating: number;
    completionRate: number;
    sessionCount: number;
  },
  sessions: Array<{
    availableTime: number;
    createdAt: Date;
    goal: string | null;
    mood: string;
    feedback: {
      difficultyRating: number;
      focusRating: number;
    } | null;
    tasks: Array<{
      completed: boolean;
      task: {
        artistName: string | null;
        bpm: number | null;
        category: string;
        chords: string | null;
        description: string | null;
        difficulty: string;
        duration: number;
        key: string | null;
        name: string;
        scale: string | null;
        songName: string | null;
        tab: string | null;
      };
    }>;
  }>,
) {
  const sessionLines =
    sessions.length === 0
      ? ["No saved practice sessions yet."]
      : sessions.map((session, index) => {
          const tasks = session.tasks
            .map(({ completed, task }) => {
              const details = [
                task.description ? `description: ${task.description}` : null,
                task.key ? `key: ${task.key}` : null,
                task.bpm ? `bpm: ${task.bpm}` : null,
                task.chords ? `chords: ${task.chords}` : null,
                task.scale ? `scale: ${task.scale}` : null,
                task.songName ? `song: ${task.songName}` : null,
                task.artistName ? `artist: ${task.artistName}` : null,
                task.tab ? `tab: ${task.tab}` : null,
              ]
                .filter(Boolean)
                .join("; ");

              return `${task.name} (${task.category}, ${task.difficulty}, ${task.duration} min, ${
                completed ? "completed" : "not completed"
              })${details ? ` - ${details}` : ""}`;
            })
            .join(" | ");

          const feedback = session.feedback
            ? `difficulty ${session.feedback.difficultyRating}/5, focus ${session.feedback.focusRating}/5`
            : "no feedback";

          return `${index + 1}. ${session.createdAt.toISOString()}: mood ${session.mood}, time ${
            session.availableTime
          } min, goal ${formatOptional(session.goal)}, feedback ${feedback}, tasks: ${tasks || "none"}`;
        });

  return [
    "Practice Arena user context:",
    `Name: ${formatOptional(user.nickname)}`,
    `Email: ${user.email}`,
    `Instrument: ${user.instrument}`,
    `Level: ${user.level}`,
    `Goals: ${user.goals}`,
    `Stats: ${stats.sessionCount} sessions, ${(stats.completionRate * 100).toFixed(
      0,
    )}% task completion, average difficulty ${stats.avgDifficultyRating.toFixed(
      1,
    )}/5, average focus ${stats.avgFocusRating.toFixed(1)}/5.`,
    "Recent sessions:",
    ...sessionLines,
  ].join("\n");
}

function buildSystemInstruction(contextBlock: string) {
  return [
    "You are Practice Arena Coach, a concise guitar and music practice assistant inside a student project app.",
    "Only answer questions about music, guitar technique, practice planning, exercises, songs, theory, the user's profile, saved practice sessions, tasks, feedback, and progress in Practice Arena.",
    "If the user asks about anything outside those topics, politely refuse in one sentence and invite a music-practice question.",
    "Use the provided app context when the user asks about their history, saved sessions, profile, goals, completed tasks, or feedback.",
    "Do not invent saved sessions or profile details. If the context does not contain the answer, say that the app does not have that information yet.",
    "Give practical, safe practice advice. Avoid medical claims; for pain or injury, suggest stopping and asking a qualified teacher or clinician.",
    "Keep answers under 180 words unless the user asks for a detailed practice plan.",
    "",
    contextBlock,
  ].join("\n");
}

function extractGeminiReply(payload: GeminiResponse) {
  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((text): text is string => Boolean(text))
      .join("\n")
      .trim() ?? ""
  );
}

function getGeminiFinishReason(payload: GeminiResponse) {
  return payload.candidates?.[0]?.finishReason ?? "UNKNOWN";
}

function shouldTryFallback(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function callGeminiModel(
  model: string,
  messages: ChatMessageInput[],
  systemInstruction: string,
): Promise<ChatServiceResult> {
  const apiKey = getGeminiApiKey();
  const encodedModel = encodeURIComponent(model);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map((message) => ({
          role: toGeminiRole(message.role),
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: getGeminiMaxOutputTokens(),
          temperature: 0.35,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      }),
    },
  );

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const geminiError = (payload as GeminiResponse | null)?.error;
    const detail = geminiError?.message ? ` Gemini said: ${geminiError.message}` : "";

    return {
      success: false,
      status: shouldTryFallback(response.status) ? response.status : 502,
      code: "GEMINI_REQUEST_FAILED",
      message: `The AI coach could not reach Gemini using model ${model} (${response.status}).${detail}`,
    };
  }

  const reply = extractGeminiReply(payload as GeminiResponse);
  const finishReason = getGeminiFinishReason(payload as GeminiResponse);
  if (!reply) {
    return {
      success: false,
      status: 502,
      code: "GEMINI_EMPTY_RESPONSE",
      message: `The AI coach did not return a usable answer from model ${model}. Finish reason: ${finishReason}.`,
    };
  }

  return {
    success: true,
    model,
    reply,
  };
}

async function callGemini(messages: ChatMessageInput[], systemInstruction: string): Promise<ChatServiceResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      status: 500,
      code: "GEMINI_API_KEY_MISSING",
      message: "GEMINI_API_KEY is not configured on the server.",
    };
  }

  let lastFailure: ChatServiceFailure | null = null;
  for (const model of getGeminiModelCandidates()) {
    const result = await callGeminiModel(model, messages, systemInstruction);
    if (result.success) {
      return result;
    }

    lastFailure = result;
    if (!shouldTryFallback(result.status)) {
      return result;
    }
  }

  return (
    lastFailure ?? {
      success: false,
      status: 502,
      code: "GEMINI_REQUEST_FAILED",
      message: "The AI coach could not reach any configured Gemini model. Please try again shortly.",
    }
  );
}

export async function askMusicCoach(userId: string, messages: ChatMessageInput[]): Promise<ChatServiceResult> {
  const [user, stats, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        goals: true,
        instrument: true,
        level: true,
        nickname: true,
      },
    }),
    getSessionStats(userId),
    prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_CONTEXT_SESSIONS,
      select: {
        availableTime: true,
        createdAt: true,
        goal: true,
        mood: true,
        feedback: {
          select: {
            difficultyRating: true,
            focusRating: true,
          },
        },
        tasks: {
          select: {
            completed: true,
            task: {
              select: {
                artistName: true,
                bpm: true,
                category: true,
                chords: true,
                description: true,
                difficulty: true,
                duration: true,
                key: true,
                name: true,
                scale: true,
                songName: true,
                tab: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!user) {
    return {
      success: false,
      status: 404,
      code: "USER_NOT_FOUND",
      message: "User not found.",
    };
  }

  const result = await callGemini(messages, buildSystemInstruction(buildContextBlock(user, stats, sessions)));
  if (result.success) {
    logCoachResponse({
      messages,
      model: result.model,
      reply: result.reply,
      userId,
    });
  }

  return result;
}
