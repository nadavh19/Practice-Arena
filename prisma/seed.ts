
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
      {
        name: "Chromatic Spider Exercise - 1-2-3-4",
        difficulty: "beginner",
        duration: 5,
        category: "exercise",
        description: "Classic left-hand warmup using one finger per fret.",
        instrument: "guitar",
        bpm: 60,
        tab: `
e|----------------1-2-3-4-|
B|------------1-2-3-4-----|
G|--------1-2-3-4---------|
D|----1-2-3-4-------------|
A|1-2-3-4-----------------|
E|------------------------|
`,
      },
      {
        name: "Reverse Chromatic Exercise - 4-3-2-1",
        difficulty: "beginner",
        duration: 5,
        category: "exercise",
        description: "Reverse finger control exercise.",
        instrument: "guitar",
        bpm: 60,
        tab: `
e|----------------4-3-2-1-|
B|------------4-3-2-1-----|
G|--------4-3-2-1---------|
D|----4-3-2-1-------------|
A|4-3-2-1-----------------|
E|------------------------|
`,
      },
      {
        name: "String Skipping Exercise",
        difficulty: "intermediate",
        duration: 7,
        category: "exercise",
        description: "Improves picking accuracy across non-adjacent strings.",
        instrument: "guitar",
        bpm: 70,
        tab: `
e|----------------5-7-8-|
G|----------5-7-8-------|
B|----5-7-8-------------|
D|5-7-8-----------------|
A|----------------------|
E|----------------------|
`,
      },
      {
        name: "Alternate Picking on One String",
        difficulty: "beginner",
        duration: 5,
        category: "exercise",
        description: "Focus on strict down-up alternate picking.",
        instrument: "guitar",
        bpm: 80,
        tab: `
e|5-6-7-8-7-6-5-6-7-8-7-6-|
B|------------------------|
G|------------------------|
D|------------------------|
A|------------------------|
E|------------------------|
`,
      },
      {
        name: "Hammer-On and Pull-Off Exercise",
        difficulty: "intermediate",
        duration: 8,
        category: "technique",
        description: "Builds legato strength and finger independence.",
        instrument: "guitar",
        bpm: 65,
        tab: `
e|5h7p5---5h8p5---5h7p5---5h8p5-|
B|------8-------8-------8--------|
G|-------------------------------|
D|-------------------------------|
A|-------------------------------|
E|-------------------------------|
`,
      },

      // -------------------------
      // SCALES
      // -------------------------
      {
        name: "A Minor Pentatonic Scale - Position 1",
        difficulty: "beginner",
        duration: 10,
        category: "scale",
        description: "Practice the first position of the A minor pentatonic scale.",
        instrument: "guitar",
        key: "A minor",
        scale: "A minor pentatonic",
        bpm: 70,
        tab: `
e|-------------------------5-8-|
B|---------------------5-8-----|
G|-----------------5-7---------|
D|-------------5-7-------------|
A|---------5-7-----------------|
E|-----5-8---------------------|
`,
      },
      {
        name: "E Minor Pentatonic Scale - Position 1",
        difficulty: "beginner",
        duration: 10,
        category: "scale",
        description: "Practice the first position of the E minor pentatonic scale.",
        instrument: "guitar",
        key: "E minor",
        scale: "E minor pentatonic",
        bpm: 70,
        tab: `
e|-------------------------0-3-|
B|---------------------0-3-----|
G|-----------------0-2---------|
D|-------------0-2-------------|
A|---------0-2-----------------|
E|-----0-3---------------------|
`,
      },
      {
        name: "C Major Scale - Open Position",
        difficulty: "beginner",
        duration: 10,
        category: "scale",
        description: "Practice the C major scale in open position.",
        instrument: "guitar",
        key: "C major",
        scale: "C major",
        bpm: 65,
        tab: `
e|-------------------------0-1-|
B|---------------------1-3-----|
G|---------------0-2-----------|
D|---------0-2-3---------------|
A|---0-2-3---------------------|
E|-3---------------------------|
`,
      },
      {
        name: "G Major Scale - Two Octaves",
        difficulty: "intermediate",
        duration: 12,
        category: "scale",
        description: "Practice a two-octave G major scale pattern.",
        instrument: "guitar",
        key: "G major",
        scale: "G major",
        bpm: 75,
        tab: `
e|-----------------------------2-3-|
B|-------------------------3-5-----|
G|-------------------2-4-5---------|
D|-------------2-4-5---------------|
A|-------2-3-5---------------------|
E|-3-5-----------------------------|
`,
      },
      {
        name: "A Natural Minor Scale",
        difficulty: "intermediate",
        duration: 12,
        category: "scale",
        description: "Practice the A natural minor scale across several strings.",
        instrument: "guitar",
        key: "A minor",
        scale: "A natural minor",
        bpm: 75,
        tab: `
e|-----------------------------5-7-8-|
B|-----------------------5-6-8-------|
G|-----------------4-5-7-------------|
D|-----------5-7---------------------|
A|-----5-7-8-------------------------|
E|-5-7-8-----------------------------|
`,
      },

      // -------------------------
      // CHORDS
      // -------------------------
      {
        name: "Open C Major Chord",
        difficulty: "beginner",
        duration: 5,
        category: "chord",
        description: "Practice clean open C major chord.",
        instrument: "guitar",
        key: "C major",
        chords: "C",
        tab: `
e|0|
B|1|
G|0|
D|2|
A|3|
E|x|
`,
      },
      {
        name: "Open G Major Chord",
        difficulty: "beginner",
        duration: 5,
        category: "chord",
        description: "Practice clean open G major chord.",
        instrument: "guitar",
        key: "G major",
        chords: "G",
        tab: `
e|3|
B|3|
G|0|
D|0|
A|2|
E|3|
`,
      },
      {
        name: "Open D Major Chord",
        difficulty: "beginner",
        duration: 5,
        category: "chord",
        description: "Practice clean open D major chord.",
        instrument: "guitar",
        key: "D major",
        chords: "D",
        tab: `
e|2|
B|3|
G|2|
D|0|
A|x|
E|x|
`,
      },
      {
        name: "Open A Minor Chord",
        difficulty: "beginner",
        duration: 5,
        category: "chord",
        description: "Practice clean open A minor chord.",
        instrument: "guitar",
        key: "A minor",
        chords: "Am",
        tab: `
e|0|
B|1|
G|2|
D|2|
A|0|
E|x|
`,
      },
      {
        name: "F Major Barre Chord",
        difficulty: "intermediate",
        duration: 8,
        category: "chord",
        description: "Practice full E-shape barre chord.",
        instrument: "guitar",
        key: "F major",
        chords: "F",
        tab: `
e|1|
B|1|
G|2|
D|3|
A|3|
E|1|
`,
      },
      {
        name: "B Minor Barre Chord",
        difficulty: "intermediate",
        duration: 8,
        category: "chord",
        description: "Practice A-shape minor barre chord.",
        instrument: "guitar",
        key: "B minor",
        chords: "Bm",
        tab: `
e|2|
B|3|
G|4|
D|4|
A|2|
E|x|
`,
      },

      // -------------------------
      // SONG CHORDS / PROGRESSIONS
      // -------------------------
      {
        name: "Beginner Pop Progression - G D Em C",
        difficulty: "beginner",
        duration: 10,
        category: "song_chords",
        description: "Very common pop-style chord progression.",
        instrument: "guitar",
        key: "G major",
        chords: "G - D - Em - C",
      },
      {
        name: "Minor Rock Progression - Am F C G",
        difficulty: "beginner",
        duration: 10,
        category: "song_chords",
        description: "Common emotional rock/pop progression.",
        instrument: "guitar",
        key: "A minor",
        chords: "Am - F - C - G",
      },
      {
        name: "Blues Progression in E",
        difficulty: "beginner",
        duration: 12,
        category: "song_chords",
        description: "Basic 12-bar blues chord set.",
        instrument: "guitar",
        key: "E",
        chords: "E7 - A7 - B7",
      },
      {
        name: "Classic Rock Progression - A D E",
        difficulty: "beginner",
        duration: 10,
        category: "song_chords",
        description: "Simple I-IV-V rock progression.",
        instrument: "guitar",
        key: "A major",
        chords: "A - D - E",
      },
      {
        name: "Sad Acoustic Progression - Em C G D",
        difficulty: "beginner",
        duration: 10,
        category: "song_chords",
        description: "Great for strumming and rhythm practice.",
        instrument: "guitar",
        key: "G major / E minor",
        chords: "Em - C - G - D",
      },

      // -------------------------
      // RIFFS
      // -------------------------
      {
        name: "Original Rock Riff in E",
        difficulty: "beginner",
        duration: 8,
        category: "riff",
        description: "Original simple rock riff using low E power notes.",
        instrument: "guitar",
        key: "E minor",
        bpm: 90,
        tab: `
e|----------------------|
B|----------------------|
G|----------------------|
D|----------------------|
A|---------2-----2-5-2--|
E|-0-0-3-0---0-0--------|
`,
      },
      {
        name: "Original Blues Riff in A",
        difficulty: "beginner",
        duration: 8,
        category: "riff",
        description: "Original shuffle-style blues riff.",
        instrument: "guitar",
        key: "A",
        bpm: 80,
        tab: `
e|----------------------|
B|----------------------|
G|----------------------|
D|----------------------|
A|-0-0-4-0-5-0-4-0------|
E|-----------------3-0--|
`,
      },
      {
        name: "Original Funk Muted Riff",
        difficulty: "intermediate",
        duration: 10,
        category: "riff",
        description: "Muted sixteenth-note funk-style riff.",
        instrument: "guitar",
        key: "E minor",
        bpm: 100,
        tab: `
e|----------------------|
B|----------------------|
G|-----7-x-5-x----------|
D|-----7-x-5-x-7-x-5-x--|
A|-------------7-x-5-x--|
E|-0-x------------------|
`,
      },
      {
        name: "Original Metal Riff in Drop D",
        difficulty: "intermediate",
        duration: 10,
        category: "riff",
        description: "Original heavy palm-muted riff in Drop D tuning.",
        instrument: "guitar",
        key: "D minor",
        bpm: 110,
        tab: `
D|----------------------|
A|----------------------|
F|----------------------|
C|----------------------|
G|----------------------|
D|-0-0-3-0-5-0-6-5-3-0--|
`,
      },
      {
        name: "Original Indie Arpeggio Riff",
        difficulty: "intermediate",
        duration: 10,
        category: "riff",
        description: "Clean arpeggiated riff for timing and tone.",
        instrument: "guitar",
        key: "C major",
        bpm: 85,
        tab: `
e|-------0---------0----|
B|-----1---1-----3---3--|
G|---0---------0--------|
D|----------------------|
A|-3---------2----------|
E|----------------------|
`,
      },

      // -------------------------
      // SOLOS
      // -------------------------
      {
        name: "Beginner Solo Phrase - A Minor Pentatonic",
        difficulty: "beginner",
        duration: 8,
        category: "solo",
        description: "Short original solo phrase using A minor pentatonic.",
        instrument: "guitar",
        key: "A minor",
        scale: "A minor pentatonic",
        bpm: 75,
        tab: `
e|----------------5-8-5----------|
B|------------5-8-------8-5------|
G|------5-7b----------------7-5--|
D|--5-7--------------------------|
A|-------------------------------|
E|-------------------------------|
`,
      },
      {
        name: "Blues Solo Lick in E",
        difficulty: "intermediate",
        duration: 10,
        category: "solo",
        description: "Original blues phrase with bends and pull-offs.",
        instrument: "guitar",
        key: "E minor",
        scale: "E blues",
        bpm: 80,
        tab: `
e|-------------------------|
B|-------------------------|
G|-----0-2b-2p0------------|
D|-0h2---------2-0---------|
A|-----------------2-0-----|
E|---------------------3-0-|
`,
      },
      {
        name: "Rock Solo Sequence in G",
        difficulty: "intermediate",
        duration: 12,
        category: "solo",
        description: "Original melodic sequence for lead guitar practice.",
        instrument: "guitar",
        key: "G major",
        scale: "G major",
        bpm: 90,
        tab: `
e|----------------7-8-10-|
B|----------8-10---------|
G|----7-9-11-------------|
D|-9---------------------|
A|-----------------------|
E|-----------------------|
`,
      },
      {
        name: "Fast Pentatonic Run in A Minor",
        difficulty: "advanced",
        duration: 12,
        category: "solo",
        description: "Speed-building pentatonic sequence.",
        instrument: "guitar",
        key: "A minor",
        scale: "A minor pentatonic",
        bpm: 120,
        tab: `
e|-5-8-5-------------------------|
B|-------8-5-8-5-----------------|
G|---------------7-5-7-5---------|
D|-----------------------7-5-7-5-|
A|-------------------------------|
E|-------------------------------|
`,
      },

      // -------------------------
      // PUBLIC DOMAIN / TRADITIONAL SONG-LIKE TASKS
      // -------------------------
      {
        name: "Traditional Melody - Simple Open String Study",
        difficulty: "beginner",
        duration: 8,
        category: "riff",
        description: "Simple melody-style practice based on public-domain style movement.",
        instrument: "guitar",
        songName: "Traditional Practice Melody",
        artistName: "Public Domain / Traditional",
        key: "C major",
        tab: `
e|----------------0-1-0----------|
B|----------1-3---------3-1------|
G|----0-2-------------------2-0--|
D|-2-----------------------------|
A|-------------------------------|
E|-------------------------------|
`,
      },
      {
        name: "Amazing Grace - Chord Practice",
        difficulty: "beginner",
        duration: 10,
        category: "song_chords",
        description: "Public-domain chord practice using simple open chords.",
        instrument: "guitar",
        songName: "Amazing Grace",
        artistName: "Public Domain",
        key: "G major",
        chords: "G - C - G - D - G",
      },
      {
        name: "House of the Rising Sun - Chord Cycle",
        difficulty: "intermediate",
        duration: 12,
        category: "song_chords",
        description: "Traditional chord progression practice.",
        instrument: "guitar",
        songName: "House of the Rising Sun",
        artistName: "Traditional",
        key: "A minor",
        chords: "Am - C - D - F - Am - C - E",
      },

      // -------------------------
      // RHYTHM
      // -------------------------
      {
        name: "Basic Downstroke Strumming",
        difficulty: "beginner",
        duration: 5,
        category: "rhythm",
        description: "Play one downstroke per beat. Count 1 2 3 4.",
        instrument: "guitar",
        chords: "G - C - D - G",
        bpm: 70,
      },
      {
        name: "Down-Up Strumming Pattern",
        difficulty: "beginner",
        duration: 8,
        category: "rhythm",
        description: "Practice steady down-up motion.",
        instrument: "guitar",
        chords: "Em - C - G - D",
        bpm: 80,
      },
      {
        name: "Pop Strumming Pattern",
        difficulty: "intermediate",
        duration: 10,
        category: "rhythm",
        description: "Pattern: Down, Down-Up, Up-Down-Up.",
        instrument: "guitar",
        chords: "G - D - Em - C",
        bpm: 85,
      },
      {
        name: "Palm Muting Eighth Notes",
        difficulty: "intermediate",
        duration: 8,
        category: "rhythm",
        description: "Practice tight palm-muted eighth notes on the low E string.",
        instrument: "guitar",
        key: "E minor",
        bpm: 100,
        tab: `
e|----------------------|
B|----------------------|
G|----------------------|
D|----------------------|
A|----------------------|
E|-0-0-0-0-0-0-0-0------|
`,
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
