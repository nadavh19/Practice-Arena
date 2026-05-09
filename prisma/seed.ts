
import "dotenv/config";
import { prisma } from "../lib/prisma";


async function main() {
  console.log("Seeding tasks...");

  await prisma.sessionTask.deleteMany();
  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: [
      {
        name: "Chromatic Warmup",
        difficulty: "beginner",
        duration: 5,
        category: "exercise",
        description: "A simple one-finger-per-fret warmup across all strings.",
      },
      {
        name: "Finger Stretch Exercise",
        difficulty: "beginner",
        duration: 5,
        category: "exercise",
        description: "Slow finger independence work focused on relaxed reach.",
      },
      {
        name: "Alternate Picking Drill",
        difficulty: "intermediate",
        duration: 5,
        category: "technique",
        description: "Use strict down-up picking with a metronome.",
      },
      {
        name: "Hammer-ons and Pull-offs Drill",
        difficulty: "intermediate",
        duration: 5,
        category: "technique",
        description: "Build legato control using two-note and three-note patterns.",
      },
      {
        name: "Pentatonic Box 1",
        difficulty: "beginner",
        duration: 5,
        category: "scale",
        key: "A minor",
        scale: "A C D E G",
      },
      {
        name: "Three Notes Per String Scales",
        difficulty: "advanced",
        duration: 10,
        category: "scale",
        scale: "Major scale, three notes per string",
      },
      {
        name: "Major Scale Positions",
        difficulty: "intermediate",
        duration: 5,
        category: "scale",
        scale: "Major scale CAGED positions",
      },
      {
        name: "Open Chord Transitions",
        difficulty: "beginner",
        duration: 5,
        category: "chord",
        chords: "G - C - D - Em",
      },
      {
        name: "Barre Chord Practice",
        difficulty: "intermediate",
        duration: 5,
        category: "chord",
        chords: "F - Bm - C#m - G#m",
      },
      {
        name: "Rhythm Strumming Basics",
        difficulty: "beginner",
        duration: 5,
        category: "rhythm",
        description: "Practice steady eighth-note strumming with accents on beats 2 and 4.",
      },
      {
        name: "Metronome Timing Exercise",
        difficulty: "intermediate",
        duration: 5,
        category: "rhythm",
        bpm: 80,
      },
      {
        name: "Improvisation on A Minor Backing Track",
        difficulty: "intermediate",
        duration: 10,
        category: "solo",
        key: "A minor",
        scale: "A minor pentatonic",
      },
      {
        name: "Smoke on the Water Main Riff",
        difficulty: "beginner",
        duration: 5,
        category: "riff",
        songName: "Smoke on the Water",
        artistName: "Deep Purple",
        tab: "G|--0--3--5--0--3--6-5--0--3--5--3--0--|",
      },
      {
        name: "Seven Nation Army Riff",
        difficulty: "intermediate",
        duration: 5,
        category: "riff",
        songName: "Seven Nation Army",
        artistName: "The White Stripes",
        key: "E minor",
        tab: "A|--7--7--10--7--5--3--2--|",
      },
      {
        name: "Knockin' on Heaven's Door Chords",
        difficulty: "advanced",
        duration: 10,
        category: "song_chords",
        songName: "Knockin' on Heaven's Door",
        artistName: "Bob Dylan",
        chords: "G - D - Am | G - D - C",
      },
      {
        name: "Ear Training Interval Recognition",
        difficulty: "intermediate",
        duration: 5,
        category: "exercise",
        description: "Listen for and identify common melodic intervals.",
      },
      {
        name: "Legato Coordination Drill",
        difficulty: "advanced",
        duration: 10,
        category: "technique",
        description: "Connect hammer-ons, pull-offs, and position shifts cleanly.",
      },
      {
        name: "Sweet Child O' Mine Intro",
        difficulty: "advanced",
        duration: 10,
        category: "solo",
        songName: "Sweet Child O' Mine",
        artistName: "Guns N' Roses",
        key: "D major",
        tab: "e|-----------15----14-----------15----14----|",
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
