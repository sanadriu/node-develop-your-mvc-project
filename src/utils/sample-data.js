module.exports = {
  users: [
    {
      uid: "0001",
      email: "alice@foo.com",
      // role: "customer",
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
  ],
};
