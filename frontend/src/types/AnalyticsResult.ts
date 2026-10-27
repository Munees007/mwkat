export type kpisType = {
    mae:number,
    rmse:number,
    bias:number,
    total_records:number
}
export type chartDataType = {
    startTime_str:string,
    forecast_publish_time:string,
    actual_mw:number,
    forecast_mw:number,
    error:number
}
export interface AnalyticsType
{
    kpis: kpisType,
    decision_cutoff: string,
    chart_data:chartDataType[]
}