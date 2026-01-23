-- CreateTable
CREATE TABLE "PlanLimit" (
    "plan" TEXT NOT NULL PRIMARY KEY,
    "dailyAI" INTEGER
);

-- CreateTable
CREATE TABLE "AIUsageDaily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AIUsageDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AIUsageDaily_userId_date_idx" ON "AIUsageDaily"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AIUsageDaily_userId_date_key" ON "AIUsageDaily"("userId", "date");
