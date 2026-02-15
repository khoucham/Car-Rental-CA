import mysql from "mysql2/promise";
import admin from "firebase-admin";
import fs from "fs";

// 🔐 Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"))
  ),
});

const firestore = admin.firestore();

// 🛢 MySQL connection
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "car_rental",
});

async function migrateCars() {
  try {
    const [cars] = await db.query("SELECT * FROM cars");

    console.log(`Found ${cars.length} cars`);

    for (const car of cars) {
      await firestore.collection("cars").add({
        brand: car.brand,
        model: car.model,
        type: car.type,
        fuel: car.fuel,
        transmission: car.transmission,
        pricePerDay: Number(car.price_per_day),
        seats: car.seats || 5,
        image: car.image,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✔ Migrated ${car.brand} ${car.model}`);
    }

    console.log("🎉 Migration completed");
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateCars();
