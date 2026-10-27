import fastapi
import uvicorn
from analytics import wind_analytics
from schema import WindAnalyticsRequest

app = fastapi.FastAPI()



@app.get("/")
def read_root():
    return {"message": "Hello World!"}

@app.post("/api/wind_analytics")
def api_wind_analytics(request: WindAnalyticsRequest):
    wind_data = wind_analytics(request)
    return wind_data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)