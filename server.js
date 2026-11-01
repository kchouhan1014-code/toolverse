require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    throw new Error("DATABASE_URL or SESSION_SECRET is missing");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new PgSession({
        pool,
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
    res.json({
        website: "TOOLVERSE",
        status: "online",
        tools: 20
    });
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (username.trim().length < 2 || username.trim().length > 50) {
            return res.status(400).json({ error: "Username must be 2–50 characters" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: "Enter a valid email address" });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username.trim(), email.trim().toLowerCase(), passwordHash]
        );

        req.session.user = result.rows[0];

        res.status(201).json({
            message: "Account created successfully",
            user: req.session.user
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "This email is already registered" });
        }
        console.error("Registration error:", error.message);
        res.status(500).json({ error: "Could not create account" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const result = await pool.query(
            "SELECT id, username, email, password_hash FROM users WHERE email = $1",
            [email.trim().toLowerCase()]
        );

        if (!result.rows.length ||
            !(await bcrypt.compare(password, result.rows[0].password_hash))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({ error: "Login failed" });
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            res.json({
                message: "Login successful",
                user: req.session.user
            });
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Could not log in" });
    }
});

app.get("/api/auth/me", (req, res) => {
    res.json({
        authenticated: !!req.session.user,
        user: req.session.user || null
    });
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: "Logout failed" });
        }

        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
    });
});

async function startServer() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    app.listen(PORT, "0.0.0.0", () => {
        console.log("TOOLVERSE ONLINE");
        console.log("Port:", PORT);
    });
}

startServer().catch(error => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
});
