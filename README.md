# ⚡ OpportunityHub — Internship & Job Aggregator

A full-stack internship and job aggregator built with **Spring Boot**, **MongoDB**, and **vanilla HTML/CSS/JS**.  
Designed as a college project — clean, modern UI with full CRUD, authentication, save/bookmark, and admin approval flow.

---

## 📁 Folder Structure

```
OpportunityHub/
├── backend/                          ← Spring Boot project
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/opportunityhub/
│       │   ├── OpportunityHubApplication.java   ← Entry point
│       │   ├── config/
│       │   │   └── CorsConfig.java              ← CORS setup
│       │   ├── controller/
│       │   │   ├── OpportunityController.java   ← REST: /opportunities
│       │   │   └── UserController.java          ← REST: /login /register /save
│       │   ├── model/
│       │   │   ├── Opportunity.java             ← MongoDB document
│       │   │   └── User.java                    ← MongoDB document
│       │   ├── repository/
│       │   │   ├── OpportunityRepository.java   ← Spring Data MongoDB
│       │   │   └── UserRepository.java
│       │   └── service/
│       │       ├── OpportunityService.java      ← Business logic
│       │       └── UserService.java
│       └── resources/
│           └── application.properties          ← DB config
│
└── frontend/                         ← Static HTML/CSS/JS
    ├── index.html                    ← Home: browse opportunities
    ├── add.html                      ← Add opportunity form
    ├── saved.html                    ← Saved/bookmarked opportunities
    ├── admin.html                    ← Admin dashboard
    ├── login.html                    ← Login & Register
    ├── css/
    │   └── style.css                 ← Main stylesheet (dark, modern)
    └── js/
        ├── utils.js                  ← Shared utilities (API, toast, auth)
        ├── index.js                  ← Home page logic
        ├── add.js                    ← Add page logic
        ├── saved.js                  ← Saved page logic
        ├── admin.js                  ← Admin page logic
        └── login.js                  ← Auth page logic
```

---

## 🚀 How to Run the Backend

### Prerequisites
- Java 17+
- Maven 3.6+
- MongoDB running locally on port `27017`

### Step 1 — Start MongoDB
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows (run MongoDB as a service or use MongoDB Compass)
net start MongoDB
```

### Step 2 — Navigate to the backend folder
```bash
cd OpportunityHub/backend
```

### Step 3 — Build and run
```bash
# Using Maven wrapper (recommended)
./mvnw spring-boot:run

# Or using installed Maven
mvn spring-boot:run
```

The backend will start at: **http://localhost:8080**

You should see:
```
Started OpportunityHubApplication in X.XXX seconds
```

---

## 🌐 How to Run the Frontend

The frontend is pure static HTML — **no build step needed**.

### Option 1 — VS Code Live Server (Recommended)
1. Open the `frontend/` folder in VS Code
2. Right-click `index.html` → **"Open with Live Server"**
3. Browser opens at `http://127.0.0.1:5500/index.html`

### Option 2 — Python HTTP Server
```bash
cd OpportunityHub/frontend
python3 -m http.server 5500
# Open http://localhost:5500 in your browser
```

### Option 3 — Node.js `serve`
```bash
npm install -g serve
cd OpportunityHub/frontend
serve -p 5500
```

### Option 4 — Just open the file
Double-click `frontend/index.html` to open directly in your browser.  
⚠️ Note: Some browsers restrict `fetch()` from `file://` URLs. Use a local server for best results.

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/opportunities` | Get all **approved** opportunities |
| `GET`  | `/opportunities/all` | Get **all** opportunities (admin) |
| `GET`  | `/opportunities/pending` | Get **pending** opportunities |
| `POST` | `/opportunities` | Submit a new opportunity |
| `PUT`  | `/opportunities/{id}/status` | Approve or reject (admin) |
| `DELETE` | `/opportunities/{id}` | Delete an opportunity (admin) |
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login (returns user info + role) |
| `GET`  | `/saved?username=X` | Get saved opportunities for user |
| `POST` | `/save` | Save/bookmark an opportunity |
| `DELETE` | `/save` | Remove a saved opportunity |

---

## 👤 Demo Users

1. **Register** any user via the Register page
2. **Admin user**: Register with username `admin` — the app automatically assigns `ADMIN` role
3. Login as `admin` to access the Admin Dashboard

---

## 🎨 UI Features

- **Dark theme** with blue/purple accent colors
- **Card-based layout** with hover effects and smooth transitions
- **Responsive** — works on mobile and desktop
- **Toast notifications** for all actions
- **Loading skeletons** while data is fetching
- **Filter & search** for opportunities
- **Tabs** in admin dashboard (All / Pending / Approved / Rejected)
- **Stats cards** showing counts in admin panel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17 |
| Database | MongoDB |
| ORM | Spring Data MongoDB |
| Frontend | HTML5, CSS3, Vanilla JS |
| Fonts | Plus Jakarta Sans (Google Fonts) |
| HTTP Client | Fetch API (browser-native) |

---

## 📝 Notes

- Passwords are stored in **plain text** for simplicity (this is a college demo project). In production, always hash passwords with BCrypt.
- CORS is set to allow all origins (`*`) for local development.
- User sessions are stored in `localStorage` (no JWT/server-side sessions).
- MongoDB database name: `opportunityhub` (auto-created on first run).

---

## 🐛 Troubleshooting

**"Cannot connect to server"** — Make sure MongoDB is running and the Spring Boot app started on port 8080.

**CORS errors** — Make sure you're accessing the frontend via a local server (not `file://`).

**Port conflicts** — Change the port in `application.properties`: `server.port=9090`

**MongoDB connection failed** — Check your MongoDB URI in `application.properties`.
