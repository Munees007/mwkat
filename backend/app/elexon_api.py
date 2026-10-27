import requests
apiUrl = "https://data.elexon.co.uk/bmrs/api/v1/datasets/"

def FUELHH(date_from: str, date_to: str, settlement_period: list, fuel_type: str):
    params = {
        "settlementDateFrom": date_from,
        "settlementDateTo": date_to,
        "settlementPeriod": settlement_period,
        "fuelType": fuel_type
    }
    data = requests.get(apiUrl + "FUELHH", params=params).json()
    return {"message": "FUELHH data", "data": data}

def WINDFOR(date_from: str, date_to: str):
    params = {
        "publishDateTimeFrom": date_from,
        "publishDateTimeTo": date_to,
    }
    data = requests.get(apiUrl + "WINDFOR", params=params).json()
    return {
        "message": "WINDFOR data",
        "data": data
    }