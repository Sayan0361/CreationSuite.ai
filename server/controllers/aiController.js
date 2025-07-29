// Import Clerk's backend client to interact with users and their metadata
import { clerkClient } from "@clerk/express"
// For api fetch 
import axios from "axios"
import {v2 as cloudinary} from 'cloudinary'
import OpenAI from "openai";
import sql from "../configs/db.js";
import fs from "fs"
import pdf from "pdf-parse/lib/pdf-parse.js"
import path from 'path';


// Configure upload directory
const uploadDir = path.join(process.cwd(), 'uploads');

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
        if (plan !== 'premium' && free_usage >= 30) {
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

export const generateBlobTitle = async (req, res) => {
    try {
        // Get the userId from Clerk’s auth helper attached by middleware
        const { userId } = req.auth();

        // Destructure prompt from the request body (sent from frontend)
        const { prompt } = req.body;

        // Get plan type and free_usage values added earlier by the custom auth middleware
        const plan = req.plan;
        const free_usage = req.free_usage;

        // Check if the user is on the free plan AND has already used the free quota
        if (plan !== 'premium' && free_usage >= 30) {
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
        });

        // Extract the generated content from the response
        const content = response.choices[0].message.content;

        // Save the generated article in your database (Postgres)
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
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

export const humanizeText = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { text } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        // Validate input length
        if (!text || text.trim().length === 0) {
            return res.json({
                success: false,
                message: "Please provide text to humanize"
            });
        }

        // Check word count (approximately)
        const wordCount = text.trim().split(/\s+/).length;
        if (wordCount > 1000) {
            return res.json({
                success: false,
                message: "Text exceeds 1000 word limit"
            });
        }

        // Check free tier limits
        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Limit reached. Please upgrade to continue."
            });
        }

        const prompt = `Please rewrite the following text to make it sound more natural and human-like, while preserving its original meaning. Make it conversational and engaging:\n\n${text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.5, // Balanced creativity
        });

        const humanizedText = response.choices[0].message.content;

        // Save to database
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${'Humanize text'}, ${humanizedText}, 'text-humanizer')
        `;

        // Update free usage count for free tier users
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({
            success: true,
            content: humanizedText
        });

    } catch (error) {
        console.error(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const generateImage = async (req, res) => {
    try {
        // Get the authenticated user's ID from Clerk
        const { userId } = req.auth();
        // Get the prompt and publish flag from frontend
        const { prompt, publish } = req.body;
        // Get user's current plan (no free tier allowed here)
        const plan = req.plan;
        
        // Only premium users can use image generation
        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }
        // Create form data with the prompt for the Clipdrop API
        const formData = new FormData();
        formData.append('prompt', prompt);

        // Call Clipdrop's text-to-image API with API key
        const { data } = await axios.post(
            "https://clipdrop-api.co/text-to-image/v1",
            formData,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                },
                responseType: "arraybuffer", // tells axios to return raw binary data
            }
        );
        // Convert binary image buffer into base64 format to upload to Cloudinary
        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
        // Upload the image to Cloudinary and get the secure URL
        const { secure_url } = await cloudinary.uploader.upload(base64Image);
        // Save the image URL and prompt to your database as a new creation
        await sql`
            INSERT INTO creations(user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
        `;
        // Send the generated image URL back to the frontend
        res.json({
            success: true,
            content: secure_url
        });

    } catch (error) {
        // Log and return the error if something goes wrong
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file; // From memoryStorage
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        // Convert buffer to base64 for Cloudinary
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        
        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            transformation: [{ effect: 'background_removal' }]
        });

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, 'Remove Background', ${secure_url}, 'image')
        `;

        res.json({
            success: true,
            content: secure_url
        });

    } catch (error) {
        console.error(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file; // From memoryStorage
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        // Convert buffer to base64 for Cloudinary
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        
        const { public_id } = await cloudinary.uploader.upload(base64Image);
        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}` }],
            resource_type: 'image'
        });

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`Remove ${object}`}, ${public_id}, 'image')
        `;

        res.json({
            success: true,
            content: imageUrl
        });

    } catch (error) {
        console.error(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

// ==================== PDF PROCESSING ====================
export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file; // From memoryStorage
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Limit reached. Please upgrade to continue."
            });
        }

        // Process PDF directly from buffer
        const pdfData = await pdf(resume.buffer);
        const prompt = `Review this resume: ${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, 'Resume Review', ${content}, 'resume-review')
        `;

        // Update free usage count for free tier users
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({
            success: true,
            content
        });

    } catch (error) {
        console.error(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const calculateATSScore = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file; // From memoryStorage
        const { jobDescription } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Limit reached. Please upgrade to continue."
            });
        }

        // Process PDF directly from buffer
        const pdfData = await pdf(resume.buffer);
        const resumeText = pdfData.text;

        const prompt = `
        Analyze this resume against the job description and return an ATS score (0-100) in JSON format:
        {
            "score": number,
            "breakdown": { ... },
            "feedback": string,
            "suggestions": string[]
        }
        Job Description: ${jobDescription}
        Resume Content: ${resumeText}
        `;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        });

        // Parse the JSON response
        let result;
        try {
            const jsonMatch = response.choices[0].message.content.match(/```json\n([\s\S]*?)\n```/);
            result = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(response.choices[0].message.content);
        } catch (e) {
            throw new Error("Failed to parse ATS score response");
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`ATS Score for ${resume.originalname}`}, ${JSON.stringify(result)}, 'ats-score')
        `;

        // Update free usage count for free tier users
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        
        res.json({
            success: true,
            content: result
        });

    } catch (error) {
        console.error(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const chatWithPDF = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { message, chatHistory = [] } = req.body;
        const pdfFile = req.file;
        const plan = req.plan;

        // Premium check
        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "Premium feature"
            });
        }

        // Validate inputs
        if (!pdfFile || !message) {
            return res.status(400).json({
                success: false,
                message: "Missing PDF or message"
            });
        }

        // Process PDF
        const pdfData = await pdf(pdfFile.buffer);
        const pdfText = pdfData.text.substring(0, 30000); // Truncate to avoid token limits

        // Prepare messages array
        const messages = [
            {
                role: "system",
                content: `You are a helpful PDF assistant. Analyze this PDF content and answer questions:
                
                ${pdfText}`
            },
            ...(Array.isArray(chatHistory) ? chatHistory : []), // Ensure chatHistory is an array
            {
                role: "user",
                content: message
            }
        ];

        // Call Gemini API
        const response = await AI.chat.completions.create({
            model: "gemini-1.5-flash",
            messages,
            temperature: 0.3,
        });

        const aiResponse = response.choices[0].message.content;

        // Store interaction
        await sql`
            INSERT INTO pdf_chats (user_id, file_name, user_message, ai_response)
            VALUES (${userId}, ${pdfFile.originalname}, ${message}, ${aiResponse})
        `;

        res.json({
            success: true,
            response: aiResponse,
            chatHistory: [
                ...(Array.isArray(chatHistory) ? chatHistory : []),
                { role: "user", content: message },
                { role: "assistant", content: aiResponse }
            ]
        });

    } catch (error) {
        console.error("PDF chat error:", {
            message: error.message,
            stack: error.stack,
            request: {
                file: req.file?.originalname,
                message: req.body.message,
                chatHistory: req.body.chatHistory
            }
        });

        // More specific error messages
        let userMessage = "PDF processing failed";
        if (error.status === 400) {
            userMessage = "Invalid request to AI service - please check your input";
        } else if (error.message.includes("Unexpected token")) {
            userMessage = "Invalid PDF content";
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== CHAT HISTORY ====================
export const getPDFChatHistory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { file_name } = req.query;

        if (!file_name) {
            // If no file_name provided, return list of available files
            const files = await sql`
                SELECT file_name 
                FROM pdf_chats 
                WHERE user_id = ${userId}
                GROUP BY file_name
                ORDER BY MAX(created_at) DESC
            `;
            return res.json({ 
                success: true, 
                files: files.map(f => f.file_name) 
            });
        }

        // If file_name provided, return messages for that file
        const history = await sql`
            SELECT user_message, ai_response, created_at, file_name
            FROM pdf_chats 
            WHERE user_id = ${userId} AND file_name = ${file_name}
            ORDER BY created_at ASC
        `;

        const chatHistory = history.flatMap(entry => [
            { role: "user", content: entry.user_message },
            { role: "assistant", content: entry.ai_response }
        ]);

        res.json({ 
            success: true, 
            chatHistory,
            fileName: file_name 
        });

    } catch (error) {
        console.error("Chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve history"
        });
    }
};