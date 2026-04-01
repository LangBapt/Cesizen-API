const request = require("supertest");
const { app, server } = require("../server");
const prisma = require('../config/prisma');

let adminToken, createdExerciseId, phaseId;

beforeAll(async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "admin@cesizen.fr",
    password: "Admin1234!",
  });
  adminToken = res.body.accessToken;
  const phases = await request(app).get("/api/exercises/phases");
  phaseId = phases.body[0]?.id;
});

afterAll(async () => {
  if (createdExerciseId) {
    await prisma.compose.deleteMany({ where: { exerciseId: createdExerciseId } });
    await prisma.handle.deleteMany({ where: { exerciseId: createdExerciseId } });
    await prisma.exercise.deleteMany({ where: { id: createdExerciseId } });
  }
  await prisma.$disconnect();
  server.close();
});

describe("Exercices de respiration", () => {
  test("GET /api/exercises - public, liste les exercices", async () => {
    const res = await request(app).get("/api/exercises");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/exercises - admin crée un exercice", async () => {
    const res = await request(app)
      .post("/api/exercises")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test exercice Jest",
        description: "Exercice de test",
        duration: 120,
        instructions: "Instructions de test",
        phases: phaseId ? [{ respirationPhaseId: phaseId, phaseOrder: 1, durationSeconds: 4 }] : [],
      });
    expect(res.statusCode).toBe(201);
    createdExerciseId = res.body.exercise.id;
  });

  test("GET /api/exercises/:id - récupérer un exercice", async () => {
    const res = await request(app).get(`/api/exercises/${createdExerciseId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("composes");
  });

  test("DELETE /api/exercises/:id - admin supprime", async () => {
    const res = await request(app)
      .delete(`/api/exercises/${createdExerciseId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    createdExerciseId = null;
  });
});