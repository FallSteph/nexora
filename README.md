# Nexora

A modern full-stack web application built with React, Vite, TypeScript, and Express.js.

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** TanStack React Query
- **Routing:** React Router DOM
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Drag & Drop:** dnd-kit
- **PDF Generation:** jsPDF + jspdf-autotable
- **Barcode:** JsBarcode
- **Notifications:** Sonner, React Hot Toast

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, bcrypt, Google Auth Library
- **File Uploads:** Multer
- **Email:** Nodemailer
- **Security:** CORS

## Project Structure

```
├── FrontEnd/
│   ├── src/
│   │   └── ... (React components, pages, hooks)
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── BackEnd/
    ├── server.js
    ├── db.js
    ├── package.json
    └── ... (routes, models, controllers)
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB instance (local or cloud)

## Environment Variables

Create a `.env` file in both FrontEnd and BackEnd directories:

### Backend `.env`
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
PORT=5000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Installation

### Frontend Setup
```bash
cd FrontEnd
npm install
```

### Backend Setup
```bash
cd BackEnd
npm install
```

## Running the Application

### Development Mode

**Run both frontend and backend concurrently (from FrontEnd directory):**
```bash
npm start
```

**Run frontend only:**
```bash
cd FrontEnd
npm run dev
```

**Run backend only:**
```bash
cd BackEnd
npm start
# or with nodemon for auto-reload
npx nodemon server.js
```

### Production Build

**Build frontend:**
```bash
cd FrontEnd
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## Available Scripts

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm start` | Run frontend and backend concurrently |

### Backend

| Script | Description |
|--------|-------------|
| `npm start` | Start the Express server |

## Features

- **User Authentication** - Email/password and Google OAuth
- **Protected Routes** - JWT-based route protection
- **Drag and Drop** - Sortable lists and items
- **PDF Export** - Generate and download PDF documents
- **Barcode Generation** - Create barcodes for items
- **Data Visualization** - Interactive charts and graphs
- **Email Notifications** - Automated email sending
- **File Uploads** - Image and document uploads
- **Form Validation** - Client and server-side validation
- **Responsive Design** - Mobile-first UI components

## API Endpoints

The backend exposes RESTful API endpoints. Common patterns:

```
GET    /api/[resource]       - List all
GET    /api/[resource]/:id   - Get one
POST   /api/[resource]       - Create
PUT    /api/[resource]/:id   - Update
DELETE /api/[resource]/:id   - Delete
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
