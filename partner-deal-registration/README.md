# Partner Deal Registration System

A comprehensive partner portal for deal registration and management.

## Project Structure

- `frontend/` - React.js frontend application
- `backend/` - Node.js backend API with Google Sheets integration

## Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features

- Google OAuth authentication
- Deal registration with validation
- Google Sheets database integration
- Real-time form validation
- Partner dashboard
- Duplicate detection

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Google Sheets API
- **Authentication**: Google OAuth 2.0, JWT
- **Database**: Google Sheets
