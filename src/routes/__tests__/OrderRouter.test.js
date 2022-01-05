const db = require("../../utils/virtual-db");
const app = require("../../server");
const data = require("../../utils/sample-data");
const { ProductModel, UserModel, OrderModel } = require("../../models");
const { Types } = require("mongoose");
const supertest = require("supertest");

jest.mock("../../middlewares/authMiddleware");

describe("order-crud-operations", () => {
  const request = supertest(app);

  beforeAll(async () => {
    await db.start();
    await db.connect();

    await UserModel.insertMany(data.users);
    await ProductModel.insertMany(data.products);
  });

  afterAll(async () => {
    await UserModel.deleteMany();
    await ProductModel.deleteMany();

    await db.stop();
  });

  describe("1. Get Orders", () => {
    beforeAll(async () => {
      await OrderModel.insertMany(await data.orders());
    });

    afterAll(async () => {
      await OrderModel.deleteMany();
    });

    test("1.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request.get("/orders").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("1.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request.get("/orders").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("1.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request.get("/orders").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("1.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get("/orders");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("1.5. Successful operation returns an array of orders", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request.get("/orders").auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            idUser: expect.any(String),
            shippingCost: expect.any(Number),
            shippingAddress: {
              address: expect.any(String),
              city: expect.any(String),
              postalCode: expect.any(String),
              countryCode: expect.any(String),
            },
            products: expect.arrayContaining([
              {
                idProduct: expect.any(String),
                price: expect.any(Number),
                units: expect.any(Number),
              },
            ]),
          }),
        ]),
      );
    });

    test("1.6. Successful operation if specified page exists", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/orders?page=1")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
    });

    test("1.7. Reply with 'bad request' if the specified page is not a number", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/orders?page=foo")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong page number");
    });

    test("1.8. Reply with 'not found' if the specified page does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get("/orders?page=1000")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("2. Get single order", () => {
    let idOrder;

    beforeAll(async () => {
      await OrderModel.insertMany(await data.orders());

      idOrder = (await OrderModel.findOne().lean().exec())._id;
    });

    afterAll(async () => {
      await OrderModel.deleteMany();
    });

    test("2.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/orders/${idOrder}`)
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
        .get(`/orders/${idOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("2.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .get(`/orders/${idOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("2.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.get(`/orders/${idOrder}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("2.5. Successful operation returns an order", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .get(`/orders/${idOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          idUser: expect.any(String),
          shippingCost: expect.any(Number),
          shippingAddress: {
            address: expect.any(String),
            city: expect.any(String),
            postalCode: expect.any(String),
            countryCode: expect.any(String),
          },
          products: expect.arrayContaining([
            {
              idProduct: expect.any(String),
              price: expect.any(Number),
              units: expect.any(Number),
            },
          ]),
        }),
      );
    });

    test("2.6. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idOrder = "foo";

      const res = await request
        .get(`/orders/${idOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong order ID");
    });

    test("2.7. Reply with 'not found' if the order does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idOrder = new Types.ObjectId().toString();

      const res = await request
        .get(`/orders/${idOrder}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("3. Create order", () => {
    let idUser;
    let idProducts;
    let body;

    beforeAll(async () => {
      idUser = (await UserModel.findOne().lean().exec())._id.toString();
      idProducts = (await ProductModel.find().lean().exec()).map((product) =>
        product._id.toString(),
      );

      body = {
        idUser: idUser,
        shippingCost: 15,
        shippingAddress: {
          address: "Le Baguette, 42",
          countryCode: "FR",
          postalCode: "69000",
          city: "Lyon",
        },
        products: [
          {
            idProduct: idProducts[1],
            price: 109.95,
            units: 1,
          },
          {
            idProduct: idProducts[2],
            price: 55.99,
            units: 9,
          },
        ],
      };
    });

    beforeEach(async () => {
      await OrderModel.insertMany(await data.orders());
    });

    afterEach(async () => {
      await OrderModel.deleteMany();
    });

    test("3.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post("/orders")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("3.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .post("/orders")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("3.3. Allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .post("/orders")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("3.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.post("/orders").send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("3.5. Successful operation returns the new order with the corresponding user ID", async () => {
      const { uid: token, _id: idUser } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .post("/orders")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toMatchObject({ ...body, idUser });
    });
  });
});
