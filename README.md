# Society Maintenance Tracker

A full-stack web application for managing apartment society maintenance complaints. Residents can raise and track complaints with photos, and admins can manage them through a structured workflow with priorities, notices, and email notifications.

---

## 🚀 Live Demo

| | URL |
|---|---|
| 🌐 **Frontend** | https://unthinkable-1dp9.onrender.com |
| ⚙️ **Backend API** | https://unthinkable-mohit.onrender.com |

**Default Admin Login:**
- Email: `admin@society.com`
- Password: `admin123`

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Recharts |
| Backend     | Node.js, Express.js                 |
| Database    | PostgreSQL                          |
| Auth        | JWT (Role-based: resident / admin)  |
| Email       | Nodemailer (Gmail SMTP)             |
| File Upload | Multer (local storage)              |

---

## ✨ Features

### Resident
- Register & login
- Raise complaints with category, description & optional photo
- View own complaints with full status history
- Receive email notifications on status changes & important notices
- View notice board

### Admin
- View all complaints with filters (category, status, date)
- Set priority: Low / Medium / High
- Update status: Open → In Progress → Resolved (each change logged)
- Auto-detect and flag overdue complaints
- Post notices (pinned if marked important)
- Dashboard with stats, charts by status & category

---

## 📁 Project Structure

```
unthinkable/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js        # PostgreSQL pool
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, upload, error
│   │   ├── models/             # DB query functions
│   │   ├── routes/             # Express routers
│   │   └── services/           # Email, overdue logic
│   ├── uploads/                # Uploaded photos (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── api/                # Axios wrappers
│   │   ├── components/         # UI components
│   │   ├── context/            # Auth context
│   │   └── pages/              # Page components
│   └── package.json
├── database/
│   └── schema.sql              # Full DB schema + seed
├── README.md
└── SYSTEM_DESIGN.md
```

---

## ⚙️ Setup Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gmail account with App Password (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/mohitnimje1027-collab/unthinkable.git
cd unthinkable
```

### 2. Set up the Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE society_tracker;"

# Run schema
psql -U postgres -d society_tracker -f database/schema.sql
```

