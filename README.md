# CreationSuite.ai - AI-Powered Content Creation Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-CreationSuite.ai-brightgreen?style=for-the-badge&logo=vercel)](https://creation-suite-ai.vercel.app/)
![GitHub last commit](https://img.shields.io/github/last-commit/Sayan0361/CreationSuite.ai)
![GitHub license](https://img.shields.io/github/license/Sayan0361/CreationSuite.ai)

CreationSuite.ai is a comprehensive AI-powered platform that offers various content creation and enhancement tools, from article generation to resume optimization and AI art creation.

## 🚀 Key Features

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CreationSuite+Dashboard+Preview" alt="Dashboard Preview">
</div>

### ✨ AI Content Tools

| Feature | Description | Path | Status |
|---------|-------------|------|--------|
| **AI Content Generator** | Create well-researched articles on any topic | `/ai/write-article` | ✅ Live |
| **Blog Title Suggester** | Generate engaging blog post titles | `/ai/blog-titles` | ✅ Live |
| **Text Humanizer** | Make AI text sound natural and human-like | `/ai/humanize-text` | ✅ Live |
| **Resume Reviewer** | Get AI-powered feedback on your resume | `/ai/review-resume` | ✅ Live |
| **ATS Score Calculator** | Check how well your resume performs in tracking systems | `/ai/calculate-ats-score` | ✅ Live |
| **AI Art Generator** | Create stunning visuals from text prompts | `/ai/generate-images` | ✅ Live |
| **Background Eraser** | Automatically remove image backgrounds | `/ai/remove-background` | ✅ Live |
| **Object Eraser** | Remove unwanted objects from images | `/ai/remove-object` | ✅ Live |
| **Chat With PDF** | Analyze and interact with PDF documents | `/ai/chat-with-pdf` | ✅ Live |

## 🛠️ Technology Stack

### Frontend
- **React.js** (Vite) - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### Backend
- **Node.js** (ES Modules) - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** (via Neon) - Relational database
- **Cloudinary** - Image processing and storage
- **PDF-parse** - PDF text extraction

### AI Services
- **Google Gemini API** - Powers all text generation features
- **Clipdrop API** - Handles AI image generation and editing

### Infrastructure
- **Vercel** - Frontend hosting and deployment
- **Neon** - Serverless PostgreSQL database
- **Cloudinary** - Image management CDN
