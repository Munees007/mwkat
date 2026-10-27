import "./App.css";
import AnalyticCard from "./components/AnalyticCard";
import Navbar from "./components/navbar";
import type { AnalyticCardProps } from "./types/AnalyticCardProps";
import { TbAlertTriangleFilled, TbSum } from "react-icons/tb";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { MdAirplanemodeActive } from "react-icons/md";
import { CgMenuGridO } from "react-icons/cg";
import { HiOutlineDownload } from "react-icons/hi";
import type { AnalyticsType } from "./types/AnalyticsResult";
import { useState } from "react";
import axios from "axios";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ThunderLoader from "./components/ThunderLoader";
function App() {
  const [data, setData] = useState<AnalyticsType | null>(null);
  const [analyticCardsData, setAnalyticCardsData] = useState<
    AnalyticCardProps[]
  >([]);
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-01-31");
  const SETTLEMENT_OPTIONS = [
    { label: "All Periods (1-48)", value: [] },
    {
      label: "Morning Peak (P14-P20 / 06:30-10:00)",
      value: [14, 15, 16, 17, 18, 19, 20],
    },
    {
      label: "Evening Peak (P32-P38 / 15:30-19:00)",
      value: [32, 33, 34, 35, 36, 37, 38],
    },
    {
      label: "Overnight Off-Peak (P1-P12 / 00:00-06:00)",
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  ];

  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.PROD 
  ? '/api/wind_analytics' 
  : 'http://localhost:8000/api/wind_analytics';
  const handleFetchAnalytics = async () => {
    setLoading(true);
    try {
      const windforFrom = `${dateFrom}T00:00:00Z`;
      const windforTo = `${dateTo}T23:59:59Z`;
      
      const response = await axios.post(
       API_URL,
        {
          WINDHH_DateFrom: dateFrom,
          WINDHH_DateTo: dateTo,
          WINDHH_SettlementPeriod: selectedPeriods, // Empty array = all 48 settlement periods!
          WINDHH_FuelType: "WIND",
          WINDFOR_DateFrom: windforFrom,
          WINDFOR_DateTo: windforTo,
        },
      );

      const res = response.data as AnalyticsType;

      setAnalyticCardsData([
        {
          icon: <FaChartBar size={32} className="text-success" />,
          title: "Mean Absolute Error",
          value: res.kpis.mae,
          unit: "MW",
          description: "Average absolute forecast error",
        },
        {
          icon: <TbSum size={32} className="text-warning" />,
          title: "RMSE",
          value: res.kpis.rmse,
          unit: "MW",
          description: "Root mean square error",
        },
        {
          icon: <TbAlertTriangleFilled size={32} className="text-error" />,
          title: "System Forecast Bias",
          value: res.kpis.bias,
          unit: "MW",
          description: "Mean error (Over/Under trend)",
        },
        {
          icon: <FaCalendarAlt size={32} className="text-info" />,
          title: "Total Settlement Slots",
          value: res.kpis.total_records,
          unit: "Periods",
          description: "Evaluated settlement slots",
        },
      ]);

      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data?.chart_data) return;
    const headers = [
      "Start Time",
      "Actual (MW)",
      "Forecast (MW)",
      "Error (MW)",
    ];
    const rows = data.chart_data.map((row) => [
      row.startTime_str,
      row.actual_mw,
      row.forecast_mw,
      row.error,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wind_generation_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="p-3 w-full flex flex-col">
      <Navbar />

      <div className="flex items-center justify-between p-4 bg-bg-card  rounded-xl mb-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-bg-secondary border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-bg-secondary border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              Settlement Filter
            </label>
            <select
              onChange={(e) => setSelectedPeriods(JSON.parse(e.target.value))}
              className="bg-bg-secondary border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {SETTLEMENT_OPTIONS.map((opt, i) => (
                <option key={i} value={JSON.stringify(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFetchAnalytics}
            disabled={loading}
            className="mt-5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-medium rounded-lg text-sm transition"
          >
            {loading ? "Fetching Full Data..." : "Run Analytics"}
          </button>
        </div>
      </div>

      {loading ? (
        <ThunderLoader message="Processing January 2026 Elexon Chunks..." />
      ) : (
        <div>
          <div className="grid grid-cols-4 gap-3">
            {analyticCardsData.map((card, index) => (
              <AnalyticCard
                key={index}
                icon={card.icon}
                title={card.title}
                value={card.value}
                unit={card.unit}
                description={card.description}
              />
            ))}
          </div>
          {data && (
            <div className="flex w-full mt-3 gap-3">
              {/* Main Line Chart: Actual vs Forecast */}
              <div className="p-5 bg-bg-card rounded-xl flex-1">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <MdAirplanemodeActive
                      size={30}
                      className="text-text-secondary"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Generation Profile: Actual vs Day-Ahead Forecast
                      </h2>

                      <p className="text-xs text-slate-400">
                        Comparing actual outturn generation against day-ahead
                        locked predictions
                      </p>
                    </div>
                  </div>
                  {/* Download CSV Button */}
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm transition"
                  >
                    <HiOutlineDownload size={16} />
                    Export CSV
                  </button>
                </div>

                <div className="h-100 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="startTime_str" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" unit=" MW" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e3147",
                          borderColor: "#334155",
                          color: "#ffffff",
                          borderRadius: "12px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual_mw"
                        name="Actual Wind Generation"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast_mw"
                        name="Day-Ahead Forecast"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secondary Area Chart: Error MW (Thermal Gap) */}
              <div className="p-5 bg-bg-card flex-1 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <CgMenuGridO size={30} className="text-text-secondary" />
                  <div className="flex flex-col justify-between gap-1">
                    <h2 className="text-lg font-bold text-white">
                      Thermal Shortfall Risk & System Deviation (MW)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Error = Forecast MW - Actual MW (Positive values indicate
                      wind deficit risk)
                    </p>
                  </div>
                </div>
                <div className="h-100 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="startTime_str" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" unit=" MW" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e3147",
                          borderColor: "#334155",
                          color: "#ffffff",
                          borderRadius: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="error"
                        name="Forecast Error (MW)"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
