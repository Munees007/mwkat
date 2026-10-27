import type { ReactElement } from "react";

export interface AnalyticCardProps {
    icon: ReactElement,
    title: string,
    value: number,
    unit: "MW" | "Periods",
    description: string,
}