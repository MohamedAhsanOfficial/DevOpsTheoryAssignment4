const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const client = require('prom-client'); // Prometheus client

const app = express();
const PORT = 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'collage.db');

// Create a Registry which registers the metrics
const register = new client.Registry();
// Add a default label which is added to all metrics
client.collectDefaultMetrics({ register });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure DB directory exists if it's a custom path (mostly for PVC)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Database Setup
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log(`Connected to the SQLite database at ${DB_PATH}`);
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            department TEXT NOT NULL,
            year INTEGER
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            }
        });
    }
});

// Routes
app.get('/', (req, res) => {
    const sql = "SELECT * FROM students";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render('index', { students: rows });
    });
});

app.post('/add', (req, res) => {
    const sql = "INSERT INTO students (name, email, department, year) VALUES (?, ?, ?, ?)";
    const student = [req.body.name, req.body.email, req.body.department, req.body.year];
    db.run(sql, student, (err) => {
        if (err) {
            console.error(err.message);
            // Simple duplicate error handling or similar could go here
        }
        res.redirect('/');
    });
});

app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM students WHERE id = ?";
    db.run(sql, id, (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect('/');
    });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
