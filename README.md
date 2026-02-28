# CipherSQL Studio

CipherSQL Studio is an interactive, browser-based SQL learning and sandbox environment. It allows users to write SQL queries against a sample database, receive instant feedback, and get AI-powered hints to resolve errors.

## Table of Contents
1. [Project Setup](#project-setup)
2. [Environment Variables](#environment-variables)
3. [Technology Choices](#technology-choices)

---

## Project Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository_url>
cd CIPHER
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and seed the initial assignment data:
```bash
cd backend
npm install

# Seed the MongoDB database with initial SQL tasks
node src/seed.js

# Start the backend development server
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the Vite dev server:
```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Environment Variables

To run the application, you need to create a `.env` file in the `backend` directory.

### `backend/.env`
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection (for storing assignments and user attempts history)
MONGODB_URI=mongodb://localhost:27017/cipher_studio

# Google AI / Gemini API Key (for generating smart hints)
LLM_API_KEY=your_gemini_api_key_here

# Optional: PostgreSQL Connection (if transitioning away from in-memory SQLite in the future)
POSTGRES_URI=postgresql://sql_student:password@localhost:5432/cipher_sandbox
```

*Note: For the frontend, Vite automatically proxies API requests or uses `VITE_API_BASE_URL` if set in a `.env` file inside the `frontend` folder. By default, it expects the backend at `http://localhost:5000/api`.*

---

## Technology Choices

Here are the key technologies used to build CipherSQL Studio and the reasoning behind them:

### Frontend
- **React.js & Vite**: Vite provides an ultra-fast development server with Hot Module Replacement (HMR). React allows us to build a rich, component-driven user interface.
- **SCSS**: Offers powerful styling features like variables, nested rules, and mixins, keeping our custom UI design system organized and maintainable over standard CSS.
- **Monaco Editor (`@monaco-editor/react`)**: The engine that powers VS Code. We use it to provide users with a world-class code writing experience in the browser, complete with syntax highlighting and line numbers.

### Backend
- **Node.js & Express**: Provides a lightweight, fast, and unopinionated framework for building REST APIs to handle query execution and AI requests.
- **MongoDB & Mongoose**: Used for persistent storage of learning data (Assignments, Tasks, and User Attempts). A NoSQL document database is perfect for saving flexible schemas like "Expected Table Schemas" and user query history.
- **`sql.js` (In-Memory SQLite)**: To provide a safe "sandbox" for users to execute SQL without risking injection attacks or corrupting an actual persistent database, we use `sql.js`. Every time the backend runs, it constructs a fresh SQLite database in memory with seed data, ensuring users always have a clean slate to practice SELECT queries on.
- **Google Generative AI (Gemini HTTP API)**: Used as an "AI Tutor." Instead of just returning standard SQL errors, the Gemini API analyzes the user's failed query and the expected assignment context to contextually generate a supportive hint without directly revealing the solution.
