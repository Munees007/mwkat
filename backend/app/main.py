import fastapi
import uvicorn
from app.analytics import wind_analytics
from app.schema import WindAnalyticsRequest
from fastapi.middleware.cors import CORSMiddleware
app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Hello World!"}

@app.post("/api/wind_analytics")
def api_wind_analytics(request: WindAnalyticsRequest):
    wind_data = wind_analytics(request)
    return wind_data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)