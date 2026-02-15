import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "car_rental",
  waitForConnections: true,
  connectionLimit: 10,
});

export  default db;
