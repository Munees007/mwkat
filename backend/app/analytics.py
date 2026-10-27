from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import HTTPException
import pandas as pd

from app.elexon_api import FUELHH, WINDFOR
from app.schema import WindAnalyticsRequest

DECISION_CUTOFF_HOUR = 11
UK_TIMEZONE = ZoneInfo("Europe/London")


def _decision_cutoff_utc(start_time: pd.Timestamp) -> pd.Timestamp:
    delivery_date = start_time.tz_convert(UK_TIMEZONE).date()
    cutoff_local = datetime.combine(
        delivery_date - timedelta(days=1),
        time(hour=DECISION_CUTOFF_HOUR),
        tzinfo=UK_TIMEZONE,
    )
    return pd.Timestamp(cutoff_local).tz_convert("UTC")


def wind_analytics(data: WindAnalyticsRequest):
    elexon_windhh = FUELHH(
        date_from=data.WINDHH_DateFrom,
        date_to=data.WINDHH_DateTo,
        settlement_period=data.WINDHH_SettlementPeriod,
        fuel_type=data.WINDHH_FuelType,
    )
    elexon_windfor = WINDFOR(
        date_from=data.WINDFOR_DateFrom,
        date_to=data.WINDFOR_DateTo,
    )

    windhh_df = pd.DataFrame(elexon_windhh["data"])
    if windhh_df.empty:
        raise HTTPException(
            status_code=422,
            detail="Elexon returned no FUELHH actual wind records for the requested dates.",
        )
    windhh_df["startTime"] = pd.to_datetime(windhh_df["startTime"], utc=True)
    windhh_df.rename(columns={"generation": "actual_mw"}, inplace=True)

    windfor_df = pd.DataFrame(elexon_windfor["data"])
    if windfor_df.empty:
        raise HTTPException(
            status_code=422,
            detail="Elexon returned no WINDFOR forecasts for the requested publication window.",
        )
    windfor_df["publishTime"] = pd.to_datetime(
        windfor_df["publishTime"], utc=True
    )
    windfor_df["startTime"] = pd.to_datetime(windfor_df["startTime"], utc=True)
    windfor_df.rename(columns={"generation": "forecast_mw"}, inplace=True)
    windfor_df["decision_cutoff"] = windfor_df["startTime"].map(
        _decision_cutoff_utc
    )

    windhh_clean = windhh_df[["startTime", "actual_mw"]]
    valid_forecasts = windfor_df[
        windfor_df["publishTime"] <= windfor_df["decision_cutoff"]
    ]
    latest_forecasts = (
        valid_forecasts.sort_values(["startTime", "publishTime"])
        .drop_duplicates(subset="startTime", keep="last")
    )

    df = pd.merge(
        windhh_clean,
        latest_forecasts[["startTime", "publishTime", "forecast_mw"]],
        on="startTime",
        how="inner",
    ).sort_values("startTime")

    if df.empty:
        raise HTTPException(
            status_code=422,
            detail=(
                "No actual wind records matched forecasts published by "
                "11:00 Europe/London on the day before delivery."
            ),
        )

    df["error"] = df["forecast_mw"] - df["actual_mw"]
    df["abs_error"] = df["error"].abs()
    df["startTime_str"] = df["startTime"].dt.strftime("%Y-%m-%d %H:%M")
    df["forecast_publish_time"] = df["publishTime"].dt.strftime(
        "%Y-%m-%d %H:%M UTC"
    )

    chart_data = df[
        [
            "startTime_str",
            "forecast_publish_time",
            "actual_mw",
            "forecast_mw",
            "error",
        ]
    ].to_dict(orient="records")

    return {
        "status": "success",
        "decision_cutoff": "11:00 Europe/London on the day before delivery",
        "kpis": {
            "mae": round(float(df["abs_error"].mean()), 2),
            "rmse": round(float((df["error"] ** 2).mean() ** 0.5), 2),
            "bias": round(float(df["error"].mean()), 2),
            "total_records": len(df),
        },
        "chart_data": chart_data,
    }
