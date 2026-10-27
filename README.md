# Day-Ahead Wind Generation & Forecast Analytics Dashboard

An interactive analytics dashboard designed for UK energy trading teams to compare wind generation forecasts published by Elexon with actual wind generation and evaluate forecast accuracy for January 2026.

The application retrieves data from Elexon's BMRS API, aligns forecast and actual generation records, and presents forecast error metrics and visual comparisons. It helps users understand forecast uncertainty when assessing day-ahead electricity procurement risk.

## Technical Stack & Architecture

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Recharts and Lucide Icons.
- **Backend:** Python 3.11, FastAPI, Pandas, NumPy and Uvicorn.
- **Data Source:** Elexon BMRS Stream API — `FUELHH` for actual generation and `WINDFOR` for wind forecasts.
- **Containerization:** Docker and Docker Compose.

## Core Domain & Analytics Logic

### 1. Historical Forecast Selection

The dashboard compares actual wind generation with eligible forecast records for the selected delivery periods.

For each delivery timestamp, the backend calculates 11:00 Europe/London on the preceding calendar day as the decision cutoff. It filters out forecasts published after that cutoff and selects the latest eligible `publishTime` for each delivery timestamp. The cutoff is timezone-aware and follows UK daylight-saving changes. The selected publication time is available in the audit table and CSV export.

The 11:00 UK-local cutoff is an implementation assumption based on the agreed product requirement; confirm it with the trading team before using the results as an operational trading control. Forecast publication data is fetched from seven days before the selected delivery-date range through its end, so the selected record is the latest eligible publication within that fetched window.

### 2. Data Retrieval and Alignment

- `FUELHH` provides actual generation records associated with settlement periods.
- `WINDFOR` provides wind generation forecast records with publication and delivery timestamps.
- The backend fetches data in smaller date or timestamp ranges, including the seven-day publication lookback needed to cover the first delivery day's preceding-day cutoff.
- Forecasts are filtered against each delivery timestamp's day-ahead cutoff and deduplicated by delivery timestamp, retaining the latest eligible publication time.
- An inner join on `startTime` retains only records with matching delivery timestamps in both datasets.

The resulting matched dataset is used for the forecast comparison. The API returns an explicit error when no eligible forecast/actual timestamps match. The dashboard shows the selected publication times and the number of matched settlement periods; unmatched-period coverage should still be considered when interpreting metrics.

### 3. Quantitative Forecast Error Metrics

The backend calculates three metrics from the matched forecast and actual generation values.

- **Mean Absolute Error (MAE):** The average absolute difference between forecast and actual generation.
- **Root Mean Squared Error (RMSE):** A measure that gives larger errors more weight.
- **System Bias:** The mean signed error, calculated as forecast generation minus actual generation. Positive values indicate overforecasting on average; negative values indicate underforecasting on average.

The dashboard also displays the number of matched records and visualises the forecast, actual generation and signed error over time. CSV exports include the selected forecast publication timestamp.

### 4. Interpretation and Scope

Positive forecast errors indicate periods when forecast wind generation exceeded actual wind generation. These periods can highlight potential wind shortfall risk.

However, the calculated error is not the same as the total thermal generation required to meet demand. Estimating actual procurement requirements would also require demand and other relevant supply information, which are outside the scope of this assignment.

## AI Assistance & Tool Disclosure

Google Gemini was used as an AI assistant during development to support domain research, code development, UI scaffolding and troubleshooting. The developer reviewed and integrated the generated suggestions into the application.

## Running the Application via Docker

Start the application using Docker Compose:

```bash
docker compose up --build
```

Once the containers are running:

- **Frontend:** `http://localhost:1573`
- **Backend API documentation:** `http://localhost:8000/docs`

## Manual Local Setup

### Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Use the local development URL printed by Vite. If the frontend expects a separate backend URL, configure it according to the project's environment settings.

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── analytics.py
│   │   └── elexon_api.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Deployment

The application is intended to be deployed with the frontend hosted on Vercel and the Python backend hosted on a compatible service. Configure the frontend's API URL to point to the deployed backend.

live url: https://mwkat.vercel.app/
github url: https://github.com/Munees007/mwkat