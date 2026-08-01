# MediConnect — Doctor Appointment Booking System

MediConnect is a full-stack MERN application that connects patients with doctors. Doctors manage a public profile and respond to appointment requests; patients search for doctors and book, track, and manage their appointments — all from responsive dashboards.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Option A: Run with Docker Compose (recommended)](#option-a-run-with-docker-compose-recommended)
  - [Option B: Run locally without Docker](#option-b-run-locally-without-docker)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

**Landing Page**
- Responsive navbar, hero, about section, and search bar
- Featured doctor cards pulled live from the database
- Separate Doctor Login and Patient Login entry points

**Doctor Module**
- Sign up, log in, log out (JWT-based auth)
- Dashboard to view and edit profile: specialization, qualification, experience, clinic address, consultation fee, available days/time, about, and profile picture (via Multer upload)
- Appointment Requests tab to confirm, decline, or mark appointments as completed

**Patient Module**
- Sign up (with confirm password), log in, log out
- Search doctors by name or specialization
- View a doctor's full public profile and book an appointment (date, time, optional notes)
- My Bookings tab showing appointment status (pending, confirmed, completed, cancelled)
- Edit profile (name, phone)

**Cross-cutting**
- JWT authentication with role-based route protection (doctor vs. patient)
- Passwords hashed with bcrypt, never returned by the API
- Toast notifications, loading spinners, and empty/error states throughout
- Dockerized: React (nginx) + Node/Express + MongoDB, orchestrated with Docker Compose

---

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React 18 (Vite), React Router, Axios, Tailwind CSS, react-toastify |
| Backend        | Node.js, Express.js                 |
| Database       | MongoDB with Mongoose               |
| Authentication | JSON Web Tokens (JWT)               |
| Password Hash  | bcrypt (bcryptjs)                   |
| File Upload    | Multer (doctor profile images)      |
| Containerization | Docker, Docker Compose            |

---

## Folder Structure

```
mediconnect/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, DoctorCard, Loader, ProtectedRoute, PulseDivider
│   │   ├── pages/                # Landing, Doctor/Patient auth & dashboards, DoctorProfileView, NotFound
│   │   ├── services/             # api.js (axios instance) + auth/doctor/patient/appointment services
│   │   ├── hooks/                # useAuth
│   │   ├── context/              # AuthContext
│   │   ├── App.jsx, main.jsx, index.css
│   ├── Dockerfile                # multi-stage build served by nginx
│   ├── nginx.conf
│   └── package.json
│
├── server/                      # Express backend
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # Doctor, Patient, Appointment (Mongoose schemas)
│   ├── controllers/              # doctorController, patientController, appointmentController
│   ├── routes/                   # doctorRoutes, patientRoutes, appointmentRoutes
│   ├── middleware/                # authMiddleware (JWT + roles), uploadMiddleware (Multer), errorMiddleware
│   ├── utils/generateToken.js
│   ├── uploads/                  # doctor profile images (persisted via Docker volume)
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Option A: Run with Docker Compose (recommended)

**Prerequisites:** Docker and Docker Compose installed.

1. From the project root, optionally create a `.env` file to override defaults used by `docker-compose.yml`:

   ```bash
   JWT_SECRET=replace_with_a_long_random_secret
   VITE_API_URL=http://localhost:5000/api
   ```

2. Build and start everything:

   ```bash
   docker compose up --build
   ```

3. Open the app:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)
   - MongoDB: exposed on `localhost:27017` if you want to inspect it with a GUI client

4. To stop everything:

   ```bash
   docker compose down
   ```

   Add `-v` to also remove the MongoDB and uploads volumes (this deletes all data).

> **Note on file uploads in Docker:** doctor profile images are stored in a named volume (`uploads_data`) mounted at `/app/uploads` in the server container, so they persist across restarts.

### Option B: Run locally without Docker

**Prerequisites:** Node.js 18+, npm, and a running MongoDB instance (local or Atlas).

**1. Backend**

```bash
cd server
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev             # starts on http://localhost:5000
```

**2. Frontend**

```bash
cd client
cp .env.example .env   # VITE_API_URL should point at your backend
npm install
npm run dev             # starts on http://localhost:5173
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### `server/.env`

| Variable         | Description                                   | Example                                  |
|------------------|------------------------------------------------|-------------------------------------------|
| `NODE_ENV`       | Environment mode                              | `development`                             |
| `PORT`           | Port the API listens on                       | `5000`                                    |
| `MONGO_URI`      | MongoDB connection string                     | `mongodb://localhost:27017/mediconnect`   |
| `JWT_SECRET`     | Secret used to sign JWTs                      | a long random string                      |
| `JWT_EXPIRES_IN` | Token lifetime                                | `7d`                                      |
| `CLIENT_URL`     | Frontend origin (for reference/CORS tuning)   | `http://localhost:5173`                   |

### `client/.env`

| Variable        | Description                     | Example                          |
|-----------------|----------------------------------|-----------------------------------|
| `VITE_API_URL`  | Base URL of the backend API      | `http://localhost:5000/api`      |

---

## API Documentation

Base URL: `/api`

### Authentication

| Method | Endpoint                | Access | Description                        |
|--------|--------------------------|--------|-------------------------------------|
| POST   | `/doctors/signup`        | Public | Register a new doctor              |
| POST   | `/doctors/login`         | Public | Log in as a doctor                 |
| POST   | `/patients/signup`       | Public | Register a new patient             |
| POST   | `/patients/login`        | Public | Log in as a patient                |

All successful auth responses return `{ token, user }`. Send the token as `Authorization: Bearer <token>` on subsequent requests.

### Doctors

| Method | Endpoint                | Access         | Description                                  |
|--------|--------------------------|----------------|------------------------------------------------|
| GET    | `/doctors`               | Public         | List all doctors; supports `?search=` and `?specialization=` |
| GET    | `/doctors/:id`           | Public         | Get a single doctor's public profile         |
| GET    | `/doctors/profile/me`    | Private (doctor) | Get the logged-in doctor's own profile      |
| PUT    | `/doctors/profile`       | Private (doctor) | Update profile (multipart/form-data; accepts `profileImage` file) |

### Patients

| Method | Endpoint                | Access          | Description                        |
|--------|--------------------------|-----------------|--------------------------------------|
| GET    | `/patients/profile`      | Private (patient) | Get the logged-in patient's profile |
| PUT    | `/patients/profile`      | Private (patient) | Update name/phone                  |

### Appointments

| Method | Endpoint                     | Access           | Description                              |
|--------|-------------------------------|------------------|--------------------------------------------|
| POST   | `/appointments`               | Private (patient) | Book an appointment with a doctor         |
| GET    | `/appointments/patient`       | Private (patient) | List the logged-in patient's appointments |
| GET    | `/appointments/doctor`        | Private (doctor)  | List the logged-in doctor's appointments  |
| PUT    | `/appointments/:id/status`    | Private (doctor)  | Update status: `pending`, `confirmed`, `cancelled`, `completed` |

---

## Future Improvements

- Email/SMS reminders for upcoming appointments
- Doctor availability calendar with slot-level conflict prevention
- In-app messaging between doctor and patient
- Ratings and reviews for doctors
- Admin role for platform moderation and doctor verification
- Payment integration for consultation fees
- Automated tests (Jest/Supertest for the API, React Testing Library for the client) and CI

---

## License

This project is provided as-is for educational and portfolio purposes.
# mediconnect_eks
