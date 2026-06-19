import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFallbackReminder,
  buildReminderSubject,
  getUtcSendDate,
  isActiveReminderDay,
  normalizeReminderSettings,
} from "@/lib/notification-rules";

const baseUser = {
  email: "player@example.com",
  goals: "Improve rhythm and learn blues songs",
  level: "beginner",
  nickname: "Nadav",
  stats: {
    avgDifficultyRating: 0,
    avgFocusRating: 0,
    completionRate: 0,
    sessionCount: 0,
  },
  sessions: [],
};

describe("notification rules", () => {
  it("normalizes admin settings into safe bounds", () => {
    const settings = normalizeReminderSettings({
      activeDays: "6,2,2,9,bad",
      aiEnabled: true,
      dryRun: true,
      enabled: true,
      fallbackEnabled: true,
      maxUsersPerRun: 9999,
      subjectTemplate: "  ",
    });

    assert.equal(settings.activeDays, "2,6");
    assert.equal(settings.maxUsersPerRun, 500);
    assert.equal(settings.subjectTemplate, "Your Practice Arena reminder");
  });

  it("checks active days using the UTC cron day", () => {
    const sunday = new Date("2026-06-14T08:00:00.000Z");

    assert.equal(isActiveReminderDay("0", sunday), true);
    assert.equal(isActiveReminderDay("1,2,3,4,5", sunday), false);
  });

  it("uses the UTC start of day for duplicate prevention", () => {
    const date = getUtcSendDate(new Date("2026-06-14T23:55:00.000Z"));

    assert.equal(date.toISOString(), "2026-06-14T00:00:00.000Z");
  });

  it("builds a fallback reminder without history", () => {
    const body = buildFallbackReminder(baseUser);

    assert.match(body, /Hi Nadav/);
    assert.match(body, /Improve rhythm/);
  });

  it("builds a fallback reminder from recent session history", () => {
    const body = buildFallbackReminder({
      ...baseUser,
      stats: {
        ...baseUser.stats,
        completionRate: 0.5,
        sessionCount: 1,
      },
      sessions: [
        {
          availableTime: 20,
          createdAt: new Date("2026-06-13T08:00:00.000Z"),
          feedback: {
            difficultyRating: 3,
            focusRating: 4,
          },
          goal: "Strumming",
          mood: "focused",
          tasks: [
            {
              completed: false,
              task: {
                category: "rhythm",
                difficulty: "beginner",
                duration: 10,
                name: "Eighth-note strum drill",
              },
            },
          ],
        },
      ],
    });

    assert.match(body, /Eighth-note strum drill/);
    assert.match(body, /50%/);
  });

  it("personalizes reminder subjects", () => {
    assert.equal(buildReminderSubject("Practice time, {name}", baseUser), "Practice time, Nadav");
    assert.equal(buildReminderSubject("Practice time, {name}", { nickname: null }), "Practice time, musician");
  });
});
