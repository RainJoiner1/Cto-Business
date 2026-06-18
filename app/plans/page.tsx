"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  DollarSign,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Trash2
} from "lucide-react";

export default function PlansHub() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanId, setSelectedId] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [plans, setAccountsPlans] = useState([
    { 
      id: "plan-aws-29", 
      title: "AWS US-East No-Upfront Greedy Portfolio", 
      type: "Growth Tier Optimization",
      accountName: "Primary Production AWS", 
      status: "PENDING APPROVAL", 
      upfront: "$0", 
      monthlySavings: "$14,250", 
      created: "2 hours ago",
      items: [
        { instance: "r6g.2xlarge No-Upfront Standard RI", region: "us-east-1", qty: 4, term: "1 Year", discount: "42%", savings: "$4,120/mo" },
        { instance: "m6g.xlarge No-Upfront Convertible RI", region: "us-east-1", qty: 6, term: "1 Year", discount: "38%", savings: "$3,840/mo" },
        { instance: "c6g.2xlarge No-Upfront Standard RI", region: "us-east-1", qty: 2, term: "3 Year", discount: "45%", savings: "$6,290/mo" },
      ]
    },
    { 
      id: "plan-azure-12", 
      title: "Azure EastUS Compute Savings Plan Alignment", 
      type: "Automated Bin-Packing",
      accountName: "Enterprise Azure Node", 
      status: "APPROVED", 
      upfront: "$0", 
      monthlySavings: "$4,820", 
      created: "1 day ago",
      items: [
        { instance: "Standard_D8s_v5 No-Upfront Savings Plan", region: "eastus", qty: 8, term: "1 Year", discount: "31%", savings: "$4,820/mo" }
      ]
    },
    { 
      id: "plan-gcp-04", 
      title: "GCP BigQuery Flat-Rate Slot Transition", 
      type: "Holt-Winters Seasonal Hedging",
      accountName: "GCP BigQuery Sandbox", 
      status: "EXECUTED", 
      upfront: "$0", 
      monthlySavings: "$2,100", 
      created: "3 days ago",
      items: [
        { instance: "100-Slot Monthly Commitment Model", region: "us-central1", qty: 1, term: "1 Month", discount: "20%", savings: "$2,100/mo" }
      ]
    }
  ]);

  const handleOpenApproveModal = (id: string) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handleApproveAndExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setAccountsPlans(prev => prev.map(p => {
        if (p.id === selectedPlanId) {
          return { ...p, status: "APPROVED" };
        }
        return p;
      }));
      setExecuting(false);
      setModalOpen(false);
      setSuccessToast(`Plan '${selectedPlan.title}' successfully pushed to optimization queue! Execution SLA SLA < 2 min is active.`);
      setTimeout(() => setSuccessToast(null), 5000);
    }, 1800);
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
            <a href="/analytics" className="text-slate-400 hover:text-slate-200 transition">Analytics Forecast</a>
            <a href="/plans" className="text-white border-b-2 border-blue-500 pb-4 pt-1">Execution Hub</a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400 font-semibold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Broker API: Ready</span>
          </span>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fadeIn">
        
        {/* Header */}
        <div className="space-y-2">
          <a href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 flex items-center space-x-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to command center</span>
          </a>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Execution Hub</h1>
          <p className="text-sm text-slate-400">
            Autonomous portfolio purchasing queue. Review, approve, and execute greedy-forecast reservation plans.
          </p>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-955 border border-emerald-900 bg-emerald-950/20 text-emerald-300 p-4 rounded-xl flex items-center justify-between shadow-xl animate-slideIn">
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-200 pl-4">Dismiss</button>
          </div>
        )}

        {/* Plans Roster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-md hover:border-slate-700 transition">
              
              {/* Card Top */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    plan.status === "PENDING APPROVAL" ? "bg-amber-950/20 border-amber-900/30 text-amber-400" :
                    plan.status === "APPROVED" ? "bg-blue-950/20 border-blue-900/30 text-blue-400" :
                    "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
                  }`}>
                    {plan.status === "PENDING APPROVAL" && <Clock className="w-3 h-3 mr-1" />}
                    {plan.status === "APPROVED" && <Zap className="w-3 h-3 mr-1" />}
                    {plan.status === "EXECUTED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    <span>{plan.status}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{plan.created}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">{plan.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1">
                    <span>Account:</span>
                    <span className="font-semibold text-slate-300">{plan.accountName}</span>
                  </p>
                </div>
              </div>

              {/* Savings Stats */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Upfront Capital</p>
                  <p className="text-sm font-bold text-slate-200 font-mono">{plan.upfront}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Monthly Savings</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono">+{plan.monthlySavings}</p>
                </div>
              </div>

              {/* Card Bottom CTA */}
              <div className="pt-2">
                {plan.status === "PENDING APPROVAL" ? (
                  <button 
                    onClick={() => handleOpenApproveModal(plan.id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-lg shadow-blue-950/30"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Approve & Execute</span>
                  </button>
                ) : (
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-center text-xs font-semibold text-slate-400 flex items-center justify-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{plan.status === "APPROVED" ? "Queued for immediate Broker SLA" : "Optimized & Active"}</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Modal: ConfirmPurchaseModal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-scaleIn relative">
              
              {/* Top Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-xs uppercase font-extrabold text-blue-400 tracking-widest">Pre-Purchase Portfolio Verification</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white">{selectedPlan.title}</h2>
                <p className="text-xs text-slate-400">Reviewing automated broker parameters for <strong>{selectedPlan.accountName}</strong> before committing.</p>
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-5 rounded-lg border border-slate-800 text-center">
                <div className="space-y-1">
                  <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Upfront Capital Cost</p>
                  <p className="text-2xl font-bold text-slate-200 font-mono">{selectedPlan.upfront}</p>
                </div>
                <div className="space-y-1 border-l border-slate-800">
                  <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Calculated Monthly Savings</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">+{selectedPlan.monthlySavings}</p>
                </div>
              </div>

              {/* Recommendation Breakdown Table */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recommended RI Inventory Breakdown</p>
                <div className="border border-slate-800 rounded-lg overflow-hidden max-h-[180px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="p-3">Compute Instance Type</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-center">Discount</th>
                        <th className="p-3 text-right">Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedPlan.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-3">
                            <p className="font-semibold text-slate-200">{item.instance}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{item.region} • {item.term}</p>
                          </td>
                          <td className="p-3 text-center font-mono font-medium text-slate-300">{item.qty}</td>
                          <td className="p-3 text-center font-semibold text-blue-400 font-mono">{item.discount}</td>
                          <td className="p-3 text-right font-bold text-emerald-400 font-mono">{item.savings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>By executing, you authorise ReserveIQ's broker queue to automatically secure no-upfront reservations using our greedy bin-packing algorithm.</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={executing}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-950 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveAndExecute}
                  disabled={executing}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-xs font-bold text-white transition flex items-center space-x-1.5 shadow-lg shadow-blue-950/40"
                >
                  {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>{executing ? "Deploying queue..." : "Approve & Execute Plan"}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
