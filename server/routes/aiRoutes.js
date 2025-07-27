import express from "express"
import { auth } from "../middlewares/auth.js"
import { calculateATSScore, chatWithPDF, generateArticle, generateBlobTitle, generateImage, getPDFChatHistory, humanizeText, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js"
import { upload } from "../configs/multer.js"

const aiRouter = express.Router()

aiRouter.post('/generate-article',auth,generateArticle)
aiRouter.post('/generate-blog-title',auth,generateBlobTitle)
aiRouter.post('/humanize-text',auth,humanizeText)

aiRouter.post('/generate-image',auth,generateImage)
aiRouter.post('/remove-image-background',upload.single('image'),auth,removeImageBackground)
aiRouter.post('/remove-image-object',upload.single('image'),auth,removeImageObject)

aiRouter.post('/resume-review',upload.single('resume'),auth,resumeReview)
aiRouter.post('/calculate-ats-score',upload.single('resume'),auth,calculateATSScore)

aiRouter.post('/chat-with-pdf', upload.single('pdf'), auth, chatWithPDF)
aiRouter.get('/pdf-chat-history', auth, getPDFChatHistory)


export default aiRouter 