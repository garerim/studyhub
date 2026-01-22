-- CreateTable
CREATE TABLE "Cours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "matiereId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "originalText" TEXT,
    "processedText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cours_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoursDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coursId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    CONSTRAINT "CoursDocument_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoursDocument_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CoursDocument_coursId_idx" ON "CoursDocument"("coursId");

-- CreateIndex
CREATE UNIQUE INDEX "CoursDocument_coursId_fileId_key" ON "CoursDocument"("coursId", "fileId");
