markdown

# University of Benin EdTech Platform

Welcome to the University of Benin EdTech Platform, an innovative web application designed to streamline course management, material distribution, and exam preparation for University of Benin students. This platform allows admins to upload course materials (PDFs) and exam questions (via Excel or manual input), while students can access courses and take exams seamlessly.

- **Repository**: [https://github.com/DaHormes-Tech/proj](https://github.com/DaHormes-Tech/proj)
- **Status**: In Development (Target Deployment: March 20, 2025)
- **Built With**: React.js, Node.js, Express.js, Supabase, Tailwind CSS
- **License**: MIT License (see LICENSE file for details)

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

The University of Benin EdTech Platform is an open-source EdTech solution aimed at enhancing the educational experience for students and simplifying administrative tasks for faculty. Developed over approximately 195 hours (78 days at 2.5 hours/day), the project addresses course management, material uploads, and exam handling using modern web technologies and Supabase as the backend-as-a-service provider.

### Current Status
- **Achievements**: Course listing and details, PDF material uploads, and exam listing are functional locally.
- **Pending**: Full restoration of Excel exam uploads, display of exam questions, and Vercel deployment.
- **Challenges**: Resolved network timeouts (e.g., `ConnectTimeoutError`) and file upload issues during development.

---

## Features

### Core Features
- **Course Management**: View all courses with titles, summaries, faculty, and levels on `/courses`.
- **Course Materials**: Admins can upload PDFs for courses, accessible via `/courses/:id`.
- **Exam Management**: 
  - Bulk upload exam questions via Excel files.
  - Manual input of exam questions via the admin portal.
  - List exams on course details pages with links to take them (`/courses/:courseId/exam/:examId`).
- **Admin Dashboard**: Secure interface at `/admin/courses` for managing courses, materials, and exams, restricted to `admin@uniben.edu`.

### Future Features
- Student authentication and progress tracking.
- Inline editing of exam questions.
- Mobile app (iOS/Android).

---

## System Architecture

### Directory Structure

C:\Users\DELL\proj
├── backend/
│   ├── server.js              # Entry point for the Express server
│   ├── package.json           # Backend dependencies and scripts
│   ├── .env                   # Environment variables (e.g., Supabase credentials)
│   ├── routes/                # Express route handlers
│   │   ├── courses.js         # Course and exam routes
│   │   └── auth.js            # Authentication routes
│   └── supabaseClient.js      # Supabase client configuration
├── frontend/
│   ├── package.json           # Frontend dependencies and scripts
│   ├── public/                # Static assets
│   │   ├── index.html         # Main HTML file
│   │   └── favicon.ico        # Favicon
│   ├── src/                   # React source code
│   │   ├── index.js           # React app entry point
│   │   ├── App.js             # Main app with routing
│   │   ├── index.css          # Global CSS with Tailwind
│   │   └── pages/             # Page components
│   │       ├── Courses.js     # Course listing
│   │       ├── CourseDetails.js # Course details
│   │       └── Admin.js       # Admin dashboard
├── .gitignore                  # Git ignore file
├── README.md                   # This file
└── vercel.json                 # Vercel deployment configuration

### Technology Stack
- **Frontend**: React.js, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js, Multer, XLSX, `@supabase/supabase-js`
- **Database/Storage**: Supabase (PostgreSQL, Storage)
- **Deployment**: Vercel
- **Version Control**: Git, hosted on GitHub

---

## Installation and Setup

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)
- Git
- Supabase account with project credentials (URL, service_role key)

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/DaHormes-Tech/proj.git
   cd proj

Set Up Backend
Navigate to the backend directory:
bash

cd backend

Install dependencies:
bash

npm install

Create a .env file with your Supabase credentials:

SUPABASE_URL=https://vgdrntzfxwrfmgzvmhtk.supabase.co
SUPABASE_KEY=your_service_role_key
PORT=65269

Start the backend server:
bash

node server.js

The server will run on http://localhost:65269.

