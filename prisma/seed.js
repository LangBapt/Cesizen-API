const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin1234!", 10);
  const userPassword = await bcrypt.hash("User1234!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cesizen.fr" },
    update: {},
    create: {
      username: "admin",
      email: "admin@cesizen.fr",
      password: adminPassword,
      role: "ADMIN",
      activated: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "alice@cesizen.fr" },
    update: {},
    create: {
      username: "alice",
      email: "alice@cesizen.fr",
      password: userPassword,
      role: "USER",
      activated: true,
    },
  });

  const info1 = await prisma.information.create({
    data: {
      title: "Comprendre le stress",
      description: "Introduction au stress et ses effets sur la santé mentale.",
      content: "Le stress est une réponse naturelle de l'organisme face à une situation perçue comme menaçante...",
      category: "Santé mentale",
      status: true,
    },
  });

  const info2 = await prisma.information.create({
    data: {
      title: "Techniques de relaxation",
      description: "Méthodes éprouvées pour réduire le stress au quotidien.",
      content: "La relaxation permet de réduire les tensions musculaires et mentales. Parmi les techniques...",
      category: "Bien-être",
      status: true,
    },
  });

  await prisma.manage.createMany({
    data: [
      { userId: admin.id, informationId: info1.id },
      { userId: admin.id, informationId: info2.id },
    ],
  });

  const phaseInspir = await prisma.respirationPhase.create({
    data: { respirationPhaseName: "Inspiration" },
  });
  const phaseRetenue = await prisma.respirationPhase.create({
    data: { respirationPhaseName: "Rétention" },
  });
  const phaseExpir = await prisma.respirationPhase.create({
    data: { respirationPhaseName: "Expiration" },
  });

  const exercise1 = await prisma.exercise.create({
    data: {
      title: "Cohérence cardiaque 5-5",
      description: "Exercice de base de cohérence cardiaque : 5 secondes inspiration, 5 secondes expiration.",
      duration: 300,
      instructions: "Inspirez lentement pendant 5 secondes, puis expirez pendant 5 secondes. Répétez 5 minutes.",
    },
  });

  const exercise2 = await prisma.exercise.create({
    data: {
      title: "Respiration 4-7-8",
      description: "Technique de relaxation profonde pour calmer l'anxiété rapidement.",
      duration: 240,
      instructions: "Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes.",
    },
  });

  await prisma.compose.createMany({
    data: [
      { exerciseId: exercise1.id, respirationPhaseId: phaseInspir.id, phaseOrder: 1, durationSeconds: 5 },
      { exerciseId: exercise1.id, respirationPhaseId: phaseExpir.id, phaseOrder: 2, durationSeconds: 5 },
      { exerciseId: exercise2.id, respirationPhaseId: phaseInspir.id, phaseOrder: 1, durationSeconds: 4 },
      { exerciseId: exercise2.id, respirationPhaseId: phaseRetenue.id, phaseOrder: 2, durationSeconds: 7 },
      { exerciseId: exercise2.id, respirationPhaseId: phaseExpir.id, phaseOrder: 3, durationSeconds: 8 },
    ],
  });

  await prisma.handle.createMany({
    data: [
      { userId: admin.id, exerciseId: exercise1.id },
      { userId: admin.id, exerciseId: exercise2.id },
    ],
  });

  console.log("✅ Seed terminé avec succès !");
  console.log("Admin : admin@cesizen.fr / Admin1234!");
  console.log("User  : alice@cesizen.fr / User1234!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });