const { UserModel, ProductModel } = require("../models");

const users = [
  {
    uid: "0001",
    email: "alice@foo.com",
    firstName: "Alice",
    lastName: "Jordan",
    phoneLocale: "en-GB",
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
    firstName: "Bob",
    lastName: "Williams",
    phoneLocale: "en-GB",
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
    firstName: "Alberto",
    lastName: "Chica",
    phoneLocale: "es-ES",
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
    firstName: "Gonzalo",
    lastName: "G. Arahuetes",
    phoneLocale: "fr-FR",
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
    title: "Iphone 13",
    price: 965,
    stock: 30,
    description:
      "5.4 ”screen, A15 Bionic processor, 128GB, 256GB, 512GB storage, 6GB RAM, 12MP front camera, f / 2.2. Records video, at 4K and 60fps and 1080p and 120fps. 12MP rear camera, f / 1.6 (main), 12MP, f / 2.4 (wide angle). Records video at 4K and 60fps and 1080p and 240fps.",
    images: [
      "https://www.tuimeilibre.com/24597-large_default/apple-iphone-13-128gb-negro-libre.jpg",
    ],
  },

  {
    title: "Iphone 11 ",
    price: 789,
    stock: 21,
    description:
      "Apple launches its new smartphone, the iPhone 11 will make you feel like a real photographer and never slow down thanks to its camera and its powerful processor. The iPhone 11 carries Dual Cam technology, with two high-quality rear cameras, in addition to other features, such as a much more improved Siri service.",
    images: [
      "https://img.pccomponentes.com/articles/34/348193/1358-apple-iphone-11-128-gb-blanco-libre.jpg",
    ],
  },
  {
    title: "Samsung Galaxy S21",
    price: 654,
    stock: 17,
    description:
      "Galaxy S21 FE is designed for you, who are a fan of multimedia content, passionate about photography and / or games. Experience vivid viewing with its 6.4 ”2x Dynamic AMOLED screen, explore your world with its four cameras, or level up your game with its processor.",
    images: [
      "https://img.pccomponentes.com/articles/83/837005/1975-samsung-galaxy-s21-fe-5g-6-128gb-gris-libre.jpg",
    ],
  },
  {
    title: "Realme C21Y",
    price: 210,
    stock: 30,
    description:
      "5000 mAh Big Battery: More power. More life. This long-lasting battery lets you meet life's challenges. Power your day for longer with this massive 5000 mAh battery.",
    images: [
      "https://img.pccomponentes.com/articles/67/678167/1609-realme-c21y-3-32gb-negro-libre.jpg",
    ],
  },
  {
    title: "Xiaomi Mi 11i",
    price: 613,
    stock: 42,
    description:
      "My 11i, power that dazzles. This Xiaomi 5G mobile has a Qualcomm Snapdragon 888 flagship processor, a spectacular 120 Hz and 6.67 DotDisplay AMOLED screen and a 108 MP ultra-high resolution camera.",
    images: [
      "https://img.pccomponentes.com/articles/39/394962/193-xiaomi-mi-11i-5g-8-128gb-negro-libre.jpg",
    ],
  },
  {
    title: " iPhone XR",
    price: 450,
    stock: 35,
    description:
      "New Liquid Retina display with the most advanced LCD technology in the industry. Face ID even faster. The smartest and most powerful chip in a smartphone. And a revolutionary camera system. No matter where you look at it, the iPhone XR is simply amazing.",
    images: [
      "https://img.pccomponentes.com/articles/17/171054/iphone-xs-2-1747x3000-copia2.jpg",
    ],
  },
  {
    title: "Samsung Galaxy M52",
    price: 320,
    stock: 40,
    description:
      "Discover its wide 6.7 ”screen, with FHD + resolution and the latest Infinity- O sAMOLED + technology. This device has 3 rear cameras of the highest resolution and a 32 MP front camera to take sharper selfies. Enjoy for days thanks to its long-lasting battery!",
    images: [
      "https://img.pccomponentes.com/articles/61/616192/1633-samsung-galaxy-m52-5g-6-128gb-negro-libre.jpg",
    ],
  },
  {
    title: "Samsung Galaxy S21 FE",
    price: 360,
    stock: 40,
    description:
      "Do something epic every day with the Samsung Galaxy S21 FE 5G. With the 6.4 FHD + Dynamic AMOLED 2X smart screen. 3 rear cameras with professional results and a front camera for perfect selfies. A processor as fast as the way you consume your series. Sleek and slim body with IP68 certificate.",
    images: [
      "https://img.pccomponentes.com/articles/83/837017/1965-samsung-galaxy-s21-fe-5g-8-256gb-verde-libre.jpg",
    ],
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
