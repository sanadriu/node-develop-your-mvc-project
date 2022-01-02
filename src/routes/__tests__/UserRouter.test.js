const db = require("../../utils/virtual-db");
const app = require("../../server");
const data = require("../../utils/sample-data");
const { UserModel } = require("../../models");
const supertest = require("supertest");

jest.mock("../../middlewares/authMiddleware");

describe("User CRUD", () => {
  const request = supertest(app);

  beforeAll(async () => {
    await db.start();
    await db.connect();
  });

  afterAll(async () => {
    await db.stop();
  });

  describe("1. Get users", () => {
    beforeAll(async () => {
      await UserModel.insertMany(data.users);
    });

    afterAll(async () => {
      await UserModel.deleteMany();
    });

    test("1.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request.get("/users/").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("1.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request.get("/users/").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("1.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request.get("/users/").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("1.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get("/users/");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("1.5 Body 'data' is an array of users", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request.get("/users/").auth(token, { type: "bearer" });

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            uid: expect.any(String),
            email: expect.any(String),
            role: expect.any(String),
            addresses: expect.any(Array),
          }),
        ]),
      );
    });
  });

  describe("2. Get single user", () => {
    let id;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);

      id = (await UserModel.findOne().lean().exec())._id;
    });

    afterAll(async () => {
      await UserModel.deleteMany();
    });

    test("2.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("2.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("2.3. Allow users with 'customer' role to make the request of itself", async () => {
      const { uid: token, _id: id } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("2.4. Do not allow users with 'customer' role to make the request if it's not itself", async () => {
      const { _id: id } = await UserModel.findOne({ firstName: "Alice" })
        .lean()
        .exec();
      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("2.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${id}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("2.6 Body 'data' is an object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          uid: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
          addresses: expect.any(Array),
        }),
      );
    });

    test("2.7 Reply with 'not found' if user id does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/users/foo")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });

  describe("3. Create user", () => {
    const body = {
      uid: "2000",
      email: "foo@bar.com",
      firstName: "Dummy",
      lastName: "Lemon",
      phoneNumber: "+34600700800",
      phoneLocale: "es-ES",
      addresses: [
        {
          address: "Lucky Avenue, 777",
          city: "Sort",
          postalCode: "08888",
          countryCode: "ES",
        },
      ],
    };

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("3.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post("/users")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("3.2. Do not allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .post("/users")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("3.3. Allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .get("/users")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("3.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.post("/users").send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("3.6 Body 'data' is an object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post("/users")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.body.data).toEqual(
        expect.objectContaining({
          ...body,
          _id: expect.any(String),
          role: "customer",
          addresses: expect.arrayContaining([
            { ...body.addresses[0], _id: expect.any(String) },
          ]),
        }),
      );
    });
  });

  describe("4. Update user", () => {
    const body = {
      uid: "2000",
      email: "foo@bar.com",
      firstName: "Dummy",
      lastName: "Lemon",
      phoneNumber: "+34600700800",
      phoneLocale: "es-ES",
      addresses: [
        {
          address: "Lucky Avenue, 777",
          city: "Sort",
          postalCode: "08888",
          countryCode: "ES",
        },
      ],
    };

    let id;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      id = (await UserModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("4.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${id}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("4.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${id}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("4.3. Allow users with 'customer' role to make the request of itself", async () => {
      const { uid: token, _id: id } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${id}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("4.4. Do not allow users with 'customer' role to make the request if it's not itself", async () => {
      const { _id: id } = await UserModel.findOne({ firstName: "Alice" })
        .lean()
        .exec();
      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${id}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("4.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.patch(`/users/${id}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("4.6 Body 'data' is an object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${id}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.body.data).toEqual(
        expect.objectContaining({
          ...body,
          _id: expect.any(String),
          addresses: expect.arrayContaining([
            { ...body.addresses[0], _id: expect.any(String) },
          ]),
        }),
      );
    });

    test("4.7 Reply with 'not found' if user id does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch("/users/foo")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });

  describe("5. Delete user", () => {
    let id;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      id = (await UserModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("5.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("5.2. Allow users with 'main-admin' role to make the request, if they are not themselves", async () => {
      const { uid: token, _id: id } = await UserModel.findOne({
        role: "main-admin",
      })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("5.3. Do not allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("5.4. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("5.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.delete(`/users/${id}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("5.6 Body does not have 'data' property", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${id}`)
        .auth(token, { type: "bearer" });

      expect(res.body).not.toHaveProperty("data");
    });

    test("5.7 Reply with 'not found' if user id does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete("/users/foo")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });
});
