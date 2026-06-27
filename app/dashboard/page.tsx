"use client";

import { useState } from "react";
import { 
  BarChart3, 
  Layers, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Cloud,
  ChevronRight,
  Zap,
  Activity,
  User,
  LogOut,
  Sparkles,
  Info
} from "lucide-react";

export default function Dashboard() {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState([
    { id: "aws-prod", provider: "aws", name: "Primary Production AWS", accountId: "123456789012", region: "us-east-1", spend: "$31,450", coverage: "38%", waste: "4.2%", status: "Synced", lastSync: "12 mins ago" },
    { id: "azure-billing", provider: "azure", name: "Enterprise Azure Node", accountId: "sub-99382-b", region: "eastus", spend: "$11,200", coverage: "20%", waste: "18.4%", status: "Out of Sync", lastSync: "1 day ago" },
    { id: "gcp-bigdata", provider: "gcp", name: "GCP BigQuery Sandbox", accountId: "gcp-analytics-32", region: "us-central1", spend: "$6,270", coverage: "15%", waste: "24.1%", status: "Synced", lastSync: "2 hours ago" },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleForceSync = (id: string, name: string) => {
    setSyncingId(id);
    setToastMessage(null);
    setTimeout(() => {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === id) {
          return { ...acc, status: "Synced", lastSync: "Just now", waste: id === "azure-billing" ? "12.0%" : acc.waste };
        }
        return acc;
      }));
      setSyncingId(null);
      setToastMessage(`Force Sync complete! Re-calculated committed-spend optimization pipeline for '${name}' in 1.1s.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
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
            <a href="/dashboard" className="text-white border-b-2 border-blue-500 pb-4 pt-1">Dashboard</a>
            <a href="/analytics" className="text-slate-400 hover:text-slate-200 transition">Analytics Forecast</a>
            <a href="/plans" className="text-slate-400 hover:text-slate-200 transition">Execution Hub</a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Holt-Winters Engine Online</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 cursor-pointer">
            <User className="w-4 h-4" />
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-blue-950 border border-blue-800 text-blue-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-xl animate-slideIn">
            <div className="flex items-center space-x-2.5 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-xs text-slate-400 hover:text-slate-200 pl-4 font-semibold">Dismiss</button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Portfolio Command Center</h1>
            <p className="text-sm text-slate-400">Autonomous FinOps commitment recommendations and real-time cloud account telemetry.</p>
          </div>
          <div className="flex items-center space-x-3">
            <a href="/analytics" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 flex items-center space-x-2 transition">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>View Forecasts</span>
            </a>
            <a href="/plans" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center space-x-2 transition shadow-lg shadow-blue-950/50">
              <span>Execution Hub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Monthly Spend */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-slate-800 group-hover:text-slate-700 transition">
              <DollarSign className="w-12 h-12" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Total Monthly Compute Spend</p>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold tracking-tight text-white">$48,920</h3>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+1.4%</span>
                <span>vs previous month</span>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between text-xs text-slate-400">
              <span>Active instance count:</span>
              <span className="font-mono text-slate-200">342 active</span>
            </div>
          </div>

          {/* Card 2: Current Coverage */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-slate-800 group-hover:text-slate-700 transition">
              <Layers className="w-12 h-12" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Committed Spend Coverage %</p>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold tracking-tight text-white">32.4%</h3>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <span>Target ideal coverage:</span>
                <span className="text-blue-400 font-semibold">92.0%</span>
              </p>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: "32.4%" }}></div>
            </div>
            <div className="pt-0.5 flex justify-between text-xs text-slate-400">
              <span>Deficit Gap:</span>
              <span className="text-amber-400 font-mono">-$21,430 potential savings</span>
            </div>
          </div>

          {/* Card 3: Waste % */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md relative overflow-hidden group">
            <div className="absolute right-4 top-4 text-slate-800 group-hover:text-slate-700 transition">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Predicted Commits Waste %</p>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold tracking-tight text-white">12.8%</h3>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <span className="text-amber-400 font-medium">Unutilized reserves cost:</span>
                <span className="text-amber-400 font-mono">$1,240 / mo</span>
              </p>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "12.8%" }}></div>
            </div>
            <div className="pt-0.5 flex justify-between text-xs text-slate-400">
              <span>FinOps Overhead reduction:</span>
              <span className="text-emerald-400 font-medium">90% autonomous goal</span>
            </div>
          </div>

        </div>

        {/* Quick Action Suggestion Bar */}
        <div className="bg-blue-950/25 border border-blue-900/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/40 border border-blue-800/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-200">Greedy-Forecast recommendations available</p>
              <p className="text-xs text-slate-400">We identified 12 optimal RIs for AWS us-east-1 that could slash compute rates by 48%. Approve in Execution Hub.</p>
            </div>
          </div>
          <a href="/plans" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition">
            <span>Review Purchase Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Leaderboard Table Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                <span>Monitored Cloud Accounts Leaderboard</span>
              </h2>
              <p className="text-xs text-slate-400">Billing credentials scope status, calculated committed coverage ratios and unutilized wastage tracking.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Auto-evaluation interval:</span>
              <span className="text-xs font-semibold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">1 hour</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-xs">
                  <th className="p-4">Platform</th>
                  <th className="p-4">Account Metadata</th>
                  <th className="p-4 text-center">Monthly Spend</th>
                  <th className="p-4 text-center">Commit Coverage</th>
                  <th className="p-4 text-center">Wastage Rate</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Force Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-950/40 transition">
                    {/* Platform provider tag */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          acc.provider === "aws" ? "bg-amber-950/20 border-amber-900/30 text-amber-500" :
                          acc.provider === "azure" ? "bg-blue-950/20 border-blue-900/30 text-blue-500" :
                          "bg-red-950/20 border-red-900/30 text-red-500"
                        }`}>
                          <span className="uppercase text-xs font-extrabold">{acc.provider}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{acc.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{acc.region}</p>
                        </div>
                      </div>
                    </td>

                    {/* Account ID */}
                    <td className="p-4 text-slate-300 font-mono text-xs">
                      {acc.accountId}
                    </td>

                    {/* Spend */}
                    <td className="p-4 text-center text-slate-200 font-semibold font-mono">
                      {acc.spend}
                    </td>

                    {/* Coverage */}
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-xs font-mono font-semibold text-slate-200">{acc.coverage}</span>
                        <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            parseInt(acc.coverage) > 35 ? "bg-emerald-500" : "bg-amber-500"
                          }`} style={{ width: acc.coverage }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Wastage */}
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-xs font-mono font-semibold text-slate-200">{acc.waste}</span>
                        <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            parseFloat(acc.waste) < 10 ? "bg-emerald-500" : "bg-red-500"
                          }`} style={{ width: acc.waste }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          acc.status === "Synced" 
                            ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
                            : "bg-red-950/20 border-red-900/30 text-red-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.status === "Synced" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                          <span>{acc.status}</span>
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleForceSync(acc.id, acc.name)}
                        disabled={syncingId !== null}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center space-x-1.5 ml-auto"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${syncingId === acc.id ? "animate-spin" : ""}`} />
                        <span>{syncingId === acc.id ? "Syncing..." : "Force Sync"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950 p-4 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Accounts sync with public Billing CURs periodically. Sync status dictates algorithmic forecast confidence.</span>
            </div>
            <span>Page 1 of 1</span>
          </div>
        </div>

      </main>
    </div>
  );
}
