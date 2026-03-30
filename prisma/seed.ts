
import "dotenv/config";
import { prisma } from "../lib/prisma";


async function main() {
  console.log("Seeding tasks...");

  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: [
      {
        name: "Chromatic Warmup",
        difficulty: "beginner",
        duration: 5,
        category: "warmup",
      },
      {
        name: "Finger Stretch Exercise",
        difficulty: "beginner",
        duration: 5,
        category: "warmup",
      },
      {
        name: "Alternate Picking Drill",
        difficulty: "intermediate",
        duration: 5,
        category: "technique",
      },
      {
        name: "Hammer-ons and Pull-offs Drill",
        difficulty: "intermediate",
        duration: 5,
        category: "technique",
      },
      {
        name: "Pentatonic Box 1",
        difficulty: "beginner",
        duration: 5,
        category: "scales",
      },
      {
        name: "Three Notes Per String Scales",
        difficulty: "advanced",
        duration: 10,
        category: "scales",
      },
      {
        name: "Major Scale Positions",
        difficulty: "intermediate",
        duration: 5,
        category: "scales",
      },
      {
        name: "Open Chord Transitions",
        difficulty: "beginner",
        duration: 5,
        category: "chords",
      },
      {
        name: "Barre Chord Practice",
        difficulty: "intermediate",
        duration: 5,
        category: "chords",
      },
      {
        name: "Rhythm Strumming Basics",
        difficulty: "beginner",
        duration: 5,
        category: "rhythm",
      },
      {
        name: "Metronome Timing Exercise",
        difficulty: "intermediate",
        duration: 5,
        category: "rhythm",
      },
      {
        name: "Improvisation on A Minor Backing Track",
        difficulty: "intermediate",
        duration: 10,
        category: "improvisation",
      },
      {
        name: "Simple Riff Practice",
        difficulty: "beginner",
        duration: 5,
        category: "song-application",
      },
      {
        name: "Learn Riff from Song",
        difficulty: "intermediate",
        duration: 5,
        category: "song-application",
      },
      {
        name: "Play Full Song",
        difficulty: "advanced",
        duration: 10,
        category: "song-application",
      },
      {
        name: "Ear Training Interval Recognition",
        difficulty: "intermediate",
        duration: 5,
        category: "ear-training",
      },
      {
        name: "Legato Coordination Drill",
        difficulty: "advanced",
        duration: 10,
        category: "technique",
      },
    ],
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
