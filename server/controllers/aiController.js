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
        if (plan !== 'premium' && free_usage >= 10) {
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
        // Get the authenticated user's ID from Clerk
        const { userId } = req.auth();
        // Get image from configs/multer.js
        const image = req.file;
        // Get user's current plan (no free tier allowed here)
        const plan = req.plan;
        
        // Only premium users can use image generation
        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }
        
        // Upload the image to Cloudinary and get the secure URL
        const { secure_url } = await cloudinary.uploader.upload(image.path,{
            transformation:[
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        });

        const prompt = 'Remove Background from the image'
        // Save the image URL and prompt to your database as a new creation
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image')
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

export const removeImageObject = async (req, res) => {
    try {
        // Get the authenticated user's ID from Clerk
        const { userId } = req.auth();
        // Get the object
        const { object } = req.body;
        // Get image from configs/multer.js
        const image = req.file;
        // Get user's current plan (no free tier allowed here)
        const plan = req.plan;
        // Only premium users can use image generation
        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }
        
        // Upload the image to Cloudinary and get the secure URL
        const { public_id } = await cloudinary.uploader.upload(image.path);
        
        const imageUrl = cloudinary.url(public_id, {
            transformation:[{effect:`gen_remove:${object}`}],
            resource_type:'image'
        })
        const prompt = `Remove ${object} from the Image`
        // Save the image URL and prompt to your database as a new creation
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${public_id}, 'image')
        `;
        // Send the generated image URL back to the frontend
        res.json({
            success: true,
            content: imageUrl
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

export const resumeReview = async (req, res) => {
    try {
        // Get the authenticated user's ID from Clerk
        const { userId } = req.auth();
        // Get resume from configs/multer.js
        const resume = req.file;
        // Get user's current plan (no free tier allowed here)
        const plan = req.plan;
        // Only premium users can use review resume
        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }
        if(resume.size> 5*1024*1024)
            return res.json({
                success: false,
                message:"Resume file size exceeds 5mb"
            })
        
        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        const prompt = `Review the following resume and provide constructive feedback on its strengths,weaknesses and areas for feasible improvements.Also provide a roadmap what needs to be done. Also be frank and guide as an experienced industry level helpful senior. Resume Content:\n\n${pdfData.text}`
        
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

        const content = response.choices[0].message.content
        // Save the image URL and prompt to your database as a new creation
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;
        // Send the generated image URL back to the frontend
        res.json({
            success: true,
            content: content
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

export const calculateATSScore = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const { jobDescription } = req.body;
        const plan = req.plan;

        // Only premium users can use this feature
        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        // Check file size
        if (resume.size > 5 * 1024 * 1024) {
            return res.json({
                success: false,
                message: "Resume file size exceeds 5MB"
            });
        }

        // Read and parse PDF
        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);
        const resumeText = pdfData.text;

        // Prepare prompt for Gemini
        const prompt = `
        Analyze this resume against the provided job description and calculate an ATS compatibility score (0-100).
        Consider these factors:
        1. Keyword matching (20 points)
        2. Skills alignment (20 points)
        3. Experience relevance (20 points)
        4. Education requirements (10 points)
        5. Certifications (10 points)
        6. Formatting (10 points)
        7. Custom sections (10 points)

        Return the response in this JSON format:
        {
            "score": number,
            "breakdown": {
                "keyword_matching": number,
                "skills_alignment": number,
                "experience_relevance": number,
                "education_requirements": number,
                "certifications": number,
                "formatting": number,
                "custom_sections": number
            },
            "feedback": string,
            "suggestions": string[]
        }

        Job Description: ${jobDescription}
        Resume Content: ${resumeText}
        `;

        // Call Gemini API
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.3, // Lower temperature for more deterministic scoring
        });

        let result;
        try {
            // Try to parse the JSON response
            result = JSON.parse(response.choices[0].message.content);
        } catch (e) {
            // If parsing fails, try to extract JSON from markdown
            const jsonMatch = response.choices[0].message.content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[1]);
            } else {
                throw new Error("Failed to parse ATS score response");
            }
        }

        // Save results to database
        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`ATS Score for ${resume.originalname}`}, ${JSON.stringify(result)}, 'ats-score')
        `;

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
        // Authentication and premium check
        const { userId } = req.auth();
        const plan = req.plan;
        
        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "PDF chat feature requires a premium subscription"
            });
        }

        // Validate request
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF file uploaded"
            });
        }

        // Parse additional form data
        const { message, chatHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "No message provided"
            });
        }

        // File handling
        const pdfFile = req.file;
        const filePath = path.join(uploadDir, pdfFile.filename || `${Date.now()}-${pdfFile.originalname}`);

        // Read and parse PDF
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        const pdfText = pdfData.text;

        // Truncate text if too long
        const truncatedText = pdfText.length > 30000 
            ? pdfText.substring(0, 30000) + "... [content truncated]" 
            : pdfText;

        // Parse chat history if provided
        let parsedHistory = [];
        try {
            parsedHistory = chatHistory ? JSON.parse(chatHistory) : [];
        } catch (e) {
            console.warn("Invalid chat history format", e);
        }

        // Prepare messages for Gemini
        const messages = [
            {
                role: "system",
                content: `You are a helpful PDF assistant. Analyze this PDF content and answer questions:
                
                ${truncatedText}`
            },
            ...parsedHistory,
            {
                role: "user",
                content: message
            }
        ];

        // Call Gemini API
        const response = await AI.chat.completions.create({
            model: "gemini-1.5-flash",
            messages: messages,
            temperature: 0.3
        });

        const aiResponse = response.choices[0].message.content;

        // Store interaction
        await sql`
            INSERT INTO pdf_chats (user_id, file_name, user_message, ai_response)
            VALUES (${userId}, ${pdfFile.originalname}, ${message}, ${aiResponse})
        `;

        // Clean up
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            response: aiResponse,
            chatHistory: [
                ...parsedHistory,
                { role: "user", content: message },
                { role: "assistant", content: aiResponse }
            ]
        });

    } catch (error) {
        console.error("PDF chat error:", error);
        
        // Clean up file if error occurred
        if (req.file?.filename) {
            const filePath = path.join(uploadDir, req.file.filename);
            fs.unlinkSync(filePath).catch(() => {});
        }

        res.status(500).json({
            success: false,
            message: error.message.includes("Unexpected token") 
                ? "Invalid PDF file content" 
                : error.message || "Failed to process PDF chat request"
        });
    }
};

export const getPDFChatHistory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { file_name } = req.query;

        if (!file_name) {
            return res.status(400).json({
                success: false,
                message: "File name is required"
            });
        }

        const history = await sql`
            SELECT user_message, ai_response, created_at 
            FROM pdf_chats 
            WHERE user_id = ${userId} 
            AND file_name = ${file_name}
            ORDER BY created_at ASC
        `;

        // Format as conversation history
        const chatHistory = [];
        history.forEach(entry => {
            chatHistory.push(
                { role: "user", content: entry.user_message },
                { role: "assistant", content: entry.ai_response }
            );
        });

        res.json({
            success: true,
            chatHistory
        });

    } catch (error) {
        console.error("Chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve chat history"
        });
    }
};