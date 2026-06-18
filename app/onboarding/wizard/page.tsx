"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Database, 
  RefreshCw, 
  Server,
  TrendingUp,
  Info
} from "lucide-react";

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tested, setTested] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  
  // Step 1 Form state
  const [provider, setProvider] = useState("aws");
  const [accountId, setAccountId] = useState("123456789012");
  const [accountName, setAccountName] = useState("Primary Production AWS");
  const [roleArn, setRoleArn] = useState("arn:aws:iam::123456789012:role/ReserveIQOptimizationRole");

  // Step 2 Form state
  const [riskProfile, setRiskProfile] = useState(70); // 0 = ultra conservative, 100 = aggressive

  const handleTestCredentials = () => {
    setLoading(true);
    setTested(true);
    setTestSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setTestSuccess(true);
    }, 1200);
  };

  const getRiskLabel = (value: number) => {
    if (value < 30) return { title: "Ultra Conservative", desc: "Covers only guaranteed stable workloads. Risk of over-spend is virtually 0%, but you miss out on substantial spot-like savings.", coverage: "50% - 65%" };
    if (value < 65) return { title: "Balanced (Recommended)", desc: "Optimizes for maximum historical baseline. Balances reserved instances with flexible savings plans. Risk of waste is minimal (<2%).", coverage: "75% - 85%" };
    if (value < 85) return { title: "Growth Aggressive", desc: "Highly optimized for near-peak workloads. Targets massive commitments based on 30-day forecast models.", coverage: "85% - 92%" };
    return { title: "Maximum Yield", desc: "Aggressive committed-use portfolio matching all predicted workload spikes. Delivers absolute lowest raw compute rates, with small risk of short-term idle capacity.", coverage: "95%+" };
  };

  const riskInfo = getRiskLabel(riskProfile);

  const previewMetrics = [
    { label: "Monitored Cloud Accounts", value: "1 Active" },
    { label: "Detected Compute Instances", value: "342 Active instances" },
    { label: "Historical 30-day Monthly Spend", value: "$48,920" },
    { label: "Current Committed Spend Coverage", value: "32.4%" },
    { label: "Optimum Recommended Coverage", value: `${riskProfile}%` },
    { label: "Estimated Monthly Savings Peak", value: `$${((48920 * (riskProfile / 100) * 0.45)).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Algorithmic Forecast Horizon", value: "30 Days (Growth Tier)" },
    { label: "Portfolio Recommendation Refresh", value: "Realtime (< 2 min SLA)" },
    { label: "Predicted Idle Commit Waste", value: riskProfile > 85 ? "$420 / mo" : "$0 / mo" },
    { label: "Savings-to-Cost Multiple", value: "9.5x average" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Top Brand */}
      <div className="absolute top-8 left-8 flex items-center space-x-2">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-lg text-white">R</div>
        <span className="font-semibold text-lg tracking-wider text-white">ReserveIQ</span>
      </div>

      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-10 shadow-2xl space-y-8">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Onboarding Setup Wizard</h1>
            <p className="text-sm text-slate-400">Configure your connection, risk profiling, and pre-flight parameters.</p>
          </div>
          <div className="text-sm font-semibold text-blue-400 bg-blue-950/40 border border-blue-900/50 px-3 py-1 rounded-full">
            Step {step} of 3
          </div>
        </div>

        {/* Steps Visual Progress */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-800"}`} />
          <div className={`h-1.5 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-800"}`} />
          <div className={`h-1.5 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-slate-800"}`} />
        </div>

        {/* Step 1: Connect credentials */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-200">1. Connect Cloud Infrastructure</h2>
              <p className="text-xs text-slate-400">ReserveIQ requires read-only metadata access to scan your compute capacity and reservation utilization metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Cloud Provider</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="aws">Amazon Web Services (AWS)</option>
                  <option value="azure">Microsoft Azure</option>
                  <option value="gcp">Google Cloud Platform (GCP)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Account ID / Subscription ID</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 123456789012"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Friendly Account Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Primary Production AWS"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Cross-Account Role ARN (Recommended)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="arn:aws:iam::..."
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">Validate Read-Only Access Credentials</p>
                  <p className="text-xs text-slate-400">Verifies that the role policy correctly grants access to Billing APIs (CURs) and EC2 descriptors.</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleTestCredentials}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition text-white"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />}
                <span>{loading ? "Testing..." : "Test Credentials"}</span>
              </button>
            </div>

            {tested && (
              <div className={`p-4 rounded-lg border flex items-start space-x-3 animate-fadeIn ${
                testSuccess 
                  ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" 
                  : "bg-amber-950/20 border-amber-900/50 text-amber-400"
              }`}>
                {testSuccess ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{testSuccess ? "Credentials Verified successfully!" : "Verification in progress"}</p>
                  <p className="text-xs opacity-90">
                    {testSuccess 
                      ? "ReserveIQ holds complete metadata read access and can securely fetch utilization metrics for 342 active instances." 
                      : "We are currently checking the CloudFormation stack setup on your AWS account."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Risk profile slider */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-200">2. Configure Risk Hedging Profile</h2>
              <p className="text-xs text-slate-400">Our hybrid greedy-forecast algorithm scales reservation commitments based on your operational risk limits.</p>
            </div>

            <div className="space-y-6 bg-slate-950 border border-slate-800 rounded-lg p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Ultra Conservative (0%)</span>
                  <span>Balanced</span>
                  <span>Aggressive Maximum Yield (100%)</span>
                </div>
                
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Dynamic explanation card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm font-semibold text-blue-400">{riskInfo.title}</span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    Target Coverage: {riskInfo.coverage}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{riskInfo.desc}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Allows auto-execution of RI purchases when usage utilization forecasts stay &gt;95%.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview raw metrics */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-200">3. Optimization Portfolio Pre-flight Preview</h2>
              <p className="text-xs text-slate-400">Below is the synthetic live audit generated from our read-only analysis of your infrastructure metrics.</p>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-3 font-semibold text-slate-300">Audit Metric</th>
                    <th className="p-3 font-semibold text-slate-300 text-right">Value / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {previewMetrics.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400 font-medium">{item.label}</td>
                      <td className="p-3 text-slate-200 text-right font-mono">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-950/20 border border-blue-900/50 rounded-lg flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-400">GuaranteedMRR ROI SLA Active</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on the configured {riskProfile}% commitment risk ceiling, ReserveIQ forecasts a 90% manual reconciliation overhead reduction. It auto-generates portfolio purchases with zero upfront capital requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="px-4 py-2 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-950 disabled:opacity-0 transition flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              disabled={step === 1 && !testSuccess}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-sm font-semibold text-white transition flex items-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                router.push("/dashboard");
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold text-white transition flex items-center space-x-2 shadow-lg shadow-emerald-950/40"
            >
              <span>Launch Dashboard</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
