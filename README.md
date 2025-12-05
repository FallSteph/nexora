Nexora

A full-stack web application built with React (Vite) for the frontend and Node.js (Express + MongoDB) for the backend, using TypeScript, TailwindCSS, and several UI libraries.

Project Structure
nexora/
│
├─ BackEnd/       # Node.js + Express backend
│   ├─ server.js
│   └─ package.json
│
├─ FrontEnd/      # React + Vite frontend
│   ├─ src/
│   └─ package.json
│
└─ README.md

Frontend

The frontend is a React 18 application powered by Vite.
It uses Radix UI components, React Hook Form, TanStack React Query, and TailwindCSS for styling.

Main Features

Component library: Radix UI, Lucide Icons, CMDK, Sonner notifications

Form validation: React Hook Form + Zod

State management & data fetching: React Query

Styling: TailwindCSS + Tailwind Merge + Tailwind Animations

Utilities: Date handling, OTP input, PDF generation, charts, carousels

Key Commands
# Start frontend and backend concurrently
npm start

# Start only frontend dev server
npm run client

# Build production frontend
npm run build

# Run linting
npm run lint

Backend
    The backend is built with Node.js (v22+) and Express 5, connected to MongoDB via Mongoose.

Main Features
    REST API endpoints for authentication, user management, and modules
    JWT authentication (jsonwebtoken)
    File uploads (multer)
    Email notifications (nodemailer)
    CORS enabled for frontend integration

Key Commands
# Install backend dependencies
cd backend
npm install

# Start backend server
npm start


⚠️ Make sure to install backend dependencies before running npm start in the root. Missing packages like jsonwebtoken will cause the server to fail.

Setup & Installation

Clone the repository:

git clone <repo-url>
cd nexora


Install frontend dependencies:

cd FrontEnd
npm install


Install backend dependencies:

cd ../BackEnd
npm install


Start the development environment:

cd ../FrontEnd
npm start


The frontend will run at http://localhost:8080/ and the backend at its configured port 5000.

Dependencies Overview
    Frontend Dependencies
        UI & Components: @radix-ui/react-*, lucide-react, cmdk, sonner
        State & Data: @tanstack/react-query, react-hook-form, zod
        Utilities: axios, bcryptjs, date-fns, jsbarcode, jspdf, embla-carousel-react
        Routing & Themes: react-router-dom, next-themes
    
    Backend Dependencies
        Server & Middleware: express, cors, dotenv, bcrypt, jsonwebtoken, multer, node-fetch
        Database: mongoose
        Utilities: nodemailer, crypto, date-fns
        Frontend Shared Packages: react, react-dom, tailwindcss, etc.
    
    Dev Dependencies (both)
        eslint, @types/*, typescript, vite, nodemon, postcss, tailwindcss