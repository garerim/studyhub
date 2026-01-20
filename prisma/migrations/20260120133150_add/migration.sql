-- CreateTable
CREATE TABLE "Matiere" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MatiereToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MatiereToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Matiere" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MatiereToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_MatiereToUser_AB_unique" ON "_MatiereToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_MatiereToUser_B_index" ON "_MatiereToUser"("B");
