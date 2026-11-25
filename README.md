# Smart City 360 - Municipal Governance & Citizen Services Platform

A modern, production-ready, centralized Smart City web application connecting citizens, city officials, and municipal administrators with real-time civic issue reporting, complaint tracking, interactive GIS mapping, emergency alerts, public services directory, and administrative analytics.

---

## 🏙️ Key Features & Modules

### 1. Citizen Experience
- **Public Landing Page**: Live smart-city telemetry counters, emergency alerts marquee, "How it Works" guide, featured announcements, and public service highlights.
- **Citizen Dashboard**: Greeting, complaint statistics cards (Submitted, In Progress, Resolved), active emergency warnings, announcements, and quick issue submission.
- **Multi-Step Civic Issue Reporting**:
  - **Step 1**: Title, Category (11 categories: *Roads & Potholes, Streetlights, Garbage & Waste, Water Supply, Drainage, Traffic Signals, Public Transport, Parks & Public Spaces, Electricity, Pollution, Other*), Priority level (*Low, Medium, High, Critical*).
  - **Step 2**: Description, Address, Interactive Leaflet map pin selector with reverse-geocoded coordinates and GPS geolocation.
  - **Step 3**: Photo upload (file type/size validation, live image preview) and optional additional notes for field dispatch.
  - **Step 4**: Review & submit with instant generation of unique Ticket ID (`SC-2026-XXXXXX`) and confirmation screen.
- **Complaint Tracking**:
  - Live 6-stage visual timeline (*Submitted* → *Acknowledged* → *Assigned* → *In Progress* → *Resolved* → *Closed*).
  - Image preview with modal lightbox zoom.
  - Public audit logs and comments thread.
  - Citizen resolution rating and feedback submission (1-5 stars with comments).

### 2. City Official Experience
- **Administrative Incident Console**:
  - Filterable incident data table with instant search, category, priority, department, and status filters.
  - Sorting and pagination.
  - Department reassignment dropdown.
  - Status transition controls with internal notes/comments.
  - High-resolution photo inspection.

### 3. Administrator Experience
- **Executive Analytics Dashboard**:
  - **KPI Cards**: Total complaints, Pending, In-progress, Resolved, Average resolution time (26.4 hrs), Active alerts.
  - **Recharts Visualizations**:
    - Complaints by category (Bar chart)
    - Status distribution (Donut chart)
    - Complaint volume over time (6-month Area chart)
    - Complaints by municipal zone/area (Bar chart)
    - Department resolution SLA adherence table
- **City Management Operations**:
  - Emergency Alert management (create, publish, resolve alerts with severity: *Informational, Warning, Critical*).
  - City Announcement management (publish road maintenance, water cuts, metro updates).
  - Public Service Directory location management.

### 4. Interactive Smart City GIS Map
- Full-screen interactive Leaflet map (Bengaluru Smart City model).
- Custom markers for civic complaints (color-coded by status/priority) and city public services (*Hospitals, Police stations, Fire stations, Bus stops, Parking areas, Public toilets, Parks, EV charging stations, Government offices*).
- Dynamic layer filters to show/hide specific facilities and live search.

---

## 🚀 1-Click Demo Personas (Instant Grading)

The login page features convenient **1-Click Demo Buttons** for instant evaluation without typing:

| Role | Name | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Aarav Sharma | `citizen@smartcity.gov.in` | `password123` | Report & track complaints, feedback |
| **City Official** | Priya Nambiar | `official@smartcity.gov.in` | `password123` | Department dispatch, status updates |
| **Administrator** | Dr. Ramesh Kumar | `admin@smartcity.gov.in` | `password123` | System analytics, alerts, announcements |

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Custom Smart City palette: Primary Navy/Teal, Emerald, Amber, Rose)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: Leaflet + React-Leaflet + OpenStreetMap
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (with standard DDL schema, relationships, foreign keys, timestamps, and zero-config embedded fallback via `pg-mem` for out-of-the-box execution)
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC) + bcrypt password hashing
- **File Uploads**: Multer diskStorage with static asset serving and 5MB size limit
- **Security**: Helmet HTTP headers, CORS, express-rate-limit

---

## 📁 Project Structure

```
smart-city/
├── backend/
│   ├── src/
│   │   ├── config/              # Environment configuration
│   │   ├── db/                  # Database pool, migrations, schema.sql, seeders
│   │   ├── middleware/          # JWT auth, RBAC, multer file upload
│   │   ├── routes/              # Auth, Complaints, Alerts, Announcements, Services, Analytics, Feedback
│   │   ├── types/               # TypeScript interfaces
│   │   └── server.ts            # Express server entry point
│   ├── uploads/                 # Storage for civic complaint photos
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, MobileNav, Footer, LocationPicker, Timeline, Badges
│   │   ├── contexts/            # AuthContext, ToastContext
│   │   ├── pages/               # Landing, Dashboards, Report, Detail, Map, Alerts, Services, etc.
│   │   ├── services/            # Axios API client
│   │   ├── utils/               # Leaflet icons, image URL resolver
│   │   ├── App.tsx              # Application router
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── .env
│   └── .env.example
├── docker-compose.yml           # PostgreSQL 16 Alpine container configuration
└── README.md
```

---

## ⚡ Quick Start Guide

### Option A: Zero-Config Startup (Embedded PostgreSQL)
The application comes pre-configured with a dual-driver database layer that boots immediately without any external database installation:

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```
   *The backend starts at `http://localhost:5000` and automatically initializes and seeds all demo data.*

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend starts at `http://localhost:5173`.*

3. Open **`http://localhost:5173`** in your browser.

---

### Option B: With Dedicated PostgreSQL (Docker)
If you wish to run a dedicated PostgreSQL container:
```bash
# In the root folder:
docker compose up -d

# Start backend (it will automatically connect to postgres on port 5432):
cd backend
npm start
```

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Register a new citizen account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/me` - Get authenticated user profile

### Civic Complaints
- `POST /api/complaints` - Lodge a new complaint with photo upload (multipart/form-data)
- `GET /api/complaints` - Query complaints with filtering, search & pagination
- `GET /api/complaints/:id` - Fetch complaint by UUID or Ticket ID (`SC-2026-XXXXXX`)
- `PUT /api/complaints/:id/status` - Transition lifecycle status & record audit log (Official/Admin)
- `POST /api/complaints/:id/comments` - Post public comment or internal staff note
- `DELETE /api/complaints/:id` - Delete complaint (Admin only)

### Emergency Alerts
- `GET /api/alerts` - List active public emergency advisories
- `POST /api/alerts` - Broadcast an alert (*Critical, Warning, Informational*)
- `PUT /api/alerts/:id` - Update advisory or mark resolved
- `DELETE /api/alerts/:id` - Delete advisory

### City Announcements
- `GET /api/announcements` - List municipal updates and notices
- `POST /api/announcements` - Publish announcement with category & optional image
- `PUT /api/announcements/:id` - Edit announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Public Services Directory
- `GET /api/services` - Search public facilities by category or name
- `POST /api/services` - Register a public amenity (Admin)

### Analytics
- `GET /api/analytics/dashboard` - Real-time municipal KPIs, time series, and category breakdowns

### Citizen Feedback
- `GET /api/feedback` - Retrieve verified ratings & reviews
- `POST /api/feedback` - Submit resolution rating (1-5 stars) and comments