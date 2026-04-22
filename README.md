# Mi Vecindario

A mobile-first civic engagement app that lets neighbors report and validate local issues — potholes, broken streetlights, water leaks, lost pets, security alerts, and community announcements — on a shared real-time map.

> Built on **April 18, 2026** at the **Impact Lab** organized by Claude in Mexico City.

---

## What it does

Residents open the app, tap the mic, and describe a problem in natural language. An AI layer transcribes and classifies the report automatically, then pins it to the neighborhood map. Other neighbors can confirm, comment, or flag the report. Gamification elements (karma points, badges, reputation) reward active and reliable contributors.

**Report categories**

| Emoji | Category | Description |
|-------|----------|-------------|
| 🕳 | Bache | Potholes |
| ⚠ | Seguridad | Security alerts |
| 💡 | Alumbrado | Street lighting |
| 🗑 | Basura | Garbage / cleaning |
| 💧 | Agua | Water leaks |
| 📣 | Anuncio | Community announcements |
| 🐾 | Mascota | Lost pets |

---

## Tech stack

**Frontend**
- React 18 + Vite 5
- Leaflet — interactive map
- Vite PWA Plugin — installable on mobile, offline map tile caching

**Backend**
- Python Flask 3
- Flask-SQLAlchemy — ORM (SQLite for dev, swappable via `DATABASE_URL`)
- Flask-JWT-Extended — phone OTP authentication
- Flask-CORS

---

## Project structure

```
mi_vecindario/
├── src/                    # React frontend
│   ├── components/         # Auth, MapScreen, Profile, Compose, etc.
│   ├── context/            # AuthContext
│   ├── api.js              # HTTP client layer
│   ├── data.js             # Static constants & categories
│   └── styles.css          # Design system (CSS variables)
├── backend/
│   ├── routes/             # auth, reports, users, catalogs
│   ├── models.py           # SQLAlchemy models
│   ├── app.py              # Flask app factory
│   ├── seed.py             # Demo data seeder
│   └── requirements.txt
├── public/                 # PWA icons
└── vite.config.js          # Vite + Workbox config
```

---

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Seed demo data (optional)
python seed.py

# Start the API server (port 8000)
python app.py
```

### Frontend

```bash
# From the project root
npm install
npm run dev                    # Starts on http://localhost:5173
```

### Demo login

1. Enter any 10-digit phone number (e.g. `5598765432` for the pre-seeded user MarisolR).
2. The OTP code is printed to the **backend console** — paste it in the app to log in.

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///vecindario.db` | SQLAlchemy connection string |
| `JWT_SECRET` | `dev-secret-change-in-prod` | JWT signing key — **change in production** |

---

## Notes

This project was built as a rapid prototype during a one-day hackathon. It is intentionally scoped for demo use:

- No real SMS gateway (OTP is logged to the console)
- SQLite database with no migrations
- No production deployment configuration

---

## License

MIT
