# Campus Wastage Monitoring System (CWMS)
### Akshaya College of Engineering and Technology (ACET), Kinathukadavu, Coimbatore

An automated, intelligent end-to-end Smart Campus Wastage Monitoring and Resolution Platform designed to ensure zero waste pileup, rapid incident dispatch, and full accountability across college premises.

---

## 🌟 Key Features

- **Role-Based Access Control**: Tailored portals for **Students/Staff**, **Cleaning Crew**, and **Chief Campus Administrators**.
- **Visual Evidence & Incident Reporting**: Students submit location-tagged waste tickets with photo evidence and urgency levels.
- **Interactive Campus GIS Map**: Real-time geospatial mapping of campus hotspots, buildings, and waste statuses.
- **Cleaning Crew Dispatch & Task Lifecycle**:
  - `REPORTED` &rarr; `ASSIGNED` &rarr; `ACKNOWLEDGED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`
  - Photographic "After-Cleanup" resolution proof and waste weight (kg) tracking.
- **Resilient Dual-Engine Database Architecture**:
  - Automatically connects to MySQL if available.
  - Seamlessly falls back to an in-memory Zero-Crash Embedded Database engine pre-seeded with 55 campus locations, 5 waste categories, and test user profiles.
- **Admin Analytics & Insights**: Category distributions, location hotspot heatmaps, resolution metrics, and automated audit trails.

---

## 🏗️ Architecture & Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Axios, Leaflet / React-Leaflet, Lucide Icons, Custom CSS Design System |
| **Backend** | Node.js, Express 4, JWT Authentication, Multer (multipart photo uploads), CORS, Morgan |
| **Database** | MySQL 8 / Resilient In-Memory Dual Engine with SQL Schema & Seed scripts |
| **Security** | BCrypt password hashing, JWT Bearer tokens, Role-based middleware, Domain validation (`@acetcbe.edu.in`) |

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- [npm](https://npmjs.com/)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/<YOUR-USERNAME>/campus-wastage-monitoring-system.git
cd campus-wastage-monitoring-system

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Configuration

Copy the sample environment files:

#### Server (`server/.env`):
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=campus_waste_db
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_campus_waste_2026_change_in_production
JWT_EXPIRES_IN=7d
```

#### Client (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Running the Application

In terminal 1 (Backend Server):
```bash
cd server
npm start
# Server starts on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

Open your browser at **`http://localhost:3000`**.

---

## 👥 Demo / Testing Credentials

| Role | Email | Password | Access / Functionality |
| :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@acetcbe.edu.in` | `Admin@123` | Full control: incident dispatch, staff assignment, analytics, live map |
| **Cleaning Crew (North)** | `ramesh.staff@acetcbe.edu.in` | `Staff@123` | Task queue, acknowledge work, upload resolution photo & waste weight |
| **Cleaning Crew (Central)** | `sunita.staff@acetcbe.edu.in` | `Staff@123` | Central campus zone tasks & resolution logs |
| **Student (CSE)** | `priya.student@acetcbe.edu.in` | `Student@123` | Report waste, upload evidence, track personal ticket status |

---

## 🧪 Automated End-to-End Test Simulation

Run the complete 4-workflow test suite (Registration &rarr; Reporting &rarr; Admin Dispatch &rarr; Staff Photographic Resolution &rarr; Analytics Verification):

```bash
cd server
npm run test:e2e
```

---

## 🌐 Production Deployment Guide

### Option 1: Full-Stack Single-Server (Render / Railway / VPS)
1. Build the frontend client:
   ```bash
   cd client
   npm run build
   ```
2. The compiled assets will be in `client/dist`. The Express backend (`server/server.js`) automatically serves `client/dist` statically when present.
3. Start the Node server with `npm start` in `server/`.

### Option 2: Split Deployment (Vercel Frontend + Render/Railway Backend)
- **Backend**: Deploy `server/` to Render/Railway. Set environment variables `PORT`, `JWT_SECRET`, `CLIENT_URL=https://your-frontend.vercel.app`.
- **Frontend**: Deploy `client/` to Vercel/Netlify. Set environment variable `VITE_API_URL=https://your-backend-api.onrender.com`.

---

## 📄 License
Academic and campus operational use for **Akshaya College of Engineering and Technology (ACET)**.
