const mongoose = require("mongoose");
const moment = require("moment");
const { faker } = require("@faker-js/faker");

const {
  Account,
  Address,
  Company,
  Position,
  Shift,
  User,
} = require("../models/index.js");

async function seedDb() {
  try {
    const fakeAccounts = Array.from({ length: 50 }, () => ({
      email: faker.internet.email(),
      password: faker.internet.password(),
    }));

    const fakeCompanies = Array.from({ length: 5 }, () => ({
      companyName: faker.company.name(),
      companyPhone: faker.phone.number("619-###-####"),
      companyAddress: {
        street1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
    }));

    const fakePositions = Array.from({ length: 10 }, () => ({
      jobTitle: faker.person.jobTitle(),
    }));

    const fakeShifts = Array.from({ length: 100 }, () => {
      const startDateTime = faker.date.future();
      startDateTime.setMinutes(0);
      startDateTime.setSeconds(0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 4);

      return {
        startDateTime,
        endDateTime,
        note: faker.lorem.sentence(),
      };
    });

    const fakeUsers = Array.from({ length: 50 }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number("619-###-####"),
      hireDate: moment(faker.date.past()).format("YYYY-MM-DD"),
      payRate: faker.number.octal({ min: 20000, max: 150000 }),
      fullTime: faker.datatype.boolean(),
      activeEmployee: faker.datatype.boolean(),
      isAdmin: faker.datatype.boolean(),
    }));

    const accounts = await Account.insertMany(fakeAccounts);

    const users = [];

    for (let i = 0; i < fakeUsers.length; i++) {
      const fakeUser = fakeUsers[i];

      fakeUser.userAddress = {
        street1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode("#####"),
        country: faker.location.country(),
      };

      if (faker.datatype.boolean()) {
        fakeUser.terminationDate = moment(faker.date.past()).format(
          "YYYY-MM-DD"
        );
      } else {
        fakeUser.terminationDate = null;
      }

      fakeUser.activeEmployee = fakeUser.terminationDate === null;

      const user = await User.create(fakeUser);
      const account = accounts[i];
      account.user = user._id;
      await account.save();
      users.push(user);
    }

    const companies = await Company.insertMany(fakeCompanies);

    const positions = await Position.insertMany(fakePositions);

    for (let i = 0; i < fakeShifts.length; i++) {
      const fakeShift = fakeShifts[i];

      const randomUser = users[Math.floor(Math.random() * users.length)];

      const randomPosition =
        positions[Math.floor(Math.random() * positions.length)];

      fakeShift.user = randomUser._id;
      fakeShift.position = randomPosition._id;

      await Shift.create(fakeShift);
    }

    console.log("Database seeding completed successfully!");
  } catch (err) {
    console.error("Error seeding the database", err);
  }
}

async function connectAndSeed() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/userDb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
    await seedDb();
  } catch (err) {
    console.error("Error connecting to the database", err);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from the database");
  }
}

connectAndSeed();
