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
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Error connecting to PostgreSQL', err));

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
        const { username, height, weight, sex, dob, age, activityLevel, objective, calories, protein, carbs, fats, photoUri } = req.body;

        // Ensure all required fields are provided
        if (!username || !height || !weight || !sex || !dob || !age || !activityLevel || !objective || !photoUri) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Update the user profile in PostgreSQL
        const result = await pool.query(
            `UPDATE users 
            SET height = $1, weight = $2, sex = $3, dob = $4, age = $5, activityLevel = $6, objective = $7, calories = $8, protein = $9, carbs = $10, fats = $11, photoUri = $12
            WHERE username = $13;`,
            [height, weight, sex, dob, age, activityLevel, objective, calories, protein, carbs, fats, photoUri, username]
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

// Get distinct food categories from the foods table
app.get('/getCategories', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT DISTINCT category FROM foods;
    `);
        const categories = result.rows.map(row => row.category);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get foods by category (assuming foods table has a "category" column)
app.get('/getFoodsByCategory', async (req, res) => {
    const { category } = req.query;
    if (!category) {
        return res.status(400).json({ error: 'Category is required' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM foods WHERE category = $1',
            [category]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => console.log('Server running on http://10.0.2.2:3000'));
