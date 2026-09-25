# 🐐 Prep-Goat (Oh-My-SD)

**Prep-Goat** (internally known as *Oh-My-SD*) is an AI-powered platform for practicing and evaluating Software Design. It covers both **Low-Level Design (LLD)** and **High-Level Design (HLD)**, featuring an interactive editor, real-time AI evaluations using Groq, and a progress tracking dashboard.

---

## ✨ Features

- 📐 **High-Level Design (HLD) Track**: Integrated with `tldraw` for canvas-based, rich architecture design practice.
- 💻 **Low-Level Design (LLD) Track**: Text-based code editor with syntax highlighting for object-oriented design and algorithm implementation.
- 🤖 **AI-Powered Evaluation**: Automated grading using `Groq` LLM to evaluate SOLID principles, architecture choices, extensibility hooks, and test cases.
- 📊 **Detailed Feedback & Scorecards**: Radar charts breaking down your performance across various evaluation criteria (e.g., Scalability, Readability).
- 💡 **Hints & Sample Solutions**: A penalty-based hint system and high-quality, manually authored sample solutions that unlock post-submission.
- 🎓 **DB-Driven Learning**: A rich set of problems with constraints, learning resources, and integrated cheatsheets.
- 👤 **Progress Tracking**: LeetCode-style profile with difficulty rings, attempt history, and category mastery.

---

## 🏗️ Architecture & Tech Stack

The project follows a vertical slice architecture and is split into three main applications:

- **Frontend (`/web`)**: Next.js 16 (App Router), TailwindCSS v4, `tldraw`, Recharts, React Markdown.
- **Backend API (`/server`)**: Express 5, Prisma 7, Groq SDK for AI, Better Auth, WebSockets.
- **CMS (`/cms`)**: A Vite + React application for managing problems, test cases, and learning resources.
- **Database**: PostgreSQL (Neon Serverless).

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+)
- PostgreSQL (or a Neon DB URL)
- A Groq API Key
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Prep-Goat.git
   cd Prep-Goat
   ```

2. **Backend Setup (`/server`)**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="postgresql://..."
   GROQ_API_KEY="your_groq_api_key"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   RESEND_API_KEY="your_resend_api_key"
   ```
   Run database migrations and seed data:
   ```bash
   npx prisma migrate dev
   npm run seed:resources
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup (`/web`)**
   ```bash
   cd ../web
   npm install
   ```
   Create a `.env.local` file in the `web` directory:
   ```env
   NEXT_PUBLIC_TLDRAW_LICENSE_KEY="your_tldraw_key"
   NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key"
   NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
   ```
   Start the frontend app:
   ```bash
   npm run dev
   ```

4. **CMS Setup (`/cms`)** *(Optional, for content management)*
   ```bash
   cd ../cms
   npm install
   npm run dev
   ```

## 📂 Project Structure

- `/web` - The Next.js frontend application facing the users.
- `/server` - The Express backend serving API routes and handling LLM evaluation logic.
- `/cms` - An internal content management dashboard.
- `task.md` & `plan.md` - Technical implementation details and vertical slice breakdown.

## 🤝 Contributing

Contributions are welcome! If you're adding new features or fixing bugs, please ensure that you follow the vertical slice approach and test both LLD and HLD flows.

## 📄 License

This project is licensed under the MIT License.
