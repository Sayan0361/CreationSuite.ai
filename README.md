# CreationSuite.ai - AI-Powered SaaS Platform

CreationSuite.ai is a SaaS platform offering AI-powered content creation tools with a freemium model. Experience powerful AI tools for content generation, resume optimization, and creative design.

- **Vercel Deployment:** https://creation-suite-ai.vercel.app/
- **AWS EC2 Deployment:** http://ec2-13-205-97-8.ap-south-1.compute.amazonaws.com

  Note: The EC2 instance maybe stopped for now


## 🚀 Feature Tiers

### 🆓 Free Tier (No Subscription Required)
| Feature | Description | Path |
|---------|-------------|------|
| **AI Content Generator** | Create well-researched articles on any topic | `/ai/write-article` |
| **Blog Title Suggester** | Generate engaging blog post titles | `/ai/blog-titles` |
| **Text Humanizer** | Make AI text sound natural and human-like | `/ai/humanize-text` |
| **Resume Reviewer** | Get AI-powered feedback on your resume | `/ai/review-resume` |
| **ATS Score Calculator** | Check resume performance in tracking systems | `/ai/calculate-ats-score` |

### 💎 Premium Tier (Subscription Required)
| Feature | Description | Path |
|---------|-------------|------|
| **AI Art Generator** | Create stunning visuals from text prompts | `/ai/generate-images` |
| **Background Eraser** | Automatically remove image backgrounds | `/ai/remove-background` |
| **Object Eraser** | Remove unwanted objects from images | `/ai/remove-object` |
| **Chat With PDF** | Analyze and interact with PDF documents | `/ai/chat-with-pdf` |

## 🛠️ Core Technology

### Frontend
- **React.js** (Vite) - Modern frontend framework
- **Tailwind CSS** - Utility-first styling
- **Clerk** - Secure authentication
- **Axios** - API communication

### Backend Services
- **Node.js/Express** - Robust API server
- **PostgreSQL** - Relational database (Neon)
- **Cloudinary** - Image processing pipeline

### AI Integrations
- **Google Gemini API** - Powers text generation
- **Clipdrop API** - Handles image generation/editing

### Infrastructure
- **AWS EC2 (Ubuntu + Nginx + PM2)** - Production deployment
- **Vercel** - Frontend deployment
- **Neon** - Serverless PostgreSQL
- **Cloudinary** - Image CDN & Storage

---

<div align="center">
  <p>Experience the future of content creation at <a href="https://creation-suite-ai.vercel.app/" target="_blank">CreationSuite.ai</a> ✨</p>
</div>
