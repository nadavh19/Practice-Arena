-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM (
    'exercise',
    'scale',
    'chord',
    'song_chords',
    'riff',
    'solo',
    'rhythm',
    'technique'
);

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN     "description" TEXT,
ADD COLUMN     "instrument" TEXT DEFAULT 'guitar',
ADD COLUMN     "key" TEXT,
ADD COLUMN     "bpm" INTEGER,
ADD COLUMN     "tab" TEXT,
ADD COLUMN     "chords" TEXT,
ADD COLUMN     "scale" TEXT,
ADD COLUMN     "songName" TEXT,
ADD COLUMN     "artistName" TEXT;

-- AlterTable
ALTER TABLE "Task"
ALTER COLUMN "category" TYPE "TaskCategory"
USING (
    CASE "category"
        WHEN 'warmup' THEN 'exercise'
        WHEN 'scales' THEN 'scale'
        WHEN 'chords' THEN 'chord'
        WHEN 'song-application' THEN 'riff'
        WHEN 'ear-training' THEN 'exercise'
        WHEN 'exercise' THEN 'exercise'
        WHEN 'scale' THEN 'scale'
        WHEN 'chord' THEN 'chord'
        WHEN 'song_chords' THEN 'song_chords'
        WHEN 'riff' THEN 'riff'
        WHEN 'solo' THEN 'solo'
        WHEN 'rhythm' THEN 'rhythm'
        WHEN 'technique' THEN 'technique'
        ELSE 'exercise'
    END
)::"TaskCategory";