This creates all tables and seeds a default admin user:
- **Email:** `admin@society.com`
- **Password:** `admin123`

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and email settings
npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🔑 Environment Variables (`.env.example`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/society_tracker

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Society Maintenance Tracker <your_email@gmail.com>

# App
FRONTEND_URL=http://localhost:5173
OVERDUE_DAYS=7
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

---

## 📚 API Documentation

### Auth

| Method | Endpoint              | Auth     | Description        |
|--------|-----------------------|----------|--------------------|
| POST   | `/api/auth/register`  | None     | Register resident  |
| POST   | `/api/auth/login`     | None     | Login              |
| GET    | `/api/auth/me`        | JWT      | Get current user   |

**Register Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "flat_no": "A-101" }
```

**Login Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Response:**
```json
{ "user": { "id": 1, "name": "John Doe", "email": "...", "role": "resident", "flat_no": "A-101" }, "token": "eyJ..." }
```

---

### Complaints

| Method | Endpoint                             | Auth         | Description              |
|--------|--------------------------------------|--------------|--------------------------|
| POST   | `/api/complaints`                    | Resident     | Submit complaint + photo |
| GET    | `/api/complaints/my`                 | Resident     | Get own complaints       |
| GET    | `/api/complaints`                    | Admin        | Get all (with filters)   |
| GET    | `/api/complaints/:id`                | JWT          | Get complaint + history  |
| PATCH  | `/api/complaints/:id`                | Admin        | Update status/priority   |
| PATCH  | `/api/complaints/:id/overdue`        | Admin        | Flag as overdue          |
| POST   | `/api/complaints/detect-overdue`     | Admin        | Auto-detect overdue      |

**POST /api/complaints** (multipart/form-data):
- `category`: Plumbing | Electrical | Cleaning | Security | Other
- `description`: string
- `photo`: image file (optional, max 5MB)

**GET /api/complaints** query params:
- `category`, `status`, `date_from`, `date_to`

**PATCH /api/complaints/:id** body:
```json
{ "status": "In Progress", "priority": "High", "note": "Assigned to plumber" }
```

---

### Notices

| Method | Endpoint           | Auth     | Description        |
|--------|--------------------|----------|--------------------|
| GET    | `/api/notices`     | JWT      | Get all notices    |
| POST   | `/api/notices`     | Admin    | Create notice      |
| DELETE | `/api/notices/:id` | Admin    | Delete notice      |

**POST /api/notices** body:
```json
{ "title": "Water Supply Shutdown", "content": "Water supply off on Sunday 6–9 AM.", "is_important": true }
```

---

### Dashboard

| Method | Endpoint          | Auth   | Description         |
|--------|-------------------|--------|---------------------|
| GET    | `/api/dashboard`  | Admin  | Stats & recent data |

**Response:**
```json
{
  "byStatus": [{ "status": "Open", "count": "5" }],
  "byCategory": [{ "category": "Plumbing", "count": "3" }],
  "overdueCount": 2,
  "recentComplaints": [...]
}
```

---

## 🗃 Database Schema

### `users`
| Column        | Type         | Notes                      |
|---------------|--------------|----------------------------|
| id            | SERIAL PK    |                            |
| name          | VARCHAR(100) | NOT NULL                   |
| email         | VARCHAR(255) | UNIQUE, NOT NULL           |
| password_hash | TEXT         | bcrypt                     |
| role          | VARCHAR(20)  | 'resident' or 'admin'      |
| flat_no       | VARCHAR(20)  | Optional for residents     |
| created_at    | TIMESTAMPTZ  | Default NOW()              |

### `complaints`
| Column     | Type        | Notes                                        |
|------------|-------------|----------------------------------------------|
| id         | SERIAL PK   |                                              |
| user_id    | FK → users  | ON DELETE CASCADE                            |
| category   | VARCHAR(50) | Plumbing/Electrical/Cleaning/Security/Other  |
| description| TEXT        | NOT NULL                                     |
| photo_url  | TEXT        | Path to uploaded photo                       |
| status     | VARCHAR(20) | Open / In Progress / Resolved                |
| priority   | VARCHAR(10) | Low / Medium / High                          |
| is_overdue | BOOLEAN     | Default FALSE                                |
| created_at | TIMESTAMPTZ | Default NOW()                                |
| updated_at | TIMESTAMPTZ | Updated on each change                       |

### `complaint_history`
| Column       | Type        | Notes                    |
|--------------|-------------|--------------------------|
| id           | SERIAL PK   |                          |
| complaint_id | FK → complaints | ON DELETE CASCADE    |
| status       | VARCHAR(20) | Status at this point     |
| note         | TEXT        | Admin note (optional)    |
| changed_by   | FK → users  | Actor                    |
| changed_at   | TIMESTAMPTZ | Default NOW()            |

### `notices`
| Column      | Type         | Notes                    |
|-------------|--------------|--------------------------|
| id          | SERIAL PK    |                          |
| title       | VARCHAR(200) | NOT NULL                 |
| content     | TEXT         | NOT NULL                 |
| is_important| BOOLEAN      | Pinned to top            |
| created_by  | FK → users   | ON DELETE SET NULL       |
| created_at  | TIMESTAMPTZ  | Default NOW()            |

---

## 🚢 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Create new **Web Service** on Render, connect repo
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env.example`
7. Set up a **Render PostgreSQL** database and copy the connection string

### Deploy Frontend to Vercel

1. Import repo in Vercel, set root to `frontend`
2. Set env variable: `VITE_API_URL=https://your-backend.onrender.com`
3. Update `vite.config.js` proxy target or use `VITE_API_URL` in axios config

---

## 📝 License

MIT
