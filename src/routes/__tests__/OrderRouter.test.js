const db = require("../../utils/virtual-db");
const app = require("../../server");
const data = require("../../utils/sample-data");
const { ProductModel, UserModel } = require("../../models");
const { Types } = require("mongoose");
const supertest = require("supertest");

jest.mock("../../middlewares/authMiddleware");

describe.skip("Order CRUD operations", () => {
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
      await ProductModel.insertMany(data.products);
    });

    afterAll(async () => {
      await ProductModel.deleteMany();
    });

    test("1.1. Allow users with 'customer' role to make the request", async () => {
      const { uid: token } = UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .get("/products")
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            title: expect.any(String),
            price: expect.any(Number),
            stock: expect.any(Number),
            description: expect.any(String),
            images: expect.arrayContaining([expect.any(String)]),
          }),
        ]),
      );
    });

    test("1.6. Successful operation returns an array of orders", async () => {
      const res = await request.get("/products");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            title: expect.any(String),
            price: expect.any(Number),
            stock: expect.any(Number),
            description: expect.any(String),
            images: expect.arrayContaining([expect.any(String)]),
          }),
        ]),
      );
    });
  });

  describe("2. Get single product", () => {
    let idProduct;

    beforeAll(async () => {
      await ProductModel.insertMany(data.products);

      idProduct = (await ProductModel.findOne().lean().exec())._id;
    });

    afterAll(async () => {
      await ProductModel.deleteMany();
    });

    test("2.1. Successful operation returns a product", async () => {
      const res = await request.get(`/products/${idProduct}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          price: expect.any(Number),
          stock: expect.any(Number),
          description: expect.any(String),
          images: expect.arrayContaining([expect.any(String)]),
        }),
      );
    });

    test("2.2. Reply with 'bad request' if the id is invalid", async () => {
      const idProduct = "foo";

      const res = await request.get(`/products/${idProduct}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong product ID");
    });

    test("2.3. Reply with 'not found' if the user does not exist", async () => {
      const idProduct = new Types.ObjectId().toString();

      const res = await request.get(`/products/${idProduct}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("3. Create product", () => {
    const body = {
      title: "Magic Mushroom",
      price: 3.99,
      stock: 100,
      description: "Mmm... Delicious",
      images: [
        "https://cdn.pixabay.com/photo/2018/08/06/16/30/mushroom-3587888_960_720.jpg",
      ],
    };

    beforeEach(async () => {
      await ProductModel.insertMany(data.products);
    });

    afterEach(async () => {
      await ProductModel.deleteMany();
    });

    test("3.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post("/products")
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
        .post("/products")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
    });

    test("3.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .post("/products")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("3.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.post("/products").send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("3.5. Successful operation returns the new product", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .post("/products")
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toMatchObject(body);
    });
  });
});
