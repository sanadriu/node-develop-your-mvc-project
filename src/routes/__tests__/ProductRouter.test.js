const db = require("../../utils/virtual-db");
const app = require("../../server");
const data = require("../../utils/sample-data");
const { ProductModel, UserModel } = require("../../models");
const { Types } = require("mongoose");
const supertest = require("supertest");

jest.mock("../../middlewares/authMiddleware");

describe("product-crud-operations", () => {
  const request = supertest(app);

  beforeAll(async () => {
    await db.start();
    await db.connect();

    await UserModel.insertMany(data.users);
  });

  afterAll(async () => {
    await UserModel.deleteMany();

    await db.stop();
  });

  describe("1. Get Products", () => {
    beforeAll(async () => {
      await ProductModel.insertMany(data.products);
    });

    afterAll(async () => {
      await ProductModel.deleteMany();
    });

    test("1.1. Successful operation returns an array of products", async () => {
      const res = await request.get("/products");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
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

    test("1.2. Successful operation if specified page exists", async () => {
      const res = await request.get("/products?page=1");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("currentPage", expect.any(Number));
      expect(res.body).toHaveProperty("lastPage", expect.any(Number));
    });

    test("1.3. Reply with 'not found' if the specified page does not exist", async () => {
      const res = await request.get("/products?page=1000");

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
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

  describe("4. Update product", () => {
    const body = {
      title: "Magic Mushroom",
      price: 3.99,
      stock: 100,
      description: "Mmm... Delicious",
      images: [
        "https://cdn.pixabay.com/photo/2018/08/06/16/30/mushroom-3587888_960_720.jpg",
      ],
    };

    let idProduct;

    beforeEach(async () => {
      await ProductModel.insertMany(data.products);
      idProduct = (await ProductModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await ProductModel.deleteMany();
    });

    test("4.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/products/${idProduct}`)
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
        .patch(`/products/${idProduct}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("4.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({
        role: "customer",
      })
        .lean()
        .exec();

      const res = await request
        .patch(`/products/${idProduct}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("4.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.patch(`/products/${idProduct}`).send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("4.5. Successful operation returns the updated product", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .patch(`/products/${idProduct}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toMatchObject(body);
    });

    test("4.6. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idProduct = "foo";

      const res = await request
        .patch(`/products/${idProduct}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong product ID");
    });

    test("4.7. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idProduct = new Types.ObjectId().toString();

      const res = await request
        .patch(`/products/${idProduct}`)
        .auth(token, { type: "bearer" })
        .send(body);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });

  describe("5. Delete product", () => {
    let idProduct;

    beforeEach(async () => {
      await ProductModel.insertMany(data.products);
      idProduct = (await ProductModel.findOne().lean().exec())._id;
    });

    afterEach(async () => {
      await ProductModel.deleteMany();
    });

    test("5.1. Allow users with 'main-admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/products/${idProduct}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("5.2. Allow users with 'admin' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/products/${idProduct}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("5.3. Do not allow users with 'customer' role to make the request", async () => {
      const { uid: token } = await UserModel.findOne({ role: "customer" })
        .lean()
        .exec();

      const res = await request
        .delete(`/products/${idProduct}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Forbidden");
    });

    test("5.4. Do not allow unauthenticated users to make the request", async () => {
      const res = await request.delete(`/products/${idProduct}`);

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not authorized");
    });

    test("5.5. Successful operation only returns 'success' as true", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const res = await request
        .delete(`/products/${idProduct}`)
        .auth(token, { type: "bearer" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).not.toHaveProperty("data");
    });

    test("5.6. Reply with 'bad request' if the id is invalid", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idProduct = "foo";

      const res = await request
        .delete(`/products/${idProduct}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Wrong product ID");
    });

    test("5.7. Reply with 'not found' if the user does not exist", async () => {
      const { uid: token } = await UserModel.findOne({ role: "main-admin" })
        .lean()
        .exec();

      const idProduct = new Types.ObjectId().toString();

      const res = await request
        .delete(`/products/${idProduct}`)
        .auth(token, { type: "bearer" });

      expect(res.headers["content-type"]).toMatch("application/json");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Not found");
    });
  });
});
