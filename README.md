# VAHARCA

Vaharca is a full-stack web platform designed for AI-assisted teaching and assessment using Google Gemini. The application features a robust, high-performance Python backend and a lightweight, fast frontend.

## Technology Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy (using `pg8000` as the driver)
- **Authentication:** JWT (JSON Web Tokens)
- **AI:** Google Gemini API (for content generation and evaluation)

### Frontend
- **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool:** Vite

---

## Project Structure

The project is organized as a monorepo with a clear separation between the server-side logic and the user interface.

```text
vaharca-backend/
├── main.py                 # FastAPI entry point and main API routes
├── gemini_service.py       # Google Gemini API integration logic
├── security.py             # Security utilities (password hashing and JWT)
├── schemas.py              # Pydantic schemas for data validation
├── database/
│   ├── connection.py       # PostgreSQL connection
│   └── models.py           # SQLAlchemy ORM models
├── frontend/
│   ├── index.html          # HTML entry point
│   ├── package.json        # Vite dependencies
│   ├── vite.config.js      # Vite build configuration
│   ├── src/                # UI logic, components, and views in Vanilla JavaScript
│   └── css/                # Custom styles
├── .env                    # Environment variables (API keys and database credentials)
└── requirements.txt        # Python dependencies
```

---

# Local Installation and Setup

To run this project locally, follow these steps.

## Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- PostgreSQL installed and running

## Backend Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd vaharca-backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy pg8000 pyjwt python-dotenv google-generativeai
```

### 4. Create the `.env` file

```env
DB_USER=your_postgres_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
```

> **Note:** The Gemini API key is configured dynamically through the administrator panel in the frontend.

### 5. Start the backend

```bash
uvicorn main:app --reload
```

The API will be available at:

```
http://localhost:8000
```

Interactive API documentation:

```
http://localhost:8000/docs
```

---

## Frontend Setup

### 1. Navigate to the frontend folder

```bash
cd vaharca-backend/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

# How It Works

### Authentication

Users register and log in through the application. The backend validates the credentials and returns a JWT token. The frontend stores this token and includes it in the `Authorization: Bearer <token>` header when accessing protected endpoints.

### AI Lesson Generation

Authorized users can request AI-generated lessons. The frontend sends the request to the backend, where `gemini_service.py` communicates with Google Gemini using the API key configured by the administrator.

### Data Persistence

All users, lessons, assessments, and progress are stored in PostgreSQL using SQLAlchemy, ensuring relational integrity and efficient data management.

### CORS

The FastAPI backend is configured to accept requests from the Vite development server running on port `5173`.
---

## License

This project is private/proprietary.
