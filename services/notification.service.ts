import { randomUUID } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  buildFallbackReminder,
  buildReminderSubject,
  getUtcSendDate,
  isActiveReminderDay,
  normalizeReminderSettings,
  NOTIFICATION_SETTINGS_ID,
  type ReminderSettingsInput,
  type ReminderUserContext,
} from "@/lib/notification-rules";
import { getSessionStats } from "@/services/session.service";

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

type ReminderContent = {
  body: string;
  source: "ai" | "fallback";
  subject: string;
};

type ReminderRunSummary = {
  considered: number;
  dryRun: boolean;
  failed: number;
  generated: number;
  sent: number;
  skipped: number;
};

const MAX_CONTEXT_SESSIONS = 5;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_EMAIL_FROM = "Practice Arena <onboarding@resend.dev>";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;
}

function getAppBaseUrl() {
  return process.env.APP_BASE_URL?.trim().replace(/\/$/, "") || "http://localhost:3000";
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function preview(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function buildUnsubscribeUrl(token: string) {
  return `${getAppBaseUrl()}/api/notifications/unsubscribe?token=${encodeURIComponent(token)}`;
}

function buildEmailHtml(body: string, unsubscribeUrl: string) {
  return [
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171326;max-width:620px;margin:0 auto;padding:24px">',
    '<h1 style="font-size:22px;margin:0 0 16px">Practice Arena</h1>',
    textToHtml(body),
    `<p style="margin-top:28px;font-size:12px;color:#64748b">You are receiving this because you signed up for Practice Arena. <a href="${escapeHtml(
      unsubscribeUrl,
    )}">Unsubscribe from reminders</a>.</p>`,
    "</div>",
  ].join("");
}

function buildReminderPrompt(user: ReminderUserContext) {
  const sessions =
    user.sessions.length === 0
      ? "No saved practice sessions yet."
      : user.sessions
          .map((session, index) => {
            const tasks = session.tasks
              .map((item) => `${item.task.name} (${item.completed ? "completed" : "pending"})`)
              .join(", ");
            const feedback = session.feedback
              ? `focus ${session.feedback.focusRating}/5, difficulty ${session.feedback.difficultyRating}/5`
              : "no feedback";

            return `${index + 1}. ${session.createdAt.toISOString()}: ${session.availableTime} min, mood ${
              session.mood
            }, goal ${session.goal ?? "not set"}, ${feedback}, tasks: ${tasks || "none"}`;
          })
          .join("\n");

  return [
    "Write one concise daily guitar practice reminder email body.",
    "Use a warm coach voice. Do not include a subject line, markdown, sign-off, or unsubscribe text.",
    "Keep it under 60 words and include one specific practice suggestion.",
    "",
    `Name: ${user.nickname ?? "not provided"}`,
    `Email: ${user.email}`,
    `Level: ${user.level}`,
    `Goals: ${user.goals}`,
    `Stats: ${user.stats.sessionCount} sessions, ${(user.stats.completionRate * 100).toFixed(
      0,
    )}% completion, focus ${user.stats.avgFocusRating.toFixed(1)}/5, difficulty ${user.stats.avgDifficultyRating.toFixed(
      1,
    )}/5.`,
    "Recent sessions:",
    sessions,
  ].join("\n");
}

function extractGeminiText(payload: GeminiResponse) {
  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((text): text is string => Boolean(text))
      .join("\n")
      .trim() ?? ""
  );
}

async function generateAiReminder(user: ReminderUserContext) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      getGeminiModel(),
    )}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildReminderPrompt(user) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.45,
          thinkingConfig: {
            thinkingBudget: 0,
          },
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
    return null;
  }

  return extractGeminiText(payload as GeminiResponse) || null;
}

async function ensureUnsubscribeToken(userId: string, currentToken: string | null) {
  if (currentToken) {
    return currentToken;
  }

  const token = randomUUID();
  await prisma.user.update({
    where: { id: userId },
    data: { emailUnsubscribeToken: token },
  });
  return token;
}

async function buildUserReminderContext(userId: string): Promise<ReminderUserContext | null> {
  const [user, stats, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        goals: true,
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
                category: true,
                difficulty: true,
                duration: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  return {
    ...user,
    stats,
    sessions,
  };
}

async function buildReminderContent(
  settings: Pick<ReminderSettingsInput, "aiEnabled" | "fallbackEnabled" | "subjectTemplate">,
  user: ReminderUserContext,
): Promise<ReminderContent | null> {
  const subject = buildReminderSubject(settings.subjectTemplate, user);

  if (settings.aiEnabled) {
    const aiBody = await generateAiReminder(user);
    if (aiBody) {
      return {
        body: aiBody,
        source: "ai",
        subject,
      };
    }
  }

  if (!settings.fallbackEnabled) {
    return null;
  }

  return {
    body: buildFallbackReminder(user),
    source: "fallback",
    subject,
  };
}

async function sendReminderEmail({
  body,
  subject,
  to,
  unsubscribeToken,
}: {
  body: string;
  subject: string;
  to: string;
  unsubscribeToken: string;
}) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return {
      error: "RESEND_API_KEY is not configured.",
      id: null,
    };
  }

  if (!isValidEmailAddress(to)) {
    return {
      error: `The recipient email "${to}" is not valid. Use a real address like name@example.com.`,
      id: null,
    };
  }

  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    html: buildEmailHtml(body, unsubscribeUrl),
    subject,
    text: `${body}\n\nUnsubscribe: ${unsubscribeUrl}`,
    to,
  });

  return {
    error: error ? error.message : null,
    id: data?.id ?? null,
  };
}

