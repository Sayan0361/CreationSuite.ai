import express from "express"
import cors from "cors"
import "dotenv/config"
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from "./routes/aiRoutes.js"
import connectCloudinary from "./configs/cloudinary.js"
import userRouter from "./routes/userRoutes.js"

const app = express()
const PORT = process.env.PORT || 3000

await connectCloudinary()

// Middleware
app.use(cors()) // allow frontend to talk to backend
app.use(express.json()) // parse incoming JSON data
app.use(clerkMiddleware()) // It checks the incoming request (headers + cookies) for a valid Clerk session token (JWT). if it finds one, it authenticates the user and attaches an object

app.get('/',(req,res)=>{
    res.send("Hello")
})

app.use(requireAuth()) // only login users can access this routes

app.use('/api/ai',aiRouter)
app.use('/api/user',userRouter)

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})