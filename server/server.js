import "dotenv/config";
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-change-me";

// Middleware
app.use(express.json());

// --- DB --------------------------------------------------
const db = await open({ filename: "./data.db", driver: sqlite3.Database });
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- Helpers ---------------------------------------------
const makeToken = (u) => jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: "7d" });

// --- Routes ----------------------------------------------
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const normalized = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return res.status(400).json({ error: "Invalid email" });
    if (String(password).length < 8) return res.status(400).json({ error: "Password too short (min 8)" });

    const exists = await db.get("SELECT id FROM users WHERE email = ?", normalized);
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const password_hash = await bcrypt.hash(password, 12);
    const result = await db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", normalized, password_hash);

    const user = { id: result.lastID, email: normalized };
    return res.status(201).json({ id: user.id, email: user.email, token: makeToken(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalized = String(email || "").trim().toLowerCase();

    const row = await db.get("SELECT * FROM users WHERE email = ?", normalized);
    if (!row) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password || ""), row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    return res.json({ id: row.id, email: row.email, token: makeToken(row) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- Start -----------------------------------------------
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
