# 🏙️ ChennaiHome AI

**AI-Powered Chennai Real Estate Price Valuation & Market Intelligence Platform**

ChennaiHome AI is a full-stack, enterprise-grade real estate valuation platform tailored specifically for the Chennai metropolitan housing market. It leverages a modern Machine Learning pipeline (including TabTransformer neural network embeddings) to predict residential and commercial property prices with high accuracy, provide 90% confidence intervals, and deliver interactive spatial insights.

---

## ✨ Features

- **🎯 Machine Learning Valuation Engine**:
  - Trained on authentic Chennai property transactions.
  - TabTransformer categorical attention & continuous MLP architecture.
  - Feature considerations: Locality (`AREA`), `INT_SQFT`, `DIST_MAINROAD`, `N_BEDROOM`, `N_BATHROOM`, `N_ROOM`, `SALE_COND`, `PARK_FACIL`, `BUILDTYPE`, `UTILITY_AVAIL`, `STREET`, `MZZONE`, `BUILDING_AGE`, and quality survey scores (`QS_ROOMS`, `QS_BATHROOM`, `QS_BEDROOM`, `QS_OVERALL`).
  - Delivers price estimates in Indian Currency (₹, Lakhs, Crores), price per sq.ft., and statistical confidence bands.
- **🗺️ Interactive Geospatial Map**:
  - Interactive Leaflet-powered Chennai map with key real estate hubs (Anna Nagar, T Nagar, Velachery, Adyar, Chrompet, Karapakkam, etc.).
- **📊 Analytics & Market Insights**:
  - Locality price benchmarks, historical trend analysis, and dynamic charts powered by Recharts.
- **🔐 Secure Authentication & History**:
  - JWT-based authentication with bcrypt password hashing.
  - Personal prediction history and saved property estimates.
- **🌐 Bilingual Support**:
  - Full localization support for **English** and **Tamil** (தமிழ்).
- **🎨 Modern Responsive UI**:
  - Built with React 19, TypeScript, and modern CSS design tokens with dark/light aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: CSS design system with responsive layouts
- **Maps**: Leaflet & React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **Internationalization**: i18next & react-i18next
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn
- **ORM / Database**: SQLAlchemy with SQLite
- **Security**: PyJWT & Bcrypt
- **ML / Data Science**: PyTorch (TabTransformer), Scikit-Learn, Pandas, NumPy, Joblib

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: v3.10+ and `pip`
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/Ragupathi-tech/chennai-home-AI.git
cd chennai-home-AI
```

### 3. Setup & Run Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend
python run_backend.py
```
Backend will be available at:
- **API URL**: `http://127.0.0.1:8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### 4. Setup & Run Frontend

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## 📂 Project Structure

```text
chennai-home-ai/
├── backend/
│   ├── app/
│   │   ├── api/               # API endpoints (auth, users, predictions, insights)
│   │   ├── core/              # Config and security
│   │   ├── database/          # Database connection and models
│   │   ├── models/            # SQLAlchemy database entities
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Business logic and ML inference service
│   │   └── main.py            # FastAPI application entry point
│   ├── data/                  # Chennai housing datasets
│   ├── ml/                    # TabTransformer model, training scripts, model weights
│   │   ├── model/             # Serialized model.joblib and metrics.json
│   │   ├── tab_transformer.py # PyTorch TabTransformer architecture
│   │   └── train.py           # Training pipeline
│   └── tests/                 # Unit and integration tests
├── frontend/
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── components/        # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── context/           # Auth and App state contexts
│   │   ├── i18n/              # English & Tamil translations
│   │   ├── pages/             # Predictor, Map, Insights, History, Dashboard
│   │   ├── services/          # Axios API clients
│   │   ├── App.tsx            # Root application router
│   │   └── main.tsx           # React entry point
│   ├── package.json
│   └── vite.config.ts
├── run_backend.py             # Script to launch backend server
├── start_backend.bat          # Quick-start script for Windows
├── start_frontend.bat         # Quick-start script for Windows
├── package.json               # Root scripts
├── requirements.txt           # Python backend dependencies
└── README.md                  # Project documentation
```

---

## 📜 License

This project is licensed under the MIT License.
