const mongoose = require("mongoose");
const config = require("../config/config");
const User = require("../models/userModel");
const Table = require("../models/tableModel");
const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const seedAdminUser = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_ROLE } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Skipping admin seed: ADMIN_EMAIL and ADMIN_PASSWORD are not set.");
    return;
  }

  const existingUser = await User.findOne({ email: ADMIN_EMAIL });

  if (existingUser) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const admin = new User({
    name: ADMIN_NAME || "Admin",
    email: ADMIN_EMAIL,
    phone: Number(ADMIN_PHONE) || 9999999999,
    password: ADMIN_PASSWORD,
    role: ADMIN_ROLE || "Admin",
  });

  await admin.save();
  console.log(`Created admin user: ${ADMIN_EMAIL}`);
};

const seedTables = async () => {
  const tableCount = parsePositiveInt(process.env.SEED_TABLE_COUNT, 0);

  if (!tableCount) {
    console.log("Skipping table seed: SEED_TABLE_COUNT is not set.");
    return;
  }

  const seats = parsePositiveInt(process.env.SEED_TABLE_SEATS, 4);
  let createdCount = 0;

  for (let tableNo = 1; tableNo <= tableCount; tableNo += 1) {
    const result = await Table.updateOne(
      { tableNo },
      { $setOnInsert: { tableNo, seats, status: "Available" } },
      { upsert: true }
    );

    if (result.upsertedCount) {
      createdCount += 1;
    }
  }

  console.log(`Table seed complete: ${createdCount} created, ${tableCount - createdCount} already existed.`);
};

const migrate = async () => {
  if (!config.databaseURI) {
    throw new Error("MONGODB_URI is required.");
  }

  await mongoose.connect(config.databaseURI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);

  await Promise.all([
    User.syncIndexes(),
    Table.syncIndexes(),
    Order.syncIndexes(),
    Payment.syncIndexes(),
  ]);
  console.log("Indexes synchronized.");

  await seedAdminUser();
  await seedTables();
};

migrate()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(`Migration failed: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  });
