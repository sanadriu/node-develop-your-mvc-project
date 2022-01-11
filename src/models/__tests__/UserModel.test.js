const db = require("../../utils/virtual-db");
const UserModel = require("../UserModel");
const generateRandomSequence = require("../../utils/generateRandomSequence");
const deepClone = require("../../utils/deepClone");

describe("User Schema", () => {
  beforeAll(async () => {
    await db.start();
    await db.connect();
  });

  beforeEach(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await db.stop();
  });

  const correctUserData = {
    uid: "0000",
    email: "mail@foo.com",
    firstname: "Alice",
    lastname: "Anderson",
    phone: "+34600000000",
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
  };
  describe("1. uid:", () => {
    test("1.1. uid is required", async () => {
      expect.assertions(2);

      const { uid, ...userData } = correctUserData;

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
        await UserModel.create({ ...correctUserData });
        await UserModel.create({ ...correctUserData, email: "other@mail.com" });
      } catch (error) {
        expect(error.keyPattern).toHaveProperty("uid");
        expect(error.code).toBe(11000);
      }
    });

    test("1.3. uid is trimmed", async () => {
      expect.assertions(1);

      const userData = {
        ...correctUserData,
        uid: ` ${correctUserData.uid} `,
      };

      await expect(UserModel.create(userData)).resolves.toHaveProperty(
        "uid",
        correctUserData.uid,
      );
    });
  });

  describe("2. email:", () => {
    test("2.1. email is required", async () => {
      expect.assertions(2);

      const { email, ...userData } = correctUserData;

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
        await UserModel.create({ ...correctUserData });
        await UserModel.create({ ...correctUserData, uid: "5555" });
      } catch (error) {
        expect(error.keyPattern).toHaveProperty("email");
        expect(error.code).toBe(11000);
      }
    });

    test("2.3. email is trimmed", async () => {
      expect.assertions(1);

      const userData = {
        ...correctUserData,
        email: ` ${correctUserData.email} `,
      };

      await expect(UserModel.create(userData)).resolves.toHaveProperty(
        "email",
        correctUserData.email,
      );
    });

    test("2.4. email max length is 64", async () => {
      expect.assertions(2);

      const userData = {
        ...correctUserData,
        email: `${generateRandomSequence(57)}@foo.bar`,
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.email.properties.type).toBe("maxlength");
        expect(error.errors.email.properties.message).toBe(
          "Email length must not be longer than 64 characters",
        );
      }
    });

    test("2.5. email is valid", async () => {
      expect.assertions(2);

      const email = generateRandomSequence(16);

      const userData = {
        ...correctUserData,
        email,
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.email.properties.type).toBe("user defined");
        expect(error.errors.email.properties.message).toBe(
          `${email} is not a valid email`,
        );
      }
    });
  });

  describe("3. firstname:", () => {
    test("3.1. firstname is trimmed", async () => {
      expect.assertions(1);

      const userData = {
        ...correctUserData,
        firstname: ` ${correctUserData.firstname} `,
      };

      await expect(UserModel.create(userData)).resolves.toHaveProperty(
        "firstname",
        correctUserData.firstname,
      );
    });

    test("3.2. firstname max length is 32", async () => {
      expect.assertions(2);

      const userData = {
        ...correctUserData,
        firstname: generateRandomSequence(33),
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.firstname.properties.type).toBe("maxlength");
        expect(error.errors.firstname.properties.message).toBe(
          "Firstname length must not be longer than 32 characters",
        );
      }
    });
  });

  describe("4. lastname:", () => {
    test("4.1. lastname is trimmed", async () => {
      expect.assertions(1);

      const userData = {
        ...correctUserData,
        lastname: ` ${correctUserData.lastname} `,
      };

      await expect(UserModel.create(userData)).resolves.toHaveProperty(
        "lastname",
        correctUserData.lastname,
      );
    });

    test("4.2. lastname max length is 32", async () => {
      expect.assertions(2);

      const userData = {
        ...correctUserData,
        lastname: generateRandomSequence(33),
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.lastname.properties.type).toBe("maxlength");
        expect(error.errors.lastname.properties.message).toBe(
          "Lastname length must not be longer than 32 characters",
        );
      }
    });
  });

  describe("5. phone number:", () => {
    test("5.1. phone number is trimmed", async () => {
      const userData = {
        ...correctUserData,
        phone: ` ${correctUserData.phone} `,
      };

      const user = await UserModel.create(userData);

      expect(user.phone).toBe(correctUserData.phone);
    });

    test("5.2. phone number is valid", async () => {
      expect.assertions(2);

      const phone = "+any";

      const userData = {
        ...correctUserData,
        phone,
      };

      try {
        await UserModel.create(userData);
      } catch (error) {
        expect(error.errors.phone.properties.type).toBe("user defined");
        expect(error.errors.phone.properties.message).toBe(
          `${phone} is not a valid phone for the specified locale`,
        );
      }
    });
  });

  describe("6. addresses:", () => {
    describe("6.1. address", () => {
      test("6.1.1. address is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData);
        delete userData.addresses[0].address;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.address"].properties.type).toBe(
            "required",
          );
          expect(error.errors["addresses.0.address"].properties.message).toBe(
            "Address is required",
          );
        }
      });

      test("6.1.2 address is trimmed", async () => {
        expect.assertions(1);

        const userData = deepClone(correctUserData);
        userData.addresses[0].address = ` ${correctUserData.addresses[0].address} `;

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "addresses.0.address",
          correctUserData.addresses[0].address,
        );
      });

      test("6.1.3 address max length is 64", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData);
        userData.addresses[0].address = generateRandomSequence(65);

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.address"].properties.type).toBe(
            "maxlength",
          );
          expect(error.errors["addresses.0.address"].properties.message).toBe(
            "Address length must not be longer than 64 characters",
          );
        }
      });
    });

    describe("6.2. city", () => {
      test("6.2.1. city is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData);
        delete userData.addresses[0].city;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.city"].properties.type).toBe(
            "required",
          );
          expect(error.errors["addresses.0.city"].properties.message).toBe(
            "City is required",
          );
        }
      });

      test("6.2.2. city is trimmed", async () => {
        expect.assertions(1);

        const userData = deepClone(correctUserData);
        userData.addresses[0].city = ` ${correctUserData.addresses[0].city} `;

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "addresses.0.city",
          correctUserData.addresses[0].city,
        );
      });

      test("6.2.3. city max length is 64", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData);
        userData.addresses[0].city = generateRandomSequence(65);

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.city"].properties.type).toBe(
            "maxlength",
          );
          expect(error.errors["addresses.0.city"].properties.message).toBe(
            "City length must not be longer than 64 characters",
          );
        }
      });
    });

    describe("6.3. country code", () => {
      test("6.3.1. country code is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData);
        delete userData.addresses[0].countryCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.countryCode"].properties.type).toBe(
            "required",
          );
          expect(
            error.errors["addresses.0.countryCode"].properties.message,
          ).toBe("Country code is required");
        }
      });

      test("6.3.2. country code is trimmed", async () => {
        expect.assertions(1);

        const userData = deepClone(correctUserData);
        userData.addresses[0].countryCode = ` ${correctUserData.addresses[0].countryCode} `;

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "addresses.0.countryCode",
          correctUserData.addresses[0].countryCode,
        );
      });

      test("6.3.3. country code is valid", async () => {
        expect.assertions(2);

        const countryCode = "PI";

        const userData = deepClone(correctUserData);
        userData.addresses[0].countryCode = countryCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.countryCode"].properties.type).toBe(
            "user defined",
          );
          expect(
            error.errors["addresses.0.countryCode"].properties.message,
          ).toBe(`${countryCode} is not a valid country code`);
        }
      });
    });

    describe("6.3. postal code", () => {
      test("6.3.1. postal code is required", async () => {
        expect.assertions(2);

        const userData = deepClone(correctUserData);
        delete userData.addresses[0].postalCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.postalCode"].properties.type).toBe(
            "required",
          );
          expect(
            error.errors["addresses.0.postalCode"].properties.message,
          ).toBe("Postal code is required");
        }
      });

      test("6.3.2. postal code is trimmed", async () => {
        expect.assertions(1);

        const userData = deepClone(correctUserData);
        userData.addresses[0].postalCode = ` ${correctUserData.addresses[0].postalCode} `;

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "addresses.0.postalCode",
          correctUserData.addresses[0].postalCode,
        );
      });

      test("6.3.3. postal code is valid", async () => {
        expect.assertions(2);

        const postalCode = "EN1";

        const userData = deepClone(correctUserData);
        userData.addresses[0].postalCode = postalCode;

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors["addresses.0.postalCode"].properties.type).toBe(
            "user defined",
          );
          expect(
            error.errors["addresses.0.postalCode"].properties.message,
          ).toBe(
            `${postalCode} is not a valid postal code for the given country code`,
          );
        }
      });
    });

    describe("7. role:", () => {
      test("7.1. 'customer' role is valid", async () => {
        expect.assertions(1);

        const userData = {
          ...correctUserData,
          role: "customer",
        };

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "role",
          "customer",
        );
      });

      test("7.2. 'admin' role is valid", async () => {
        expect.assertions(1);

        const userData = {
          ...correctUserData,
          role: "admin",
        };

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "role",
          "admin",
        );
      });

      test("7.3. 'main-admin' role is valid", async () => {
        expect.assertions(1);

        const userData = {
          ...correctUserData,
          role: "main-admin",
        };

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "role",
          "main-admin",
        );
      });

      test("7.4. 'customer' role is the default value", async () => {
        expect.assertions(1);

        const userData = { ...correctUserData };

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "role",
          "customer",
        );
      });

      test("7.5. other given roles are not valid", async () => {
        expect.assertions(2);

        const userData = {
          ...correctUserData,
          role: "dummy",
        };

        try {
          await UserModel.create(userData);
        } catch (error) {
          expect(error.errors.role.properties.type).toBe("enum");
          expect(error.errors.role.properties.message).toBe(
            "The given role is not valid",
          );
        }
      });

      test("7.6. role is trimmed", async () => {
        expect.assertions(1);

        const userData = {
          ...correctUserData,
          role: " customer ",
        };

        await expect(UserModel.create(userData)).resolves.toHaveProperty(
          "role",
          "customer",
        );
      });
    });
  });
});