Set Up Frontend
Navigate to the frontend directory:
bash

cd ../frontend

Install dependencies:
bash

npm install

Create a .env file with the API URL:

REACT_APP_API_URL=http://localhost:65269

Start the frontend development server:
bash

npm start

The app will run on http://localhost:3000.

Verify Setup
Open http://localhost:3000/courses to see the course listing.

Use http://localhost:3000/admin/courses for admin access (login with admin@uniben.edu and a valid password).

Usage
Student View
Navigate to /courses to browse available courses.

Click a course (e.g., /courses/6) to view details, materials, and exams.

Access exam pages via /courses/:courseId/exam/:examId (currently a placeholder).

Admin View
Go to /admin/courses to manage the platform.

Upload Course Material:
Select a course, choose a PDF, and click "Upload Material".

Upload Exam Questions:
Select a course, enter an exam name, upload an Excel file (with question, options, correctAnswer columns), and click "Upload Exam Questions".

Manual Exam Input:
Select a course, enter an exam name, input questions in JSON format (e.g., { "questions": [{ "question": "What’s DNA?", "options": ["Protein", "Gene", "Sugar", "Fat"], "correctAnswer": "Gene" }] }), and click "Submit Exam".

Troubleshooting
If uploads fail, check the backend console for errors (e.g., No file uploaded).

For network issues, verify Supabase status at https://status.supabase.com.

API Documentation
Base URL
Local: http://localhost:65269/api

Endpoints
GET /courses/list
Description: Retrieve all courses.

Response: 200 OK with [{ id, title, short_summary, full_summary, faculty, level, materials }]

GET /courses/:id
Description: Retrieve a specific course.

Response: 200 OK with { id, title, short_summary, full_summary, faculty, level, materials }

POST /courses/upload-file
Description: Upload a PDF material for a course.

Body: multipart/form-data with file (PDF), courseId (string), email (string)

Response: 200 OK with { message, url } or 400/500 with error

POST /courses/upload-exam
Description: Upload exam questions via Excel.

Body: multipart/form-data with file (Excel), courseId (string), examName (string), email (string)

Response: 200 OK with { message, examId } or 400/500 with error

POST /courses/admin/exams
Description: Manually input exam questions.

Body: application/json with { name, questions, courseId, email }

Response: 200 OK with { message, examId } or 400/500 with error

POST /auth/login
Description: Admin login.

Body: application/json with { email, password }

Response: 200 OK with { user, session } or 401/503 with error

POST /auth/logout
Description: Admin logout.

Response: 200 OK with { message } or 500 with error

Deployment
Prerequisites
Vercel account

GitHub repository access

Steps
Push to GitHub
Ensure all changes are committed and pushed:
bash

git add .
git commit -m "Prepare for deployment"
git push origin main

Configure Vercel
Install the Vercel CLI:
bash

npm install -g vercel

Link the project:
bash

cd proj
vercel

Set environment variables in Vercel dashboard:
SUPABASE_URL

SUPABASE_KEY

REACT_APP_API_URL (set to the deployed backend URL)

Deploy
Run vercel --prod to deploy to production.

Access the deployed app via the provided URL (e.g., https://proj.vercel.app).

Monitoring
Check Vercel logs for errors.

Monitor Supabase status at https://status.supabase.com.

Contributing
Guidelines
Fork the repository and create a feature branch.

Follow the coding style (e.g., 2-space indentation, ES6+).

Write clear commit messages (e.g., feat: add Excel upload functionality).

Open a pull request with a detailed description.

Issues
Report bugs or suggest features via GitHub Issues.

Include steps to reproduce and expected vs. actual behavior.

Development Workflow
Use npm start for frontend and node server.js for backend during development.

Test changes locally before pushing.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
Maintainer: [Your Name/Email] (replace with actual contact)

Support: Open an issue on GitHub or contact via [email placeholder].

Credits: Built with assistance from Grok 3 (xAI).

