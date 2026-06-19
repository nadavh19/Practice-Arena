-- CreateTable
CREATE TABLE "TheoryPhaseScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "phaseId" TEXT NOT NULL,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoryPhaseScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TheoryPhaseScore_userId_idx" ON "TheoryPhaseScore"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TheoryPhaseScore_userId_level_phaseId_key" ON "TheoryPhaseScore"("userId", "level", "phaseId");

-- AddForeignKey
ALTER TABLE "TheoryPhaseScore" ADD CONSTRAINT "TheoryPhaseScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
