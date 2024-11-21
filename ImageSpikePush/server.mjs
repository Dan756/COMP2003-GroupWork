import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 3000;

//Project API key
const OPENAI_API_KEY = "Insert API KEY;

// Using cors as middleware to handle cors errors so that the calls from the server and chat gpt server can go through
app.use(cors());

// Using express to parse information 
app.use(express.json());

// A Ping endpoint to allow for tests using tools such as postman without having to use the credit for the ai
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

// Proxy endpoint for OpenAI Image Generation API
app.post("/api/generate-image", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "A Prompt is required." });
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
                size: "256x256", //can change size to fit needs between a set list of 256x256, 512x512, and 1024x1024
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

// Code needed to start the server
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
