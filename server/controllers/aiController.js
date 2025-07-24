// Import Clerk's backend client to interact with users and their metadata
import { clerkClient } from "@clerk/express"

// Import OpenAI SDK (you’re using it to generate content from prompts)
import OpenAI from "openai";

// Import the configured SQL database connection (Neon or any Postgres DB)
import sql from "../configs/db.js";

// Create an instance of OpenAI with your Gemini API key and baseURL
const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY, // Your Gemini API key from .env file
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" // Gemini-compatible endpoint
});

// Controller function to generate an article based on user input
export const generateArticle = async (req, res) => {
    try {
        // Get the userId from Clerk’s auth helper attached by middleware
        const { userId } = req.auth();

        // Destructure prompt and length from the request body (sent from frontend)
        const { prompt, length } = req.body;

        // Get plan type and free_usage values added earlier by the custom auth middleware
        const plan = req.plan;
        const free_usage = req.free_usage;

        // Check if the user is on the free plan AND has already used the free quota
        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({
                success: false,
                message: "Limit reached. Please upgrade to continue."
            });
        }

        // Use Gemini's API to generate content from the given prompt
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash", // Model to use
            messages: [
                {
                    role: "user", // Send the user prompt to the AI
                    content: prompt,
                },
            ],
            temperature: 0.7, // Controls creativity (0 = less random, 1 = more)
            max_tokens: length, // Controls the length of the output
        });

        // Extract the generated content from the response
        const content = response.choices[0].message.content;

        // Save the generated article in your database (Postgres)
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        // If the user is on the free plan, increment their free_usage by 1
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        // Send the generated content back to the frontend
        res.json({
            success: true,
            content
        });

    } catch (error) {
        // Log the error and send error message to the frontend
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}
