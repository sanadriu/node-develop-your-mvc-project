const { UserModel, ProductModel } = require("../models");

const users = [
  {
    uid: "0001",
    email: "alice@foo.com",
    firstname: "Alice",
    lastname: "Jordan",
    phoneNumber: "+447700000001",
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
    uid: "0002",
    email: "bob@foo.com",
    firstname: "Bob",
    lastname: "Williams",
    phoneNumber: "+447700000002",
    addresses: [
      {
        address: "Chocolate Street, 45",
        countryCode: "ES",
        postalCode: "28004",
        city: "Madrid",
      },
      {
        address: "Apple Avenue, 69",
        countryCode: "GB",
        postalCode: "E1 7BH",
        city: "London",
      },
    ],
  },
  {
    uid: "0003",
    email: "albertus@foo.com",
    firstname: "Alberto",
    lastname: "Chica",
    phoneNumber: "+34699999999",
    addresses: [
      {
        address: "Bad Avenue, 89",
        countryCode: "ES",
        postalCode: "08221",
        city: "Terrasa",
      },
    ],
  },
  {
    uid: "0004",
    email: "gonzalus@foo.com",
    firstname: "Gonzalo",
    lastname: "G. Arahuetes",
    phoneNumber: "+33700000001",
    addresses: [
      {
        address: "Le Baguette, 42",
        countryCode: "FR",
        postalCode: "69000",
        city: "Lyon",
      },
    ],
  },
  {
    uid: "1001",
    email: "admin@mail.com",
    role: "admin",
  },
  {
    uid: "1002",
    email: "main@mail.com",
    role: "main-admin",
  },
];

const products = [
  {
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    price: 109.95,
    stock: 3,
    description:
      "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    images: ["https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"],
  },
  {
    title: "Mens Casual Premium Slim Fit T-Shirts ",
    price: 22.3,
    stock: 5,
    description:
      "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
    images: [
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    ],
  },
  {
    title: "Mens Cotton Jacket",
    price: 55.99,
    stock: 7,
    description:
      "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.",
    images: ["https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"],
  },
];

const orders = async () => {
  const idUsers = (await UserModel.find().lean().exec()).map((user) =>
    user._id.toString(),
  );

  const idProducts = (await ProductModel.find().lean().exec()).map((product) =>
    product._id.toString(),
  );

  if (idUsers.length <= 2 || idProducts.length <= 2)
    throw Error(
      "A minimum of 3 users and 3 products are required to add sample orders",
    );

  return [
    {
      user: idUsers[0],
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
          product: idProducts[2],
          price: 55.99,
          units: 2,
        },
      ],
    },
    {
      user: idUsers[1],
      shippingCost: 10,
      shippingAddress: {
        address: "Le Baguette, 42",
        countryCode: "FR",
        postalCode: "69000",
        city: "Lyon",
      },
      products: [
        {
          product: idProducts[0],
          price: 109.95,
          units: 3,
        },
        {
          product: idProducts[1],
          price: 22.3,
          units: 4,
        },
      ],
    },
    {
      user: idUsers[2],
      shippingCost: 15,
      shippingAddress: {
        address: "Le Baguette, 42",
        countryCode: "FR",
        postalCode: "69000",
        city: "Lyon",
      },
      products: [
        {
          product: idProducts[1],
          price: 109.95,
          units: 3,
        },
        {
          product: idProducts[2],
          price: 55.99,
          units: 1,
        },
      ],
    },
  ];
};

module.exports = {
  users,
  products,
  orders,
};
