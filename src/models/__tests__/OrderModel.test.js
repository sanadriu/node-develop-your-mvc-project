const db = require("../../services/db");
const data = require("../../data");
const OrderModel = require("../OrderModel");
const UserModel = require("../UserModel");
const ProductModel = require("../ProductModel");
const { generateRandomSequence, deepClone } = require("../../utils");

describe("Order Schema", () => {
  let idUser;
  let idProducts;
  let correctOrderData;

  beforeAll(async () => {
    await db.start();
    await db.connect();

    await UserModel.insertMany(data.users);
    await ProductModel.insertMany(data.products);

    idUser = (await UserModel.findOne().lean().exec())._id.toString();
    idProducts = (await ProductModel.find().lean().exec()).map((product) => product._id.toString());

    correctOrderData = {
      user: idUser,
      shippingCost: 5,
      shippingAddress: {
        address: "False Street, 123",
        countryCode: "ES",
        postalCode: "09999",
        city: "Barcelona",
      },
      products: [
        {
          product: idProducts[0],
          price: 109.95,
          units: 1,
        },
        {
          product: idProducts[1],
          price: 22.3,
          units: 2,
        },
      ],
    };
  });

  beforeEach(async () => {
    await OrderModel.deleteMany();
  });

  afterAll(async () => {
    await UserModel.deleteMany();
    await ProductModel.deleteMany();

    await db.disconnect();
    await db.stop();
  });

  describe("1 user:", () => {
    test("1.1. user ID is required", async () => {
      expect.assertions(2);

      const { user, ...orderData } = correctOrderData;

      try {
        await OrderModel.create(orderData);
      } catch (error) {
        expect(error.errors.user.properties.type).toBe("required");
        expect(error.errors.user.properties.message).toBe("User ID is required");
      }
    });

    test("1.2. user ID must be of type ObjectId", async () => {
      expect.assertions(1);

      const { user, ...orderData } = correctOrderData;
      orderData.user = "foo";

      try {
        await OrderModel.create(orderData);
      } catch (error) {
        expect(error.errors.user.kind).toBe("ObjectId");
      }
    });
  });

  describe("2. shipping address ", () => {
    describe("2.1. address", () => {
      test("2.1.1. address is required", async () => {
        expect.assertions(2);

        const orderData = deepClone(correctOrderData);
        delete orderData.shippingAddress.address;

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.address"].properties.type).toBe("required");
          expect(error.errors["shippingAddress.address"].properties.message).toBe(
            "Address is required",
          );
        }
      });

      test("2.1.2. address is trimmed", async () => {
        expect.assertions(1);

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.address = ` ${correctOrderData.shippingAddress.address} `;

        await expect(OrderModel.create(orderData)).resolves.toHaveProperty(
          "shippingAddress.address",
          correctOrderData.shippingAddress.address,
        );
      });

      test("2.1.3. address max length is 64", async () => {
        expect.assertions(2);

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.address = generateRandomSequence(65);

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.address"].properties.type).toBe("maxlength");
          expect(error.errors["shippingAddress.address"].properties.message).toBe(
            "Address length must not be longer than 64 characters",
          );
        }
      });
    });

    describe("2.2. city", () => {
      test("2.2.1. city is required", async () => {
        expect.assertions(2);

        const orderData = deepClone(correctOrderData);
        delete orderData.shippingAddress.city;

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.city"].properties.type).toBe("required");
          expect(error.errors["shippingAddress.city"].properties.message).toBe("City is required");
        }
      });

      test("2.2.2. city is trimmed", async () => {
        expect.assertions(1);

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.city = ` ${correctOrderData.shippingAddress.city} `;

        await expect(OrderModel.create(orderData)).resolves.toHaveProperty(
          "shippingAddress.city",
          correctOrderData.shippingAddress.city,
        );
      });

      test("2.2.3. city max length is 64", async () => {
        expect.assertions(2);

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.city = generateRandomSequence(65);

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.city"].properties.type).toBe("maxlength");
          expect(error.errors["shippingAddress.city"].properties.message).toBe(
            "City length must not be longer than 64 characters",
          );
        }
      });
    });

    describe("2.3. country code", () => {
      test("2.3.1. country code is required", async () => {
        expect.assertions(2);

        const orderData = deepClone(correctOrderData);
        delete orderData.shippingAddress.countryCode;

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.countryCode"].properties.type).toBe("required");
          expect(error.errors["shippingAddress.countryCode"].properties.message).toBe(
            "Country code is required",
          );
        }
      });

      test("2.3.2. country code is trimmed", async () => {
        expect.assertions(1);

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.countryCode = ` ${correctOrderData.shippingAddress.countryCode} `;

        await expect(OrderModel.create(orderData)).resolves.toHaveProperty(
          "shippingAddress.countryCode",
          correctOrderData.shippingAddress.countryCode,
        );
      });

      test("2.3.3. country code is valid", async () => {
        expect.assertions(2);

        const countryCode = "PI";

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.countryCode = countryCode;

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.countryCode"].properties.type).toBe("user defined");
          expect(error.errors["shippingAddress.countryCode"].properties.message).toBe(
            `${countryCode} is not a valid country code`,
          );
        }
      });
    });

    describe("2.4. postal code", () => {
      test("2.4.1. postal code is required", async () => {
        expect.assertions(2);

        const orderData = deepClone(correctOrderData);
        delete orderData.shippingAddress.postalCode;

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.postalCode"].properties.type).toBe("required");
          expect(error.errors["shippingAddress.postalCode"].properties.message).toBe(
            "Postal code is required",
          );
        }
      });

      test("2.4.2. postal code is trimmed", async () => {
        expect.assertions(1);

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.postalCode = ` ${correctOrderData.shippingAddress.postalCode} `;

        await expect(OrderModel.create(orderData)).resolves.toHaveProperty(
          "shippingAddress.postalCode",
          correctOrderData.shippingAddress.postalCode,
        );
      });

      test("2.4.3. postal code is valid", async () => {
        expect.assertions(2);

        const postalCode = "EN1";

        const orderData = deepClone(correctOrderData);
        orderData.shippingAddress.postalCode = postalCode;

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors["shippingAddress.postalCode"].properties.type).toBe("user defined");
          expect(error.errors["shippingAddress.postalCode"].properties.message).toBe(
            `${postalCode} is not a valid postal code for the given country code`,
          );
        }
      });
    });

    describe("3. shipping cost:", () => {
      test("3.1. shipping cost a default value of 0", async () => {
        const { shippingCost, ...orderData } = correctOrderData;

        const product = await OrderModel.create(orderData);

        expect(product).toHaveProperty("shippingCost", 0);
      });

      test("3.2. shipping cost must be numeric", async () => {
        const orderData = {
          ...correctOrderData,
          shippingCost: "one",
        };

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors.shippingCost.kind).toBe("Number");
        }
      });

      test("3.3. shipping cost must be greater or equal than 0", async () => {
        expect.assertions(2);

        const orderData = {
          ...correctOrderData,
          shippingCost: -1,
        };

        try {
          await OrderModel.create(orderData);
        } catch (error) {
          expect(error.errors.shippingCost.properties.type).toBe("min");
          expect(error.errors.shippingCost.properties.message).toBe(
            "Shipping cost must be greater or equal than 0",
          );
        }
      });
    });

    describe("4. products:", () => {
      describe("4.1. product", () => {
        test("4.1.1. product ID is required", async () => {
          expect.assertions(2);

          const orderData = deepClone(correctOrderData);
          delete orderData.products[0].product;

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.product"].properties.type).toBe("required");
            expect(error.errors["products.0.product"].properties.message).toBe(
              "Product must include its correspondent ID",
            );
          }
        });

        test("4.1.2. product ID must be of type ObjectId", async () => {
          expect.assertions(1);

          const orderData = deepClone(correctOrderData);
          orderData.products[0].product = "foo";

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.product"].kind).toBe("ObjectId");
          }
        });
      });

      describe("4.2. price", () => {
        test("4.2.1. price is required", async () => {
          expect.assertions(2);

          const orderData = deepClone(correctOrderData);
          delete orderData.products[0].price;

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.price"].properties.type).toBe("required");
            expect(error.errors["products.0.price"].properties.message).toBe(
              "Product must include its correspondent price",
            );
          }
        });

        test("4.2.2. price must be numeric", async () => {
          expect.assertions(1);

          const orderData = deepClone(correctOrderData);
          orderData.products[0].price = "zero";

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.price"].kind).toBe("Number");
          }
        });

        test("4.2.3. price must be greater or equal than 0", async () => {
          expect.assertions(2);

          const orderData = deepClone(correctOrderData);
          orderData.products[0].price = -1;

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.price"].properties.type).toBe("min");
            expect(error.errors["products.0.price"].properties.message).toBe(
              "Price must be greater or equal than 0",
            );
          }
        });
      });

      describe("4.3. units", () => {
        test("4.3.1. units is required", async () => {
          expect.assertions(2);

          const orderData = deepClone(correctOrderData);
          delete orderData.products[0].units;

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.units"].properties.type).toBe("required");
            expect(error.errors["products.0.units"].properties.message).toBe(
              "Product must include the number of units",
            );
          }
        });

        test("4.3.2. units must be numeric", async () => {
          expect.assertions(1);

          const orderData = deepClone(correctOrderData);
          orderData.products[0].units = "zero";

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.units"].kind).toBe("Number");
          }
        });

        test("4.3.3. units must be greater or equal than 0", async () => {
          expect.assertions(2);

          const orderData = deepClone(correctOrderData);
          orderData.products[0].units = -1;

          try {
            await OrderModel.create(orderData);
          } catch (error) {
            expect(error.errors["products.0.units"].properties.type).toBe("min");
            expect(error.errors["products.0.units"].properties.message).toBe(
              "Units must be greater or equal than 0",
            );
          }
        });
      });
    });
  });
});
