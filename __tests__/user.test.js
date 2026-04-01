const request = require("supertest");
const { app, server } = require("../server");
const prisma = require('../config/prisma');

let adminToken, userToken, testUserId;

beforeAll(async () => {
  const adminLogin = await request(app).post("/api/auth/login").send({
    email: "admin@cesizen.fr",
    password: "Admin1234!",
  });
  adminToken = adminLogin.body.accessToken;

  const reg = await request(app).post("/api/auth/register").send({
    username: "testuser_user",
    email: "testuser_user@test-cesizen.fr",
    password: "Test1234!",
  });
  userToken = reg.body.accessToken;
  testUserId = reg.body.user.id;
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany({ where: { user: { email: { contains: "@test-cesizen.fr" } } } });
  await prisma.user.deleteMany({ where: { email: { contains: "@test-cesizen.fr" } } });
  await prisma.$disconnect();
  server.close();
});

describe("Users - Admin", () => {
  test("GET /api/users - admin peut lister", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/users - user ne peut pas lister", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  test("PUT /api/users/:id/toggle - admin peut désactiver", async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}/toggle`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  test("PUT /api/users/:id/role - admin peut changer le rôle", async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "ADMIN" });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe("ADMIN");
  });
});