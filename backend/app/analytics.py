from schema import WindAnalyticsRequest
import elexon_api
import pandas as pd

def wind_analytics(data:WindAnalyticsRequest):
    elexon_windhh = elexon_api.FUELHH(
        date_from=data.WINDHH_DateFrom,
        date_to=data.WINDHH_DateTo,
        settlement_period=data.WINDHH_SettlementPeriod,
        fuel_type=data.WINDHH_FuelType)

    elexon_windfor = elexon_api.WINDFOR(
        date_from=data.WINDFOR_DateFrom,
        date_to=data.WINDFOR_DateTo)

    windhh_df = pd.DataFrame(elexon_windhh["data"])
    #converting the date columns to datetime format
    windhh_df['startTime'] = pd.to_datetime(windhh_df['startTime'])
    windhh_df['publishTime'] = pd.to_datetime(windhh_df['publishTime'])
    windhh_df['settlementDate'] = pd.to_datetime(windhh_df['settlementDate'])
    #renaming the columns to more readable names
    windhh_df.rename(columns={
        'generation': 'actual_mw'
    }, inplace=True)

    windfor_df = pd.DataFrame(elexon_windfor["data"])
    #converting the date columns to datetime format
    windfor_df['publishTime'] = pd.to_datetime(windfor_df['publishTime'])
    windfor_df['startTime'] = pd.to_datetime(windfor_df['startTime'])
    #renaming the columns to more readable names
    windfor_df.rename(columns={
        'generation': 'forecast_mw'
    }, inplace=True)


    # 1. Select only needed columns from actuals (drop publishTime from actuals)
    windhh_clean = windhh_df[
        ['startTime', 'settlementDate', 'settlementPeriod', 'actual_mw']
    ]

    
    # 1. Filter forecast published before delivery target
    valid_forecasts = windfor_df[
        windfor_df['publishTime'] <= windfor_df['startTime']
    ]

    # 2. DEDUPLICATE: Keep ONLY the latest publishTime for each startTime
    latest_forecasts = (
        valid_forecasts.sort_values('publishTime')
        .groupby('startTime')
        .last()
        .reset_index()
    )

    df = pd.merge(
        windhh_clean,
        latest_forecasts[['startTime', 'forecast_mw']],
        on='startTime',
        how='inner',
    )

    # 5. Difference calculations
    df['error'] = df['forecast_mw'] - df['actual_mw']
    df['abs_error'] = df['error'].abs()

    mae = df['abs_error'].mean()
    rmse = (df['error'] ** 2).mean() ** 0.5
    bias = df['error'].mean()

    # 1. Format timestamps to strings so FastAPI can serialize them easily
    df["startTime_str"] = df["startTime"].dt.strftime("%Y-%m-%d %H:%M")

    # 2. Select columns needed for frontend charts and table
    chart_data = df[[
        "startTime_str",
        "actual_mw",
        "forecast_mw",
        "error",
    ]].to_dict(orient="records")

    # print('Min Actual Date:', df['startTime'].min())
    # print('Max Actual Date:', df['startTime'].max())
    # print('Total Matched Rows:', len(df))
    
    # 3. Build return JSON payload
    return {
        "status": "success",
        "kpis": {
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "bias": round(float(bias), 2),
            "total_records": len(df),
        },
        "chart_data": chart_data,
    }
