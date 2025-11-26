# Appointment Booking System

A full-stack appointment booking system built with Next.js, NestJS, PostgreSQL, and Google Calendar API integration.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI, Axios
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **External API**: Google Calendar API

## Features

- Public appointment booking form
- Admin authentication (JWT)
- Admin dashboard to view all appointments
- Admin user management
- Google Calendar integration (creates calendar events with email invitations)

## Project Structure

```
appointment-booking/
├── client/          # Next.js frontend
├── server/          # NestJS backend
├── docker-compose.yml
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally without Docker)
- Google Cloud Project with Calendar API enabled

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   - Database credentials
   - JWT secret
   - Google Calendar API credentials (Service Account)

### Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create a Service Account
5. Download the JSON key file
6. Extract the following from the JSON:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `project_id` → `GOOGLE_PROJECT_ID`
7. Share your calendar with the service account email

### Running with Docker

1. Build and start all services:
   ```bash
   docker-compose up -d
   ```

2. Run database migrations:
   ```bash
   docker-compose exec server npm run prisma:migrate
   ```

3. Access the application:
   - Frontend: http://localhost:3003
   - Backend API: http://localhost:3001

### Running Locally (Development)

#### Backend

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start the server:
   ```bash
   npm run start:dev
   ```

#### Frontend

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Public Endpoints

- `POST /appointments` - Create a new appointment

### Protected Endpoints (Require JWT)

- `GET /appointments` - Get all appointments
- `POST /auth/login` - Admin login
- `GET /users` - Get all users
- `POST /users` - Create a new admin user

## Frontend Routes

### Public Routes

- `/` - Home page with appointment booking form

### Admin Routes (Protected - Require Authentication)

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard to view all appointments
- `/admin/users` - User management page to create and manage admin users

## Database Schema

### User
- `id` (UUID)
- `email` (String, unique)
- `password` (String, hashed)
- `isAdmin` (Boolean)
- `createdAt` (DateTime)

### Appointment
- `id` (UUID)
- `name` (String)
- `email` (String)
- `appointmentDateTime` (DateTime)
- `notes` (String, optional)
- `googleEventId` (String, optional)
- `createdAt` (DateTime)

## Development

### Backend Commands

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Deployment

The application is designed to be deployed on a VPS. Update the environment variables in your production environment and use Docker Compose for deployment.

