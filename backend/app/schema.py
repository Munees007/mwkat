from pydantic import BaseModel

class WindAnalyticsRequest(BaseModel):
    WINDHH_DateFrom: str
    WINDHH_DateTo: str
    WINDHH_SettlementPeriod: list
    WINDHH_FuelType: str
    WINDFOR_DateFrom: str
    WINDFOR_DateTo: str