const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const {
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_NAME = "notesdb",
  DB_USER = "notesuser",
  DB_PASSWORD = "notespwd",
  PORT = "8080"
} = process.env;

const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

app.get("/", (req, res) => {
  res.type("text").send("✅ Notes API is running. Use /healthz and /notes");
});

app.get("/healthz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "error", error: e.message });
  }
});

app.get("/notes", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/notes", async (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required" });
  }
  const result = await pool.query(
    "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
    [title, content]
  );
  res.status(201).json(result.rows[0]);
});

app.delete("/notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query("DELETE FROM notes WHERE id = $1 RETURNING *", [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "not found" });
  res.json({ deleted: result.rows[0] });
});

(async () => {
  try {
    await initDb();
    app.listen(Number(PORT), () => {
      console.log(`✅ Notes API listening on :${PORT}`);
      console.log(`DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    });
  } catch (e) {
    console.error("❌ Failed to start app:", e);
    process.exit(1);
  }
})();
