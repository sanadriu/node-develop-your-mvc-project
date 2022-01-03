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
    let idUser;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);

      idUser = (await UserModel.findOne().lean().exec())._id;
    });

    afterAll(async () => {
      await UserModel.deleteMany();
    });

    test("2.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}`)
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
        .get(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("2.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("2.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({ firstName: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("2.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${idUser}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("2.6. Body 'data' is an object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}`)
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

    test("2.7. Reply with 'not found' if user id does not exist", async () => {
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

    test("3.5. Body 'data' is an object", async () => {
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

    let idUser;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      idUser = (await UserModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("4.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}`)
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
        .patch(`/users/${idUser}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("4.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("4.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({ firstName: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("4.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.patch(`/users/${idUser}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("4.6. Body 'data' is an object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}`)
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

    test("4.7. Reply with 'not found' if user id does not exist", async () => {
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
    let idUser;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      idUser = (await UserModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("5.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("5.2. Do not allow users with 'main-admin' role to delete themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "main-admin",
      })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}`)
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
        .delete(`/users/${idUser}`)
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
        .delete(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("5.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.delete(`/users/${idUser}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("5.6. Body does not have 'data' property", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.body).not.toHaveProperty("data");
    });

    test("5.7. Reply with 'not found' if user id does not exist", async () => {
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

  describe("6. Get addresses", () => {
    let idUser;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);
      idUser = (await UserModel.findOne().lean().exec())._id;
    });

    afterAll(async () => {
      await UserModel.deleteMany();
    });

    test("6.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("6.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("6.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("6.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({ firstName: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("6.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${idUser}/addresses`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("6.6 Body 'data' is an array of addresses", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          {
            _id: expect.any(String),
            address: expect.any(String),
            city: expect.any(String),
            postalCode: expect.any(String),
            countryCode: expect.any(String),
          },
        ]),
      );
    });
  });

  describe("7. Get single address", () => {
    let idUser;
    let idAddress;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);
      const user = await UserModel.findOne({ "addresses.0": { $exists: true } })
        .lean()
        .exec();

      idUser = user._id;
      idAddress = user.addresses[0]._id;
    });

    afterAll(async () => {
      await UserModel.deleteMany();
    });

    test("7.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("7.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("7.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
        "addresses.0": { $exists: true },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("7.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({
        "addresses.0": { $exists: true },
        firstName: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("7.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${idUser}/addresses/${idAddress}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("7.6 Body 'data' is an address object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.body.data).toEqual({
        _id: expect.any(String),
        address: expect.any(String),
        city: expect.any(String),
        postalCode: expect.any(String),
        countryCode: expect.any(String),
      });
    });
  });

  describe("8. Add address", () => {
    const body = {
      address: "Somewhere",
      city: "Over the Rainbow",
      postalCode: "07777",
      countryCode: "ES",
    };

    let idUser;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      idUser = (await UserModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("8.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("8.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .post(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("8.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
        "addresses.0": { $exists: true },
      })
        .lean()
        .exec();

      const res = await request
        .post(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("8.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({
        "addresses.0": { $exists: true },
        firstName: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .post(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("8.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.post(`/users/${idUser}/addresses`).send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("8.6. Body 'data' is an address object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.body.data).toEqual({
        _id: expect.any(String),
        ...body,
      });
    });
  });

  describe("9. Update address", () => {
    const body = {
      address: "Somewhere",
      city: "Over the Rainbow",
      postalCode: "07777",
      countryCode: "ES",
    };

    let idUser;
    let idAddress;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      const user = await UserModel.findOne({ "addresses.0": { $exists: true } })
        .lean()
        .exec();

      idUser = user._id;
      idAddress = user.addresses[0]._id;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("9.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("9.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("9.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
        "addresses.0": { $exists: true },
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("9.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({
        "addresses.0": { $exists: true },
        firstName: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstName: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("9.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request
        .patch(`/users/${idUser}/addresses/${idAddress}`)
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("9.6. Body 'data' is an address object", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${idAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.body.data).toEqual({
        _id: expect.any(String),
        ...body,
      });
    });
  });
});
