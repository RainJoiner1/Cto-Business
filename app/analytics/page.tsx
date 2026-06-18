"use client";

import { useState } from "react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Info, 
  Filter, 
  ArrowLeft,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Generate synthetic 30-day forecast data
const generateForecastData = (showOptimized: boolean) => {
  const data = [];
  const baseDemand = 1600;
  const currentRI = 1080;
  
  for (let i = 1; i <= 30; i++) {
    // Generate organic wave pattern
    const sineValue = Math.sin((i / 30) * Math.PI * 2) * 200;
    const noise = Math.sin(i * 1.5) * 60;
    const growthTrend = i * 8; // growth over time
    
    const forecasted = Math.round(baseDemand + sineValue + noise + growthTrend);
    const deficit = Math.max(0, forecasted - currentRI);
    const optimalRI = Math.round(forecasted * 0.88); // greedy-forecast logic: commit up to 88%
    const optimizedWaste = Math.max(0, optimalRI - forecasted);
    const optimizedDeficit = Math.max(0, forecasted - optimalRI);

    data.push({
      day: `Jun ${i}`,
      "Forecasted Demand ($)": forecasted,
      "Current Reservation Portfolio ($)": currentRI,
      "On-Demand Deficit Gap ($)": deficit,
      "Optimal Recommendation Portfolio ($)": optimalRI,
      "Predicted Wastage ($)": optimizedWaste,
    });
  }
  return data;
};

export default function AnalyticsForecast() {
  const [showOptimized, setShowOptimized] = useState(false);
  const [activeAccount, setActiveAccount] = useState("all");
  
  const data = generateForecastData(showOptimized);

  const stats = {
    averageDemand: "$1,694 / day",
    currentRILevel: "$1,080 / day",
    deficitSum: "$18,420 (On-Demand rates)",
    potentialSavings: "$8,250 (44.8% savings)",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Navigation */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-lg text-white">R</div>
            <span className="font-bold text-lg tracking-wider text-white">ReserveIQ</span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="/dashboard" className="text-slate-400 hover:text-slate-200 transition">Dashboard</a>
            <a href="/analytics" className="text-white border-b-2 border-blue-500 pb-4 pt-1">Analytics Forecast</a>
            <a href="/plans" className="text-slate-400 hover:text-slate-200 transition">Execution Hub</a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <span>Forecast Horizon: 30 Days</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fadeIn">
        
        {/* Back Link & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <a href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 flex items-center space-x-1.5 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to command center</span>
            </a>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Committed Spend Analytics & Forecast</h1>
            <p className="text-sm text-slate-400">
              Simulation of next 30 days compute demand based on a double exponential smoothing algorithm.
            </p>
          </div>

          {/* Recommendations Toggle Overlay */}
          <button 
            onClick={() => setShowOptimized(!showOptimized)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition ${
              showOptimized 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200"
            }`}
          >
            {showOptimized ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showOptimized ? "Hide Recommendation Overlay" : "Show Optimal Recommendation Overlay"}</span>
          </button>
        </div>

        {/* Dynamic Warning Alert on deficit */}
        {!showOptimized && (
          <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 flex items-start space-x-3 text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Massive On-Demand Deficit Gap Detected</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your current reservation commitments cover only 32.4% of forecasted compute. Over the next 30 days, this exposes you to $18,420 in higher on-demand public cloud rates. Click <strong>Show Optimal Recommendation Overlay</strong> to preview the ideal greedy-forecast risk hedging portfolio.
              </p>
            </div>
          </div>
        )}

        {/* Analytics Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Average Compute Demand</p>
            <p className="text-xl font-bold font-mono text-white">{stats.averageDemand}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Current Commits Portfolio</p>
            <p className="text-xl font-bold font-mono text-slate-300">{stats.currentRILevel}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Forecasted Deficit Gap</p>
            <p className="text-xl font-bold font-mono text-amber-400">{stats.deficitSum}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Potential Optimized Savings</p>
            <p className="text-xl font-bold font-mono text-emerald-400">{stats.potentialSavings}</p>
          </div>
        </div>

        {/* Chart View Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>30-Day Compute Spend & Commitment Forecast</span>
              </h2>
              <p className="text-xs text-slate-400">
                Combo chart visualizing forecasted compute spend demand curves, current fixed RIs, and unoptimized deficit.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Filter account:</span>
              <select 
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
                value={activeAccount}
                onChange={(e) => setActiveAccount(e.target.value)}
              >
                <option value="all">All Accounts Consolidated</option>
                <option value="aws-prod">Primary Production AWS</option>
                <option value="azure-billing">Enterprise Azure Node</option>
              </select>
            </div>
          </div>

          {/* Recharts Render Area */}
          <div className="h-[400px] w-full bg-slate-950/20 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#f1f5f9" }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "4px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                
                {/* Forecast Line */}
                <Line 
                  type="monotone" 
                  dataKey="Forecasted Demand ($)" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6 }} 
                />

                {/* Current RI Line */}
                <Line 
                  type="monotone" 
                  dataKey="Current Reservation Portfolio ($)" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false} 
                />

                {/* Deficit Bar/Area (Represented as semi-transparent bar block) */}
                {!showOptimized && (
                  <Bar 
                    dataKey="On-Demand Deficit Gap ($)" 
                    fill="#b45309" 
                    opacity={0.35} 
                    radius={[4, 4, 0, 0]} 
                  />
                )}

                {/* Optimal Recommended RI Overlay Line */}
                {showOptimized && (
                  <Line 
                    type="monotone" 
                    dataKey="Optimal Recommendation Portfolio ($)" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={false} 
                  />
                )}
                
                {/* Predicted Waste Area */}
                {showOptimized && (
                  <Area 
                    type="monotone" 
                    dataKey="Predicted Wastage ($)" 
                    fill="#10b981" 
                    stroke="none" 
                    opacity={0.15} 
                  />
                )}

              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-200">Autonomous FinOps Greedy-Forecast Alignment</p>
                <p className="text-xs text-slate-400">Our model fits commitments to the 88% probability threshold to fully protect against weekend workload dips.</p>
              </div>
            </div>

            <a href="/plans" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition shrink-0">
              <span>Go to Execution Hub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>

      </main>
    </div>
  );
}
