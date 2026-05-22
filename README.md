# Medical Project (React + Django)

A healthcare appointment booking system built with a React frontend and a Django REST Framework backend. The project supports role-based users (Admin, Doctor, Patient), JWT authentication, doctor availability scheduling, appointment booking with conflict checks, and email notifications.

**Table of contents**

- **Overview**: Project summary and goals
- **Features**: Functional requirements
- **Tech Stack**: Frontend and backend technologies
- **Architecture**: High-level design
- **Getting Started**: Install and run frontend and backend
- **Configuration**: Environment variables and settings
- **API**: Main endpoints and behaviors
- **Development**: Notes for contributing and testing
- **License**

**Overview**

This application provides a platform for patients to find doctors, view availability, and book appointments. Doctors can manage availability and appointments. Admins manage system data and users.

**Features**

- **User Roles & Authentication**: Registration and login for Patients and Doctors; Admin with full access. Role-based access control and JWT authentication (DRF + djangorestframework-simplejwt).
- **Admin Capabilities**: View all users, approve/block doctors or patients, CRUD specialties/doctors/system settings, view all appointments.
- **Doctor Capabilities**: Set availability schedules, view upcoming/past appointments, update profile (specialty, bio, contact), approve/reject appointments and add notes.
- **Patient Capabilities**: Browse/filter doctors (specialty, name), view doctor availability, book/cancel/reschedule appointments, edit profile.
- **Appointments Management**: Real-time availability validation, avoid double-booking, appointment statuses: pending, confirmed, completed, cancelled.
- **Notifications**: Email confirmations for bookings (configurable via backend email settings).

**Tech Stack**

- Frontend: React, React Router, state management (Context API or Redux Toolkit), Material UI (or another UI library; avoid Bootstrap), Vite.
- Backend: Django, Django REST Framework, djangorestframework-simplejwt for JWT, PostgreSQL (recommended), Django's admin for admin dashboard.
- Dev tools: pnpm (frontend), pip / virtualenv (backend), Dockerfile included for containerization.

**Architecture**

- Frontend (`app/`): A React app that handles routing, forms, authentication, and integrates with the Django API.
- Backend (separate Django project): Exposes REST endpoints for authentication, users, doctors, patients, specialties, and appointments. Uses `AbstractUser` to extend user model with roles.

**Getting Started**

Prerequisites:

- Node.js (16+), pnpm or npm
- Python 3.9+
- PostgreSQL (or another supported DB)
- Optional: Docker

Frontend (in repo root / `app/`):

1. Install dependencies

```bash
pnpm install
```

2. Start dev server

```bash
pnpm run dev
```

Backend (Django — separate folder/repo or inside backend/):

1. Create and activate virtualenv

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

2. Install Python dependencies

```bash
pip install -r requirements.txt
```

3. Apply migrations and create superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

4. Run development server

```bash
python manage.py runserver
```

Note: If using Docker, build and run the provided `Dockerfile` or use docker-compose if included.

**Environment / Configuration**

Common environment variables (backend):

- `DJANGO_SECRET_KEY` — Django secret key
- `DATABASE_URL` — Database connection string (recommended)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` — Email settings for notifications
- `SIMPLE_JWT` settings — Token lifetimes (access/refresh)
- `CORS_ALLOWED_ORIGINS` or `CORS_ALLOWED_ORIGIN_REGEXES` — Allow the frontend origin
- `FRONTEND_URL` — Frontend host used in emails/links

Authentication note: JWT can be stored in `httpOnly` cookies (recommended) or localStorage. When using localStorage, implement secure handling and token refresh flows.

**API (examples)**

Authentication:

- `POST /api/auth/register/` — Register a user (role: patient/doctor)
- `POST /api/auth/token/` — Obtain access and refresh tokens (simplejwt)
- `POST /api/auth/token/refresh/` — Refresh access token

Users & Profiles:

- `GET /api/users/` — List users (admin)
- `GET /api/users/{id}/` — User detail
- `PATCH /api/users/{id}/` — Update profile

Doctors & Specialties:

- `GET /api/specialties/` — List specialties
- `GET /api/doctors/` — List doctors (filter by specialty, name)
- `GET /api/doctors/{id}/availability/` — Get doctor availability

Appointments:

- `POST /api/appointments/` — Book an appointment (validates availability)
- `GET /api/appointments/` — List appointments (patient/doctor/admin filtered)
- `PATCH /api/appointments/{id}/` — Update status (approve/reject/cancel)

Backend should enforce permissions and validate availability to avoid double-booking.

**Development Notes**

- Use DRF `ViewSets` and `ModelViewSet` for standard CRUD endpoints.
- Implement custom permissions classes for role-based access.
- Store doctor availability in a model that represents recurring schedules or explicit timeslots; validate bookings against these slots.
- Use database transactions or select_for_update where necessary to avoid race conditions during booking.

**Testing**

- Backend: use `pytest` or Django `manage.py test` to run unit and integration tests for models and API endpoints.
- Frontend: add unit tests for critical components and integration tests for flows (login, booking).

**Deployment**

- Configure production settings: secure `SECRET_KEY`, `ALLOWED_HOSTS`, production DB, email provider, HTTPS.
- Use Docker for containerized deployment, and configure reverse proxy (Nginx) for static files and HTTPS termination.

**Contributing**

- Fork the repo, create a feature branch, open a PR with clear description and tests for new behavior.

**License**

Specify a license for the project (e.g., MIT) or remove this section if proprietary.

# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Project setup (frontend)

Quick steps to get the frontend running locally after cloning:

1. Install dependencies

```bash
pnpm install
```

2. Copy example env and edit

```bash
copy .env.example .env
```

3. Start dev server (Vite)

```bash
pnpm run vite:dev
```

4. Lint and format

```bash
pnpm run lint
pnpm run format
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
