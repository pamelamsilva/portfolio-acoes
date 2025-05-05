const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const actionsRoutes = require("./routes/actionsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./db/database.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Banco conectado.");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('investor','admin'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    sector TEXT NOT NULL,
    price REAL NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (action_id) REFERENCES actions(id)
  )`);
});

app.use("/", userRoutes(db));
app.use("/acoes", actionsRoutes(db));
app.use("/admin", adminRoutes(db));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
