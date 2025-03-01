require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const port = 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,  // This will be "localhost" for now
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Error connecting to PostgreSQL', err));

// Create users table if not exists
// pool.query(`
// CREATE TABLE IF NOT EXISTS users (
//     id SERIAL PRIMARY KEY, 
//     username TEXT UNIQUE, 
//     email TEXT, 
//     password TEXT, 
//     height REAL, 
//     weight REAL, 
//     sex TEXT, 
//     dob TEXT,
//     age INTEGER,
//     activityLevel REAL,
//     objective TEXT,
//     calories REAL,
//     protein REAL,
//     carbs REAL,
//     fats REAL
// );
//     `, (err) => {
//     if (err) console.error('Error creating users table', err);
// });

// Register User API
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            [username, email, password]
        );

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update User Profile API
app.post('/updateProfile', async (req, res) => {
    try {
        const { username, height, weight, sex, dob, age, activityLevel, objective, calories, protein, carbs, fats } = req.body;

        // Ensure all required fields are provided
        if (!username || !height || !weight || !sex || !dob || !age || !activityLevel || !objective) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Update the user profile in PostgreSQL
        const result = await pool.query(
            `UPDATE users 
            SET height = $1, weight = $2, sex = $3, dob = $4, age = $5, activityLevel = $6, objective = $7, calories = $8, protein = $9, carbs = $10, fats = $11
            WHERE username = $12;`,
            [height, weight, sex, dob, age, activityLevel, objective, calories, protein, carbs, fats, username]
        );

        if (result.rowCount > 0) {
            res.json({ message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile in PostgreSQL:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

app.listen(port, () => console.log('Server running on http://10.0.2.2:3000'));
