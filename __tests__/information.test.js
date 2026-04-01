const request = require("supertest");
const { app, server } = require("../server");
const prisma = require('../config/prisma');

let adminToken, createdInfoId;

beforeAll(async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "admin@cesizen.fr",
    password: "Admin1234!",
  });
  adminToken = res.body.accessToken;
});

afterAll(async () => {
  if (createdInfoId) {
    await prisma.manage.deleteMany({ where: { informationId: createdInfoId } });
    await prisma.information.deleteMany({ where: { id: createdInfoId } });
  }
  await prisma.$disconnect();
  server.close();
});

describe("Informations", () => {
  test("GET /api/informations - public, liste les infos actives", async () => {
    const res = await request(app).get("/api/informations");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/informations - admin crée une information", async () => {
    const res = await request(app)
      .post("/api/informations")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test info Jest",
        description: "Description de test",
        content: "Contenu de test complet",
        category: "Test",
      });
    expect(res.statusCode).toBe(201);
    createdInfoId = res.body.information.id;
  });

  test("PUT /api/informations/:id - admin modifie", async () => {
    const res = await request(app)
      .put(`/api/informations/${createdInfoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test modifié", description: "Desc", content: "Contenu", category: "Test", status: true });
    expect(res.statusCode).toBe(200);
  });

  test("DELETE /api/informations/:id - admin supprime", async () => {
    const res = await request(app)
      .delete(`/api/informations/${createdInfoId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    createdInfoId = null;
  });
});