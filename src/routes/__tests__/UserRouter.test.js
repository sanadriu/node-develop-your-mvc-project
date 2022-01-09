const db = require("../../utils/virtual-db");
const app = require("../../server");
const data = require("../../utils/sample-data");
const { UserModel, OrderModel, ProductModel } = require("../../models");
const { Types } = require("mongoose");
const supertest = require("supertest");

jest.mock("../../middlewares/authMiddleware");
jest.mock("../../services/firebase");

describe("user-crud-operations", () => {
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

      const res = await request.get("/users").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("1.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request.get("/users").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("1.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request.get("/users").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("1.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get("/users");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("1.5. Successful operation returns an array of users", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request.get("/users").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            uid: expect.any(String),
            email: expect.any(String),
            role: expect.any(String),
            addresses: expect.arrayContaining([
              {
                address: expect.any(String),
                city: expect.any(String),
                postalCode: expect.any(String),
                countryCode: expect.any(String),
              },
            ]),
          }),
        ]),
      );
    });

    test("1.6. Reply with 'bad request' if the specified page is not a number", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/users?page=foo")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong page number");
    });

    test("1.7. Reply with 'not found' if the specified page does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/users?page=1000")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("1.8. Successful operation if specified page exists", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/users?page=1")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
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
      const { _id: idUser } = await UserModel.findOne({ firstname: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
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

    test("2.6. Successful operation returns a user", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          uid: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
          addresses: expect.arrayContaining([
            {
              address: expect.any(String),
              city: expect.any(String),
              postalCode: expect.any(String),
              countryCode: expect.any(String),
            },
          ]),
        }),
      );
    });

    test("2.7. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/users/foo")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("2.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .get(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("3. Create user", () => {
    const body = {
      email: "foo@bar.com",
      firstname: "Dummy",
      lastname: "Lemon",
      phoneNumber: "+34600700800",
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

    test("3.3. Do not allow users with 'customer' role to make the request", async () => {
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

    test("3.5. Successful operation returns the new user", async () => {
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
      expect(res.body.data).toMatchObject({ ...body, uid: expect.any(String) });
    });
  });

  describe("4. Update user", () => {
    const body = {
      uid: "2000",
      email: "foo@bar.com",
      firstname: "Dummy",
      lastname: "Lemon",
      phoneNumber: "+34600700800",
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
      const { _id: idUser } = await UserModel.findOne({ firstname: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
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
      const res = await request.patch(`/users/${idUser}`).send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("4.6. Successful operation returns the updated user", async () => {
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
      expect(res.body.data).toMatchObject(body);
    });

    test("4.7. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch("/users/foo")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("4.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .patch(`/users/${idUser}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
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

    test("5.6. Successful operation only returns 'success' as true", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).not.toHaveProperty("data");
    });

    test("5.7. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete("/users/foo")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("5.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .delete(`/users/${idUser}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
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
      const { _id: idUser } = await UserModel.findOne({ firstname: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
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

    test("6.6 Successful operation returns a list of addresses", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          {
            address: expect.any(String),
            city: expect.any(String),
            postalCode: expect.any(String),
            countryCode: expect.any(String),
          },
        ]),
      );
    });

    test("6.7. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/users/foo/addresses")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("6.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("7. Get single address", () => {
    let idUser;
    let numAddress;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);
      const user = await UserModel.findOne({ "addresses.0": { $exists: true } })
        .lean()
        .exec();

      idUser = user._id;
      numAddress = 1;
    });

    afterAll(async () => {
      await UserModel.deleteMany();
    });

    test("7.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
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
        .get(`/users/${idUser}/addresses/${numAddress}`)
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
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("7.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({
        "addresses.0": { $exists: true },
        firstname: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("7.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${idUser}/addresses/${numAddress}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("7.6. Successful operation returns an address", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual({
        address: expect.any(String),
        city: expect.any(String),
        postalCode: expect.any(String),
        countryCode: expect.any(String),
      });
    });

    test("7.7. Reply with 'bad request' if the user id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = "foo";

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("7.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("7.9. Reply with 'bad request' if the address id is not a positive integer (zero excluded)", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numAddress = -1;

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong address number");
    });

    test("7.10. Reply with 'not found' if the address does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numAddress = 10;

      const res = await request
        .get(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
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
        firstname: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
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

    test("8.6. Successful operation returns the new address", async () => {
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
      expect(res.body.data).toMatchObject(body);
    });

    test("8.7. Reply with 'bad request' if the user id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = "foo";

      const res = await request
        .post(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("8.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .get(`/users/${idUser}/addresses`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
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
    let numAddress;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      const user = await UserModel.findOne({ "addresses.0": { $exists: true } })
        .lean()
        .exec();

      idUser = user._id;
      numAddress = 1;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("9.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
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
        .patch(`/users/${idUser}/addresses/${numAddress}`)
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
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("9.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({
        "addresses.0": { $exists: true },
        firstname: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("9.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("9.6. Successful operation returns the updated address", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toMatchObject(body);
    });

    test("9.7. Reply with 'bad request' if the user id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = "foo";

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("9.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("9.9. Reply with 'bad request' if the address id is not a positive integer (zero excluded)", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numAddress = -1;

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong address number");
    });

    test("9.10. Reply with 'not found' if the address does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numAddress = 10;

      const res = await request
        .patch(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("10. Delete address", () => {
    let idUser;
    let numAddress;

    beforeEach(async () => {
      await UserModel.insertMany(data.users);
      const user = await UserModel.findOne({ "addresses.0": { $exists: true } })
        .lean()
        .exec();

      idUser = user._id;
      numAddress = 1;
    });

    afterEach(async () => {
      await UserModel.deleteMany();
    });

    test("10.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("10.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("10.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
        "addresses.0": { $exists: true },
      })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("10.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({
        "addresses.0": { $exists: true },
        firstname: "Alice",
      })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("10.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.delete(
        `/users/${idUser}/addresses/${numAddress}`,
      );

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("10.6. Successful operation returns 'success' as true", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).not.toHaveProperty("data");
    });

    test("10.7. Reply with 'bad request' if the user id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = "foo";

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("10.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("10.9. Reply with 'bad request' if the address id is not a positive integer (zero excluded)", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numAddress = -1;

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong address number");
    });

    test("10.10. Reply with 'not found' if the address does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numAddress = 10;

      const res = await request
        .delete(`/users/${idUser}/addresses/${numAddress}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("11. Get orders", () => {
    let idUser;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);
      await ProductModel.insertMany(data.products);
      await OrderModel.insertMany(await data.orders());

      idUser = (await OrderModel.findOne().lean().exec()).user;
    });

    afterAll(async () => {
      await OrderModel.deleteMany();
      await ProductModel.deleteMany();
      await UserModel.deleteMany();
    });

    test("11.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("11.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("11.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("11.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const { _id: idUser } = await UserModel.findOne({ firstname: "Alice" })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("11.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${idUser}/orders`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("11.6. Successful operation returns an array of orders", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          {
            _id: expect.any(String),
            shippingCost: expect.any(Number),
            shippingAddress: {
              address: expect.any(String),
              city: expect.any(String),
              postalCode: expect.any(String),
              countryCode: expect.any(String),
            },
            products: expect.arrayContaining([
              {
                product: expect.objectContaining({
                  _id: expect.any(String),
                  title: expect.any(String),
                  images: expect.arrayContaining([expect.any(String)]),
                }),
                price: expect.any(Number),
                units: expect.any(Number),
              },
            ]),
            createdAt: expect.any(String),
          },
        ]),
      );
    });

    test("11.7. Reply with 'bad request' if the user id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = "foo";

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("11.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("1.9. Reply with 'bad request' if the specified page is not a number", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders?page=foo`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong page number");
    });

    test("11.10. Reply with 'not found' if the specified page does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders?page=1000`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("11.11. Successful operation if specified page exists", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders?page=1`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
    });
  });

  describe("12. Get single order", () => {
    let idUser;
    let numOrder;

    beforeAll(async () => {
      await UserModel.insertMany(data.users);
      await ProductModel.insertMany(data.products);
      await OrderModel.insertMany(await data.orders());

      idUser = (await OrderModel.findOne().lean().exec()).user;
      numOrder = 1;
    });

    afterAll(async () => {
      await OrderModel.deleteMany();
      await ProductModel.deleteMany();
      await UserModel.deleteMany();
    });

    test("12.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("12.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("12.3. Allow users with 'customer' role to make the request of themselves", async () => {
      const {
        user: { _id: idUser, uid: token },
      } = await OrderModel.findOne()
        .populate({
          path: "user",
          select: "uid _id",
          match: { role: "customer" },
        })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("12.4. Do not allow users with 'customer' role to make the request if they are not themselves", async () => {
      const {
        user: { _id: idUser },
      } = await OrderModel.findOne()
        .populate({
          path: "user",
          select: "uid _id",
          match: { firstname: "Alice" },
        })
        .lean()
        .exec();

      const { uid: token } = await UserModel.findOne({
        role: "customer",
        firstname: { $ne: "Alice" },
      })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("12.5. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/users/${idUser}/orders/${numOrder}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("12.6. Successful operation returns an order", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual({
        _id: expect.any(String),
        shippingCost: expect.any(Number),
        shippingAddress: {
          address: expect.any(String),
          city: expect.any(String),
          postalCode: expect.any(String),
          countryCode: expect.any(String),
        },
        products: expect.arrayContaining([
          {
            product: expect.objectContaining({
              _id: expect.any(String),
              title: expect.any(String),
              images: expect.arrayContaining([expect.any(String)]),
            }),
            price: expect.any(Number),
            units: expect.any(Number),
          },
        ]),
        createdAt: expect.any(String),
      });
    });

    test("12.7. Reply with 'bad request' if the user id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = "foo";

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong user ID");
    });

    test("12.8. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idUser = new Types.ObjectId().toString();

      const res = await request
        .get(`/users/${idUser}/orders`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });

    test("12.9. Reply with 'bad request' if the order is not a positive number (zero excluded)", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numOrder = -1;

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong order number");
    });

    test("12.10. Reply with 'not found' if the order does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const numOrder = 1000;

      const res = await request
        .get(`/users/${idUser}/orders/${numOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });
});
