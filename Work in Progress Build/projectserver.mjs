import express from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
import cors from "cors";
import fetch from "node-fetch";

const PORT = 3000;
const app = express();
app.use(cors()); //middleware to prevent Cross origin resource sharing errors
app.use(express.json()); // Parse JSON body

//Project API key (API key has been removed for security reasons)
const OPENAI_API_KEY = "Insert Api Key";


// Database Configuration (Sensitive Details have been removed)
const dbConfig = {
    user: "Enter Username", 
    password: "Insert Password", 
    server: "localhost", 
    database: "UserLogin", 
    options: {
        encrypt: false, 
        trustServerCertificate: true, // Required for self-signed certs
    },
};

// A Ping endpoint to allow for tests using tools such as postman without having to use the credit for the ai
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});


app.post("/api/generate-image", async (req, res) => {
    try {
        const { prompt, size } = req.body;
        console.log("Received request body:", req.body); // Debugging

        if (!prompt) {
            return res.status(400).json({ error: "A Prompt is required." });
        }

        // Validate size input
        const validSizes = ["256x256", "512x512", "1024x1024"];
        if (!size || !validSizes.includes(size)) {
            return res.status(400).json({ error: "Invalid or missing size. Valid sizes are 256x256, 512x512, 1024x1024." });
        }

        const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: size, // Dynamically set size from form input
            }),
        });

        const data = await openaiResponse.json();

        if (!openaiResponse.ok) {
            return res.status(openaiResponse.status).json({ error: data.error.message || "Failed to generate image." });
        }

        res.status(200).json(data); // Status code indicating that it has all worked
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


// Registration Endpoint
app.post("/register", async (req, res) => {
    const { email, username, password } = req.body;

    function isPasswordStrong(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

    if (!email || !username || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (!isPasswordStrong(password)) {
        errorMessage.textContent = "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.";
        errorMessage.style.display = "block";
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const checkQuery = "SELECT * FROM Users WHERE Email = @Email OR Username = @Username";
        const result = await pool
            .request()
            .input("Email", sql.VarChar, email)
            .input("Username", sql.VarChar, username)
            .query(checkQuery);

        if (result.recordset.length > 0) {
            return res.status(400).json({ message: "Email or username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = "INSERT INTO Users (Email, Username, Password) VALUES (@Email, @Username, @Password)";
        await pool
            .request()
            .input("Email", sql.VarChar, email)
            .input("Username", sql.VarChar, username)
            .input("Password", sql.VarChar, hashedPassword)
            .query(insertQuery);

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "An error occurred." });
    }
});

// Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const query = "SELECT * FROM Users WHERE Email = @Email";
        const result = await pool.request().input("Email", sql.VarChar, email).query(query);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        res.status(200).json({ message: "Login successful.", username: user.Username });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "An error occurred." });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