export async function getNotificationSettings() {
  return prisma.notificationSettings.upsert({
    where: { id: NOTIFICATION_SETTINGS_ID },
    update: {},
    create: { id: NOTIFICATION_SETTINGS_ID },
  });
}

export async function updateNotificationSettings(input: ReminderSettingsInput) {
  const settings = normalizeReminderSettings(input);

  return prisma.notificationSettings.upsert({
    where: { id: NOTIFICATION_SETTINGS_ID },
    update: settings,
    create: {
      id: NOTIFICATION_SETTINGS_ID,
      ...settings,
    },
  });
}

export async function getEligibleReminderUsers(sendDate: Date, maxUsersPerRun: number) {
  return prisma.user.findMany({
    where: {
      emailRemindersEnabled: true,
      emailUnsubscribedAt: null,
      role: "user",
      notificationLogs: {
        none: {
          sendDate,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: maxUsersPerRun,
    select: {
      email: true,
      emailUnsubscribeToken: true,
      id: true,
    },
  });
}

export async function runDailyEmailReminders(now = new Date()): Promise<ReminderRunSummary> {
  const settings = await getNotificationSettings();
  const sendDate = getUtcSendDate(now);
  const summary: ReminderRunSummary = {
    considered: 0,
    dryRun: settings.dryRun,
    failed: 0,
    generated: 0,
    sent: 0,
    skipped: 0,
  };

  if (!settings.enabled || !isActiveReminderDay(settings.activeDays, now)) {
    return summary;
  }

  const users = await getEligibleReminderUsers(sendDate, settings.maxUsersPerRun);
  summary.considered = users.length;

  for (const user of users) {
    const context = await buildUserReminderContext(user.id);
    if (!context) {
      summary.skipped += 1;
      continue;
    }

    const content = await buildReminderContent(settings, context);
    if (!content) {
      await prisma.notificationLog.create({
        data: {
          error: "Reminder content could not be generated and fallback is disabled.",
          sendDate,
          status: "failed",
          userId: user.id,
        },
      });
      summary.failed += 1;
      continue;
    }

    summary.generated += 1;
    const log = await prisma.notificationLog.create({
      data: {
        bodyPreview: preview(content.body),
        sendDate,
        status: settings.dryRun ? "skipped" : "generated",
        subject: content.subject,
        userId: user.id,
      },
    });

    if (settings.dryRun) {
      summary.skipped += 1;
      continue;
    }

    const unsubscribeToken = await ensureUnsubscribeToken(user.id, user.emailUnsubscribeToken);
    const sendResult = await sendReminderEmail({
      body: content.body,
      subject: content.subject,
      to: user.email,
      unsubscribeToken,
    });

    if (sendResult.error) {
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          error: sendResult.error,
          status: "failed",
        },
      });
      summary.failed += 1;
      continue;
    }

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        providerMessageId: sendResult.id,
        status: "sent",
      },
    });
    summary.sent += 1;
  }

  return summary;
}

export async function sendAdminNotificationTestEmail(adminId: string) {
  const [settings, admin] = await Promise.all([
    getNotificationSettings(),
    prisma.user.findUnique({
      where: { id: adminId },
      select: {
        email: true,
        emailUnsubscribeToken: true,
        goals: true,
        id: true,
        level: true,
        nickname: true,
      },
    }),
  ]);

  if (!admin) {
    return {
      error: "Admin user not found.",
      sent: false,
    };
  }

  if (!isValidEmailAddress(admin.email)) {
    return {
      error: `The logged-in admin email "${admin.email}" is not valid for Resend. Set ADMIN_EMAIL to a real address, run npm run prisma:seed, then log in with that email.`,
      sent: false,
    };
  }

  const context: ReminderUserContext = {
    email: admin.email,
    goals: admin.goals,
    level: admin.level,
    nickname: admin.nickname,
    sessions: [],
    stats: {
      avgDifficultyRating: 0,
      avgFocusRating: 0,
      completionRate: 0,
      sessionCount: 0,
    },
  };
  const content =
    (await buildReminderContent(settings, context)) ?? {
      body: buildFallbackReminder(context),
      source: "fallback" as const,
      subject: buildReminderSubject(settings.subjectTemplate, context),
    };

  if (settings.dryRun) {
    return {
      error: null,
      sent: false,
      subject: content.subject,
      preview: preview(content.body),
    };
  }

  const unsubscribeToken = await ensureUnsubscribeToken(admin.id, admin.emailUnsubscribeToken);
  const sendResult = await sendReminderEmail({
    body: content.body,
    subject: `[Test] ${content.subject}`,
    to: admin.email,
    unsubscribeToken,
  });

  return {
    error: sendResult.error,
    sent: !sendResult.error,
    subject: content.subject,
    preview: preview(content.body),
  };
}

export async function unsubscribeFromEmailReminders(token: string) {
  if (!token.trim()) {
    return null;
  }

  return prisma.user.update({
    where: { emailUnsubscribeToken: token },
    data: {
      emailRemindersEnabled: false,
      emailUnsubscribedAt: new Date(),
    },
    select: {
      email: true,
    },
  });
}
