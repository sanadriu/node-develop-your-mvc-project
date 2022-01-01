const db = require("../../utils/virtual-db");
const ProductModel = require("../ProductModel");
const generateRandomSequence = require("../../utils/generateRandomSequence");
const deepClone = require("../../utils/deepClone");

describe("Product Schema", () => {
  beforeAll(async () => {
    await db.start();
    await db.connect();
  });

  afterEach(async () => {
    await db.clearCollection("users");
  });

  afterAll(async () => {
    await db.stop();
  });

  const correctProductData = [
    {
      title: "Flaming bonsai",
      price: 14.99,
      stock: 45,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt sem id diam suscipit, quis commodo urna aliquam. Etiam maximus posuere congue. Maecenas congue felis sit amet dui bibendum, et accumsan arcu consequat.",
      images: [
        "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1929&q=80",
      ],
    },
  ];

  describe("1. title:", () => {
    test("1.1. title is required", async () => {
      expect.assertions(2);

      const { title, ...productData } = correctProductData[0];

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.title.properties.type).toBe("required");
        expect(error.errors.title.properties.message).toBe("Title is required");
      }
    });

    test("1.2. title is trimmed", async () => {
      const productData = {
        ...correctProductData[0],
        title: ` ${correctProductData[0].title} `,
      };

      const product = await ProductModel.create(productData);

      expect(product.title).toBe(correctProductData[0].title);
    });

    test("1.3. title max length is 64", async () => {
      expect.assertions(2);

      const productData = {
        ...correctProductData[0],
        title: generateRandomSequence(65),
      };

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.title.properties.type).toBe("maxlength");
        expect(error.errors.title.properties.message).toBe("Title length must not be longer than 64 characters");
      }
    });
  });

  describe("2. description:", () => {
    test("2.1. description is trimmed", async () => {
      const productData = {
        ...correctProductData[0],
        description: ` ${correctProductData[0].description} `,
      };

      const product = await ProductModel.create(productData);

      expect(product.description).toBe(correctProductData[0].description);
    });

    test("2.2. description max length is 64", async () => {
      expect.assertions(2);

      const productData = {
        ...correctProductData[0],
        description: generateRandomSequence(513),
      };

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.description.properties.type).toBe("maxlength");
        expect(error.errors.description.properties.message).toBe(
          "Description length must not be longer than 512 characters",
        );
      }
    });
  });

  describe("3. price:", () => {
    test("3.1. price is required", async () => {
      expect.assertions(2);

      const { price, ...productData } = correctProductData[0];

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.price.properties.type).toBe("required");
        expect(error.errors.price.properties.message).toBe("Price is required");
      }
    });

    test("3.2. price must be numeric", async () => {
      const productData = {
        ...correctProductData[0],
        price: "zero",
      };

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.price.reason.code).toBe("ERR_ASSERTION");
      }
    });

    test("3.3. price must be greater or equal than 0", async () => {
      expect.assertions(2);

      const productData = {
        ...correctProductData[0],
        price: -1,
      };

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.price.properties.type).toBe("min");
        expect(error.errors.price.properties.message).toBe("Price must be greater or equal than 0");
      }
    });
  });

  describe("4. stock:", () => {
    test("4.1. stock has a default value of 0", async () => {
      const { stock, ...productData } = correctProductData[0];

      const product = await ProductModel.create(productData);

      expect(product).toHaveProperty("stock", 0);
    });

    test("4.2. stock must be numeric", async () => {
      const productData = {
        ...correctProductData[0],
        stock: "one",
      };

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.stock.reason.code).toBe("ERR_ASSERTION");
      }
    });

    test("4.3. stock must be greater or equal than 0", async () => {
      expect.assertions(2);

      const productData = {
        ...correctProductData[0],
        stock: -1,
      };

      try {
        await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors.stock.properties.type).toBe("min");
        expect(error.errors.stock.properties.message).toBe("Stock must be greater or equal than 0");
      }
    });
  });

  describe("5. images:", () => {
    test("5.1. image URL is trimmed", async () => {
      const productData = deepClone(correctProductData[0]);

      productData.images[0] = ` ${correctProductData[0].images[0]} `;

      const product = await ProductModel.create(productData);

      expect(product.images[0]).toBe(correctProductData[0].images[0]);
    });

    test("5.2. image URL is valid", async () => {
      expect.assertions(2);

      const url = generateRandomSequence(16);
      const productData = deepClone(correctProductData[0]);

      productData.images[0] = url;

      try {
        product = await ProductModel.create(productData);
      } catch (error) {
        expect(error.errors["images.0"].properties.type).toBe("user defined");
        expect(error.errors["images.0"].properties.message).toBe(`${url} is not a valid URL for images`);
      }
    });
  });
});
