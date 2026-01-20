const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs/promises");
const path = require("node:path");

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), "matieres.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw);

  const matieres = Object.entries(data).flatMap(([type, names]) =>
    names.map((name) => ({ name, type }))
  );

  const existing = await prisma.matiere.findMany({
    select: { name: true, type: true },
  });
  const existingSet = new Set(
    existing.map((m) => `${m.type}::${m.name}`)
  );

  const toCreate = matieres.filter(
    (m) => !existingSet.has(`${m.type}::${m.name}`)
  );

  if (toCreate.length > 0) {
    await prisma.matiere.createMany({ data: toCreate });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
