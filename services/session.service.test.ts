import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/practice_arena_test";

type TestModules = {
  generateAndSaveSessionWithClient: typeof import("./session.service").generateAndSaveSessionWithClient;
};

let modulesPromise: Promise<TestModules> | null = null;

test("session generation excludes only tasks completed by the current user", async () => {
  const { generateAndSaveSessionWithClient } = await loadModules();

  let createdTaskIds: string[] = [];
  const db = {
    session: {
      create: async (args: unknown) => {
        const data = (args as { data: { tasks: { create: Array<{ task: { connect: { id: string } } }> } } }).data;
        createdTaskIds = data.tasks.create.map((item) => item.task.connect.id);

        return {
          availableTime: 15,
          createdAt: new Date(),
          feedback: null,
          goal: null,
          id: "session-1",
          mood: "focused",
          tasks: [],
          userId: "user-1",
        };
      },
      findMany: async () => [],
    },
    task: {
      findMany: async (args: unknown) => {
        assert.deepEqual(args, {
          where: {
            sessionTasks: {
              none: {
                completed: true,
                session: {
                  userId: "user-1",
                },
              },
            },
          },
          select: {
            artistName: true,
            bpm: true,
            category: true,
            chords: true,
            description: true,
            difficulty: true,
            duration: true,
            id: true,
            instrument: true,
            key: true,
            name: true,
            scale: true,
            songName: true,
            tab: true,
          },
        });

        return [
          task("fresh-long", "Fresh Chord Study", 10, "song_chords"),
          task("fresh-short", "Fresh Rhythm Drill", 5, "rhythm"),
        ];
      },
    },
    user: {
      findUnique: async () => ({
        goals: "practice chords",
        id: "user-1",
        level: "beginner",
      }),
    },
  };

  const result = await generateAndSaveSessionWithClient(db as never, "user-1", {
    availableTime: 15,
    mood: "focused",
  });

  assert.equal(result.status, "success");
  assert.deepEqual(createdTaskIds, ["fresh-long", "fresh-short"]);
});

test("session generation does not create a session when no eligible tasks remain", async () => {
  const { generateAndSaveSessionWithClient } = await loadModules();

  let createCalls = 0;
  const db = {
    session: {
      create: async () => {
        createCalls += 1;
        throw new Error("session.create should not be called");
      },
      findMany: async () => [],
    },
    task: {
      findMany: async () => [],
    },
    user: {
      findUnique: async () => ({
        goals: "practice chords",
        id: "user-1",
        level: "beginner",
      }),
    },
  };

  const result = await generateAndSaveSessionWithClient(db as never, "user-1", {
    availableTime: 15,
    mood: "focused",
  });

  assert.equal(result.status, "no_available_tasks");
  assert.equal(createCalls, 0);
});

function loadModules() {
  modulesPromise ??= import("./session.service").then((rawServiceModule) => {
    const serviceModule = rawServiceModule as typeof import("./session.service") & {
      default?: typeof import("./session.service");
    };

    return {
      generateAndSaveSessionWithClient:
        serviceModule.generateAndSaveSessionWithClient ?? serviceModule.default?.generateAndSaveSessionWithClient,
    } as TestModules;
  });

  return modulesPromise;
}

function task(id: string, name: string, duration: number, category: string) {
  return {
    artistName: null,
    bpm: null,
    category,
    chords: null,
    description: null,
    difficulty: "beginner",
    duration,
    id,
    instrument: "guitar",
    key: null,
    name,
    scale: null,
    songName: null,
    tab: null,
  };
}
