import type { AnalyticCardProps } from "../types/AnalyticCardProps"


const AnalyticCard:React.FC<AnalyticCardProps> = ({ icon, title, value, unit, description }) => {
  return (
    <div className="bg-bg-card w-full p-3 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-bg-secondary p-4 rounded-xl">{icon}</div>
        <div className="flex flex-col gap-1">
            <p className="text-text-secondary">{title}</p>
            <p className="text-text-primary text-xl font-bold">{value} <span className="text-success">{unit}</span></p>
            <p className="text-text-secondary text-xs">{description}</p>
        </div>
    </div>
  )
}

export default AnalyticCard