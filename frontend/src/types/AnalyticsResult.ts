export type kpisType = {
    mae:number,
    rmse:number,
    bias:number,
    total_records:number
}
export type chartDataType = {
    startTime_str:string,
    actual_mw:number,
    forecast_mw:number,
    error:number
}
export interface AnalyticsType
{
    kpis: kpisType,
    chart_data:chartDataType[]
}