# TalentLens AI - Discover Talent Beyond Keywords

**TalentLens AI** is a next-generation, venture-backed AI talent intelligence platform designed to replace legacy keyword-based candidate filtering. Built using the MERN stack, TalentLens AI evaluates candidates holistically based on their actual skills, assessment performance, and AI-driven capability profiling.

---

## 🚀 Key Features

### 💼 Recruiter Suite
- **Advanced Dashboard**: Track key metrics like active jobs, total candidates, hiring funnels, and assessment statistics.
- **Job Posting & Management**: Publish detailed job listings with structured skill requirements.
- **Candidate Tracking System (ATS)**: Manage applicant pipelines through customized recruitment stages.
- **AI-Powered Profile Analysis**: Extract deeper insights, evaluate resumes against job requirements, and generate capability match scores automatically using advanced LLMs (Groq AI).

### 🎓 Candidate Experience
- **Interactive Dashboard**: Track the real-time status of all active job applications.
- **Skill Assessments**: Complete online tests and interactive assessments built directly into the platform.
- **Dynamic Profile Management**: Manage resumes, build personal portfolios, showcase core competencies, and upload profile documents (integrated with Cloudinary).

### ⚙️ Platform Features
- **MERN Stack Foundation**: High performance, single page application powered by React, Node.js, Express, and MongoDB.
- **Real-Time Notifications**: Integrated event system notifies users about application status updates, new assessments, and recruiter activities.
- **Secure Authentication**: Role-based access control with JWT access tokens, refresh tokens, and password hashing.
- **Transactional Mail Services**: Email alerts powered by SMTP (Brevo) for key application events.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Redux Toolkit (State Management), Tailwind CSS, React Router, Chart.js / Recharts.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ODM).
- **AI Engine**: Groq Cloud API (Llama 3 / Mixtral models for lightning-fast analysis).
- **Storage**: Cloudinary API for secure resume and avatar image storage.
- **Communication**: Brevo SMTP for transactional emails.

---

## 📦 Project Structure

```
HackSkills/
├── server/                    # Node.js + Express.js Backend
│   ├── src/
│   │   ├── config/            # DB & service configurations
│   │   ├── controllers/       # Controller logic (Auth, Jobs, Candidates, Assessments, Notifications)
│   │   ├── models/            # Mongoose Schemas (User, Job, Candidate, Application, Assessment, etc.)
│   │   ├── routes/            # REST API Endpoint Routers
│   │   ├── middleware/        # Authentication, Error handling, Role verification, Uploads
│   │   └── utils/             # Helper functions (Groq AI integration, Brevo SMTP emailer)
│   ├── .env.example           # Server configuration template
│   └── package.json           # Backend dependencies
│
└── client/                    # Vite + React Frontend
    ├── src/
    │   ├── components/        # Reusable UI elements (Navbar, Sidebar, Tables, etc.)
    │   ├── pages/             # Page components (Candidate, Recruiter, Admin, Landing, Login)
    │   ├── redux/             # Redux Store and Auth/API Slices
    │   └── utils/             # API clients and helpers
    ├── tailwind.config.js     # Tailwind styling setup
    └── package.json           # Frontend dependencies
```

---

## 🔧 Installation & Local Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Local or Atlas URI)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/jashvithak18/TalentLens-AI.git
cd TalentLens-AI
```

### 2. Configure the Backend Server
Go to the server directory:
```bash
cd server
```
Create a `.env` file based on the template:
```bash
cp .env.example .env
```
Fill in the configuration variables inside `.env`:
- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: Secure random keys.
- `GROQ_API_KEY`: Your Groq API key for candidate scoring.
- `CLOUDINARY_*` details (Optional - fallback to local storage if empty).
- `SMTP_*` configuration (Optional - logs to console if empty).

Install dependencies and start the backend:
```bash
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Configure the Frontend Client
Open a new terminal and navigate to the client directory:
```bash
cd client
```
Install dependencies and start the dev server:
```bash
npm install
npm run dev
```
The client application will run on `http://localhost:5173`.

---

## 🔒 Security & Best Practices
- **Token Security**: Tokens are handled securely with proper token expiry (AccessToken 24h, RefreshToken 7d) and secure authentication headers.
- **Environment Safety**: Credentials and keys are stored in server `.env` which is excluded from git tracking.
- **Error Handling**: Centrally managed middleware ensures user-facing security without revealing underlying architecture stacks in responses.
