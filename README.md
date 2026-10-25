# Andhra Pradesh Welfare Schemes Portal

A full-stack web application that helps users discover government welfare schemes and identify potential eligibility based on their profile.

## Features
- Browse government welfare schemes.
- Check potential eligibility using user profile details.
- Explore schemes by category.
- View scheme descriptions, benefits, required documents, and application information.
- Access an AI assistant for scheme-related guidance.

## Technology Stack
- **Frontend:** React, Vite, JavaScript
- **Backend:** Python, FastAPI
- **Database:** SQLite
- **Data access:** SQLAlchemy

## Project Structure
- `frontend/` — React user interface
- `backend/` — API, eligibility assessment, and scheme data

## Run Locally

### Backend
Activate your Python virtual environment, install dependencies, and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run these commands from the `backend/` directory.

### Frontend
Run these commands from the `frontend/` directory:

```bash
npm install
npm run dev
```

## Important Note
Eligibility results are potential matches, not a guarantee of approval. Users should verify eligibility and application requirements through official government sources.

## Status
Academic project — under development.
