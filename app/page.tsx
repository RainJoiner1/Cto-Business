"use client";

import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Compass, 
  Activity 
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Navbar */}
      <header className="px-6 py-6 md:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-lg text-white">R</div>
          <span className="font-bold text-lg tracking-wider text-white">ReserveIQ</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition">Dashboard</a>
          <a href="/onboarding/wizard" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-blue-950/40">
            Launch Onboarding
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto space-y-8 py-12">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-950/50 border border-blue-900/50 px-3.5 py-1.5 rounded-full text-xs text-blue-400 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Cloud Portfolio Optimization</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Guarantee <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">&gt;95% Utilization</span> On Committed Spend
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ReserveIQ autonomously coordinates reserved instances and savings plans across AWS, Azure, and GCP using a hybrid greedy-forecast algorithm. Reduce manual FinOps reconciliation overhead by 90% in 30 days.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <a 
            href="/onboarding/wizard" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-950/50 text-base"
          >
            <span>Start Onboarding Wizard</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="/dashboard" 
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 transition text-base"
          >
            <span>Open Command Center</span>
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left w-full">
          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-white text-base">30-Day Predictive Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our double exponential Holt-Winters smoothing algorithm models compute demand waves to optimize reservation risk ceilings.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/20 border border-emerald-800/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-base">Greedy Bin-Packing Broker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomously evaluates, bundles, and matches no-upfront RI commitments to active instance configurations with &lt;2 min SLA execution.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-900/20 border border-amber-800/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-white text-base">Hedging Risk Profiling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fine-tune operational commitment risk boundaries with interactive sliders from Conservative protection to Aggressive maximum-yield models.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 px-6 py-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 max-w-7xl w-full mx-auto gap-4">
        <p>© 2026 ReserveIQ Inc. All rights reserved. Registered SaaS MRR Growth Tier.</p>
        <div className="flex space-x-6">
          <a href="/onboarding/wizard" className="hover:text-slate-300">Wizard</a>
          <a href="/dashboard" className="hover:text-slate-300">Dashboard</a>
          <a href="/analytics" className="hover:text-slate-300">Forecasts</a>
          <a href="/plans" className="hover:text-slate-300">Execution Hub</a>
        </div>
      </footer>

    </div>
  );
}
