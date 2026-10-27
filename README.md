# Day-Ahead Wind Generation & Forecast Analytics Dashboard

An interactive control-room dashboard built for UK energy utilities to evaluate day-ahead wind generation forecasts against actual outturn generation.

This application isolates **gate-closure day-ahead forecasts** (11:00 AM UTC on D-1) to eliminate look-ahead bias and quantifies forecast error metrics (MAE, RMSE, Bias). This helps power traders determine how much additional thermal or balancing generation needs to be procured to meet consumer demand.

---

## Technical Stack & Architecture

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
* **Backend:** Python 3.11, FastAPI, Pandas, NumPy, Uvicorn.
* **Data Source:** Elexon BMRS Stream API (`FUELHH` for actuals, `WINDFOR` for forecasts).
* **Containerization:** Docker & Docker Compose.

---

## Core Domain & Analytics Logic

1. **Day-Ahead Auction Cutoff (11:00 AM UTC D-1):**
* Bids close at 11:00 AM UTC on Day D-1 for delivery on Day D.
* The backend filters out all intraday forecasts published after gate closure and selects the latest valid forecast available to traders prior to the 11:00 AM cutoff.


2. **30-Minute to 1-Hour Settlement Deduplication:**
* `FUELHH` (actuals) provides 30-minute settlement period outturns, while `WINDFOR` provides 1-hour resolution forecasts.
* The backend deduplicates and aligns forecast publication timestamps with actual target delivery times using an inner join on exact target `startTime` records.


3. **Quantitative Error Metrics:**
* **MAE (Mean Absolute Error):** Measures the baseline magnitude of forecast inaccuracy.
* **RMSE (Root Mean Squared Error):** Penalizes large, abrupt forecast spikes.
* **System Bias:** Identifies systematic over-forecasting (+) or under-forecasting (-) trends.



---

## AI Assistance & Tool Disclosure

In accordance with the assessment guidelines, **Google Gemini** was used as an AI thought partner and code collaborator throughout the development of this application.

Specifically, Gemini was used for:

* **Domain Logic Verification:** Double-checking UK day-ahead market gate closure constraints and cutoff math.
* **Data Processing Logic:** Refining Pandas vectorized methods for time-chunking Elexon API calls and deduplicating historical forecasts.
* **UI Scaffolding:** Drafting Tailwind CSS layout concepts and Recharts component setups.
* **Troubleshooting:** Debugging Pandas DataFrame join keys (`KeyError` issues during merges) and configuring Docker multi-stage builds.

---

## Running the Application via Docker

The entire stack (FastAPI backend + Vite React frontend) can be spun up using Docker Compose:

```bash
# Clone the anonymous repository
git clone <your-repo-url>
cd <repo-folder>

# Build and run using Docker Compose
docker compose up --build

```

Once started:

* **Frontend App:** Access at `http://localhost:1573`
* **FastAPI Backend / Docs:** Access Swagger UI at `http://localhost:8000/docs`

---

## Manual Local Setup (Without Docker)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate | On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev

```

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point & routes
│   │   ├── analytics.py      # Day-ahead cutoff logic & metric calculations
│   │   └── elexon_api.py     # Date-chunking API fetcher (FUELHH & WINDFOR)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # KPI cards, charts, thunder loader, navbar
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx           # Dashboard view & state management
│   ├── Dockerfile
│   ├── nginx.conf            # SPA routing config for Docker build
│   └── vite.config.ts
├── docker-compose.yml
└── README.md

```

---
