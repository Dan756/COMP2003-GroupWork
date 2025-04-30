import express from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
import cors from "cors";
import fetch from "node-fetch";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.mjs";
import session from "express-session";



const PORT = 3000;
const app = express();
app.use(
    cors({
        origin: "http://127.0.0.1:5500", // origin of the session key, was added for use of cookies but the feature was scrapped
        credentials: true, // Allow cookies
    })
); //middleware to prevent Cross origin resource sharing errors
app.use(express.json()); // Parse JSON body

app.use(
    session({
        secret: "COMP2003verysecretkey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true, //prevents js code from accessing the session
            secure: false,
            maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 1 day
        },
    })
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Project API key(API key removed for security reasons)
const OPENAI_API_KEY = "";


// Database Configuration
const dbConfig = {
    user: "sa",
    password: "ServerPassword2003!",
    server: "localhost",
    database: "UserLogin",
    options: {
        encrypt: false,
        trustServerCertificate: true, // Required for self-signed certs
    },
};



/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Check if the server is running
 *     description: Returns a success message if the server is running.
 *     responses:
 *       200:
 *         description: Server is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server is running!"
 */
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

/**
 * @swagger
 * /api/generate-image:
 *   post:
 *     summary: Generate an image using OpenAI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "A futuristic city at sunset"
 *               size:
 *                 type: string
 *                 example: "512x512"
 *     responses:
 *       200:
 *         description: Image generated successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal Server Error
 */
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


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
app.post("/register", async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    function isPasswordStrong(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }


    if (!isPasswordStrong(password)) {
        return res.status(500).json({
            error: "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters."
        });
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


/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 */

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

        req.session.user = { id: user.ID, email: user.Email, username: user.Username }; //store user data in session

        res.status(200).json({ message: "Login successful.", username: user.Username });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "An error occurred." });
    }
});
//Was for use for cookies which was scrapped
//Endpoint to check if a user if logged in with a valid session token
app.get("/session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(401).json({ loggedIn: false });
    }
});

//Endpoint to destroy the cookie when the user logs out
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid"); // Clears session cookie
        res.json({ message: "Logged out successfully" });
    });
});

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
    });
  }
  
  export default app; // Export app for testing