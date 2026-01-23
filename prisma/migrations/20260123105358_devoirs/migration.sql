-- CreateTable
CREATE TABLE "Devoir" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "matiereId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Devoir_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Devoir_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Devoir_userId_dueDate_idx" ON "Devoir"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "Devoir_userId_status_idx" ON "Devoir"("userId", "status");

-- CreateIndex
CREATE INDEX "Devoir_matiereId_idx" ON "Devoir"("matiereId");
