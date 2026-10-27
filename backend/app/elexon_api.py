import requests
from datetime import datetime, timedelta
apiUrl = "https://data.elexon.co.uk/bmrs/api/v1/datasets/"

def FUELHH(date_from: str, date_to: str, settlement_period: list, fuel_type: str):
    start_dt = datetime.strptime(date_from, "%Y-%m-%d")
    end_dt = datetime.strptime(date_to, "%Y-%m-%d")

    all_records = []
    current_start = start_dt

    # Loop in 6-day steps (Elexon allows max 7 days inclusive)
    while current_start <= end_dt:
        current_end = min(current_start + timedelta(days=6), end_dt)

        params = {
            "settlementDateFrom": current_start.strftime("%Y-%m-%d"),
            "settlementDateTo": current_end.strftime("%Y-%m-%d"),
            "fuelType": fuel_type,
        }
        # Only include settlementPeriod if passed
        if settlement_period and len(settlement_period) > 0:
            params["settlementPeriod"] = settlement_period

        response = requests.get(apiUrl + "FUELHH", params=params)
        res_json = response.json()

        # Append data chunk
        if isinstance(res_json, dict) and "data" in res_json:
            all_records.extend(res_json["data"])
        elif isinstance(res_json, list):
            all_records.extend(res_json)

        current_start = current_end + timedelta(days=1)

    return {"message": "FUELHH data fetched successfully", "data": all_records}

def WINDFOR(date_from: str, date_to: str):
  # Parse ISO timestamps e.g., '2025-12-30T00:00:00Z'
  start_dt = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
  end_dt = datetime.fromisoformat(date_to.replace("Z", "+00:00"))

  all_records = []
  current_start = start_dt

  while current_start <= end_dt:
    current_end = min(current_start + timedelta(days=6), end_dt)

    params = {
        "publishDateTimeFrom": current_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "publishDateTimeTo": current_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    response = requests.get(apiUrl + "WINDFOR", params=params)
    res_json = response.json()

    if isinstance(res_json, dict) and "data" in res_json:
      all_records.extend(res_json["data"])
    elif isinstance(res_json, list):
      all_records.extend(res_json)

    current_start = current_end + timedelta(seconds=1)

  return {"message": "WINDFOR data fetched successfully", "data": all_records}