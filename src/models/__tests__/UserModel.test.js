const db = require("../../utils/virtual-db");
const UserModel = require("../UserModel");
const generateRandomSequence = require("../../utils/generateRandomSequence");
const deepClone = require("../../utils/deepClone");

describe("User Schema", () => {
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

  const correctUserData = [
    {
      uid: "0000",
      email: "mail@foo.com",
      firstName: "Alice",
      lastName: "Anderson",
      phoneLocale: "es-ES",
      phoneNumber: "+34600000000",
      addresses: [
        {
          address: "False Street, 123",
          countryCode: "ES",
          postalCode: "09999",
          city: "Barcelona",
        },
        {
          address: "Lollypop Avenue, 1337",
          countryCode: "GB",
          postalCode: "EN1",
          city: "Enfield",
        },
      ],
    },
    {
      uid: "1111",
      email: "mail@bar.baz",
      firstName: "John",
      lastName: "Smith",
      phoneLocale: "en-GB",
      phoneNumber: "+447700000000",
    },
  ];

  describe("1. uid:", () => {
    test("1.1. uid is required", async () => {
      expect.assertions(2);

      const { uid, ...userData } = correctUserData[0];

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.uid.properties.type).toBe("required");
        expect(error.errors.uid.properties.message).toBe("UID is required");
      }
    });

    test("1.2. uid is unique", async () => {
      expect.assertions(2);

      try {
        await UserModel.create({ ...correctUserData[0], uid: "5555" });
        await UserModel.create({ ...correctUserData[1], uid: "5555" });
      } catch (error) {
        expect(error.keyPattern).toHaveProperty("uid");
        expect(error.code).toBe(11000);
      }
    });

    test("1.3. uid is trimmed", async () => {
      const userData = {
        ...correctUserData[0],
        uid: ` ${correctUserData[0].uid} `,
      };

      const user = await UserModel.create(userData);

      expect(user.uid).toBe(correctUserData[0].uid);
    });
  });

  describe("2. email:", () => {
    test("2.1. email is required", async () => {
      expect.assertions(2);

      const { email, ...userData } = correctUserData[0];

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.email.properties.type).toBe("required");
        expect(error.errors.email.properties.message).toBe("Email is required");
      }
    });

    test("2.2. email is unique", async () => {
      expect.assertions(2);

      try {
        await UserModel.create({ ...correctUserData[0], email: "test@test.com" });
        await UserModel.create({ ...correctUserData[1], email: "test@test.com" });
      } catch (error) {
        expect(error.keyPattern).toHaveProperty("email");
        expect(error.code).toBe(11000);
      }
    });

    test("2.3. email is trimmed", async () => {
      const userData = {
        ...correctUserData[0],
        email: ` ${correctUserData[0].email} `,
      };

      const user = await UserModel.create(userData);

      expect(user.email).toBe(correctUserData[0].email);
    });

    test("2.4. email max length is 64", async () => {
      expect.assertions(2);

      const userData = {
        ...correctUserData[0],
        email: `${generateRandomSequence(57)}@foo.bar`,
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.email.properties.type).toBe("maxlength");
        expect(error.errors.email.properties.message).toBe("Email length must not be longer than 64 characters");
      }
    });

    test("2.5. email is valid", async () => {
      expect.assertions(2);

      const email = generateRandomSequence(16);

      const userData = {
        ...correctUserData[0],
        email,
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.email.properties.type).toBe("user defined");
        expect(error.errors.email.properties.message).toBe(`${email} is not a valid email`);
      }
    });
  });

  describe("3. firstname:", () => {
    test("3.1. firstname is trimmed", async () => {
      const userData = {
        ...correctUserData[0],
        firstName: ` ${correctUserData[0].firstName} `,
      };

      const user = await UserModel.create(userData);

      expect(user.firstName).toBe(correctUserData[0].firstName);
    });

    test("3.2. firstname max length is 32", async () => {
      expect.assertions(2);

      const userData = {
        ...correctUserData[0],
        firstName: generateRandomSequence(33),
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.firstName.properties.type).toBe("maxlength");
        expect(error.errors.firstName.properties.message).toBe(
          "Firstname length must not be longer than 32 characters",
        );
      }
    });
  });

  describe("4. lastname:", () => {
    test("4.1. lastname is trimmed", async () => {
      const userData = {
        ...correctUserData[0],
        lastName: ` ${correctUserData[0].lastName} `,
      };

      const user = await UserModel.create(userData);

      expect(user.lastName).toBe(correctUserData[0].lastName);
    });

    test("4.2. lastname max length is 32", async () => {
      expect.assertions(2);

      const userData = {
        ...correctUserData[0],
        lastName: generateRandomSequence(33),
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.lastName.properties.type).toBe("maxlength");
        expect(error.errors.lastName.properties.message).toBe("Lastname length must not be longer than 32 characters");
      }
    });
  });

  describe("5. phone number:", () => {
    test("5.1. phone number is trimmed", async () => {
      const userData = {
        ...correctUserData[0],
        phoneNumber: ` ${correctUserData[0].phoneNumber} `,
      };

      const user = await UserModel.create(userData);

      expect(user.phoneNumber).toBe(correctUserData[0].phoneNumber);
    });

    test("5.2. phone number is valid", async () => {
      expect.assertions(2);

      const phoneNumber = "+3460100100";

      const userData = {
        ...correctUserData[0],
        phoneNumber,
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.phoneNumber.properties.type).toBe("user defined");
        expect(error.errors.phoneNumber.properties.message).toBe(
          `${phoneNumber} is not a valid phone for the specified locale`,
        );
      }
    });
  });

  describe("6. addresses:", () => {
    describe("6.1. address", () => {
      test("6.1.1. address is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData[0]);
        delete userData.addresses[0].address;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.address"].properties.type).toBe("required");
          expect(error.errors["addresses.0.address"].properties.message).toBe("Address is required");
        }
      });

      test("6.1.2 address is trimmed", async () => {
        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].address = ` ${correctUserData[0].addresses[0].address} `;

        const user = await UserModel.create(userData);

        expect(user.addresses[0].address).toBe(correctUserData[0].addresses[0].address);
      });

      test("6.2.3 address max length is 64", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].address = generateRandomSequence(65);

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.address"].properties.type).toBe("maxlength");
          expect(error.errors["addresses.0.address"].properties.message).toBe(
            "Address length must not be longer than 64 characters",
          );
        }
      });
    });

    describe("6.2. city", () => {
      test("6.2.1. city is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData[0]);
        delete userData.addresses[0].city;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.city"].properties.type).toBe("required");
          expect(error.errors["addresses.0.city"].properties.message).toBe("City is required");
        }
      });

      test("6.2.2. city is trimmed", async () => {
        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].city = ` ${correctUserData[0].addresses[0].city} `;

        const user = await UserModel.create(userData);

        expect(user.addresses[0].city).toBe(correctUserData[0].addresses[0].city);
      });

      test("6.2.3. city max length is 64", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].city = generateRandomSequence(65);

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.city"].properties.type).toBe("maxlength");
          expect(error.errors["addresses.0.city"].properties.message).toBe(
            "City length must not be longer than 64 characters",
          );
        }
      });
    });

    describe("6.3. country code", () => {
      test("6.3.1. country code is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData[0]);
        delete userData.addresses[0].countryCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.countryCode"].properties.type).toBe("required");
          expect(error.errors["addresses.0.countryCode"].properties.message).toBe("Country code is required");
        }
      });

      test("6.3.2. country code is trimmed", async () => {
        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].countryCode = ` ${correctUserData[0].addresses[0].countryCode} `;

        const user = await UserModel.create(userData);

        expect(user.addresses[0].countryCode).toBe(correctUserData[0].addresses[0].countryCode);
      });

      test("6.3.3. country code is valid", async () => {
        expect.assertions(2);

        const countryCode = "PI";

        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].countryCode = countryCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.countryCode"].properties.type).toBe("user defined");
          expect(error.errors["addresses.0.countryCode"].properties.message).toBe(
            `${countryCode} is not a valid country code`,
          );
        }
      });
    });

    describe("6.3. postal code", () => {
      test("6.3.1. postal code is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData[0]);
        delete userData.addresses[0].postalCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.postalCode"].properties.type).toBe("required");
          expect(error.errors["addresses.0.postalCode"].properties.message).toBe("Postal code is required");
        }
      });

      test("6.3.2. postal code is trimmed", async () => {
        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].postalCode = ` ${correctUserData[0].addresses[0].postalCode} `;

        const user = await UserModel.create(userData);

        expect(user.addresses[0].postalCode).toBe(correctUserData[0].addresses[0].postalCode);
      });

      test("6.3.3. postal code is valid", async () => {
        expect.assertions(2);

        const postalCode = "EN1";

        const userData = deepClone(correctUserData[0]);
        userData.addresses[0].postalCode = postalCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.postalCode"].properties.type).toBe("user defined");
          expect(error.errors["addresses.0.postalCode"].properties.message).toBe(
            `${postalCode} is not a valid postal code for the given country code`,
          );
        }
      });
    });
  });
});
