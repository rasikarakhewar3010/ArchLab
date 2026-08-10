<div align="center">

  <h1>🚀 ArchLab</h1>
  <p><strong>The Next-Generation Interactive System Architecture Design & Simulation Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Canvas-React_Flow-FF0072?logo=react&logoColor=white" alt="React Flow" />
    <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/Language-Python_3-3776AB?logo=python&logoColor=white" alt="Python" />
  </p>
</div>

<br />

## 📖 Overview

**ArchLab** is a powerful, full-stack application designed to revolutionize how developers, architects, and engineering teams design cloud systems. 

Moving beyond static diagramming tools, ArchLab provides a highly interactive **drag-and-drop canvas** backed by a powerful **Django REST API**. It allows users to design complex microservices, configure databases, setup load balancers, and immediately get automated **AI-driven feedback** on the scalability, reliability, and security of their designs.

---

## ✨ Core Features

* 🎨 **Fluid Interactive Canvas**: Built on top of `React Flow`, offering a buttery-smooth drag-and-drop experience.
* 🧩 **Rich Component Library**: Pre-configured components for Compute (Microservices, Functions), Storage (SQL, NoSQL, Caching), Networking (API Gateways, Load Balancers), and Security.
* 🤖 **AI Architecture Advisor**: Submit your system design to the backend AI engine to receive a comprehensive score and actionable insights on how to improve fault tolerance and performance.
* 🏆 **Architecture Challenges**: Test your skills with built-in system design challenges ranging from beginner to expert.
* 👥 **User Profiles & Collaboration**: Save designs, track your challenge scores, and manage your engineering portfolio.

---

## 🛠️ Technology Stack

ArchLab is built using a modern decoupled architecture (Monorepo).

### Frontend (User Interface & Canvas)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite (Lightning fast HMR)
- **Canvas Engine**: `@xyflow/react` (React Flow)
- **Styling**: Vanilla CSS with comprehensive CSS Variables for deep theming
- **Icons**: Lucide React

### Backend (API, AI Advisor & Data)
- **Framework**: Django (Python 3)
- **Architecture**: Modular Django Apps (`users`, `designs`, `challenges`, `ai_advisor`)
- **Database**: Configured for SQLite / PostgreSQL

---

## 🚀 Getting Started

Follow these instructions to get the entire ArchLab platform running on your local machine.

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.9+)

### 1️⃣ Starting the Backend (Django)

Open a terminal and navigate to the root directory, then:

```bash
# Navigate to the backend
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```
The backend API will now be running at `http://localhost:8000`.

### 2️⃣ Starting the Frontend (React)

Open a **new** terminal, navigate to the root directory, and run:

```bash
# Navigate to the frontend
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
The application UI will now be running at `http://localhost:5173`. Open this in your browser!

---

## 📂 Repository Structure

```text
ArchLab/
├── backend/                   # Django REST API
│   ├── apps/                  # Modular Django applications
│   │   ├── ai_advisor/        # AI feedback and scoring logic
│   │   ├── challenges/        # System design challenges
│   │   ├── designs/           # Canvas architecture state storage
│   │   └── users/             # Authentication and profiles
│   ├── config/                # Main Django settings
│   ├── manage.py              # Django entry point
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React User Interface
│   ├── src/
│   │   ├── components/        # Canvas, Sidebar, Header UI
│   │   ├── data/              # Component library definitions
│   │   ├── types/             # Strict TypeScript interfaces
│   │   └── App.tsx            # React entry point
│   ├── package.json           # Node dependencies
│   └── vite.config.ts         # Vite bundler configuration
│
└── README.md                  # You are here!
```

---

<div align="center">
  <p>Built with ❤️ for Software Architects & Engineers</p>
</div>
