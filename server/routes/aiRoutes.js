import express from "express"
import { auth } from "../middlewares/auth.js"
import { generateArticle, generateBlobTitle, generateImage } from "../controllers/aiController.js"

const aiRouter = express.Router()
aiRouter.post('/generate-article',auth,generateArticle)
aiRouter.post('/generate-blog-title',auth,generateBlobTitle)
aiRouter.post('/generate-image',auth,generateImage)

export default aiRouter 