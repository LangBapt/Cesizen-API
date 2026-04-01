const request = require("supertest");
const { app, server } = require("../server");
const prisma = require('../config/prisma');

afterAll(async () => {
  await prisma.refreshToken.deleteMany({ where: { user: { email: { contains: "@test-cesizen.fr" } } } });
  await prisma.user.deleteMany({ where: { email: { contains: "@test-cesizen.fr" } } });
  await prisma.$disconnect();
  server.close();
});

describe("Auth - Register", () => {
  test("POST /api/auth/register - succès", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser_auth",
      email: "testuser_auth@test-cesizen.fr",
      password: "Test1234!",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  test("POST /api/auth/register - email déjà utilisé", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser_auth2",
      email: "testuser_auth@test-cesizen.fr",
      password: "Test1234!",
    });
    expect(res.statusCode).toBe(409);
  });

  test("POST /api/auth/register - champs manquants", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "x@test-cesizen.fr" });
    expect(res.statusCode).toBe(400);
  });
});

describe("Auth - Login", () => {
  test("POST /api/auth/login - succès", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser_auth@test-cesizen.fr",
      password: "Test1234!",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  test("POST /api/auth/login - mauvais mot de passe", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser_auth@test-cesizen.fr",
      password: "WrongPass",
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("Auth - Refresh Token", () => {
  let refreshToken;

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser_auth@test-cesizen.fr",
      password: "Test1234!",
    });
    refreshToken = res.body.refreshToken;
  });

  test("POST /api/auth/refresh - succès", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  test("POST /api/auth/refresh - token manquant", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});
    expect(res.statusCode).toBe(401);
  });
});