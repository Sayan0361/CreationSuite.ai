// Import Clerk's backend client to interact with users and their metadata
import { clerkClient } from "@clerk/express"
// For api fetch 
import axios from "axios"
import {v2 as cloudinary} from 'cloudinary'
import OpenAI from "openai";
import sql from "../configs/db.js";
import fs from "fs"
import pdf from "pdf-parse/lib/pdf-parse.js"

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
        const {image} = req.file;
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
        const {image} = req.file;
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
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image')
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
        const {resume} = req.file;
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
            max_tokens: 1000, // Controls the length of the output
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
