-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('skipped', 'generated', 'sent', 'failed');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "emailRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailUnsubscribedAt" TIMESTAMP(3),
ADD COLUMN     "emailUnsubscribeToken" TEXT;

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "activeDays" TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
    "maxUsersPerRun" INTEGER NOT NULL DEFAULT 100,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "fallbackEnabled" BOOLEAN NOT NULL DEFAULT true,
    "subjectTemplate" TEXT NOT NULL DEFAULT 'Your Practice Arena reminder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'generated',
    "providerMessageId" TEXT,
    "subject" TEXT,
    "bodyPreview" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailUnsubscribeToken_key" ON "User"("emailUnsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_userId_sendDate_key" ON "NotificationLog"("userId", "sendDate");

-- CreateIndex
CREATE INDEX "NotificationLog_sendDate_idx" ON "NotificationLog"("sendDate");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
