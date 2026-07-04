/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, Fragment } from "react";
import {
  MOCK_DATES,
  MOCK_BAY_TYPES,
  initialServiceBayCells,
  MOCK_FORECAST_DATA,
  initialUsedBoats,
  StorageClasses,
  initialPendingLaunches,
  initialRenewalContracts,
  ServiceBayCell,
  UsedBoat,
  PendingLaunch,
  RenewalContract,
  StorageClassRate
} from "./mockData";
import {
  Ship,
  Anchor,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUp,
  ArrowDown,
  Play,
  Check,
  X,
  SlidersHorizontal,
  AlertCircle,
  Filter,
  Clock,
  ArrowUpDown,
  Wrench
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Toast Notification Interface
interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

export default function App() {
  // Navigation State
  const [activeModule, setActiveModule] = useState<
    "service" | "inventory" | "storage" | "renewal"
  >("service");

  // Location selector state
  const [selectedLocation, setSelectedLocation] = useState<string>("Northeast Yard - Kennebunkport, ME");

  // Global Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ==========================================
  // MODULE 1: SERVICE BAY YIELD STATE & LOGIC
  // ==========================================
  const [serviceCells, setServiceCells] = useState<ServiceBayCell[]>(initialServiceBayCells);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [isSlotDrawerOpen, setIsSlotDrawerOpen] = useState(false);
  const [customPriceValue, setCustomPriceValue] = useState<number>(0);

  // Forecast Chart Toggle States
  const [activeJobCodes, setActiveJobCodes] = useState({
    "ENG-MAINT": true,
    "FIBER-REP": true,
    "RIG-REPAIR": true,
    "ELEC-DIAG": true,
    "GEN-SERVICE": true,
  });

  const selectedCell = useMemo(() => {
    return serviceCells.find((c) => c.id === selectedCellId) || null;
  }, [serviceCells, selectedCellId]);

  const handleCellClick = (cell: ServiceBayCell) => {
    setSelectedCellId(cell.id);
    setCustomPriceValue(cell.recommendedPrice);
    setIsSlotDrawerOpen(true);
  };

  const handleAcceptPrice = (cellId: string, finalPrice: number) => {
    setServiceCells((prev) =>
      prev.map((c) => (c.id === cellId ? { ...c, recommendedPrice: finalPrice, isAccepted: true } : c))
    );
    const updatedCell = serviceCells.find((c) => c.id === cellId);
    if (updatedCell) {
      const bayName = MOCK_BAY_TYPES.find((b) => b.key === updatedCell.bayType)?.label || "Service Bay";
      addToast(
        `Price of $${finalPrice}/hr synced to Service Management for ${bayName} on ${updatedCell.dayName}.`,
        "success"
      );
    }
    setIsSlotDrawerOpen(false);
  };

  const pendingServiceSyncsCount = useMemo(() => {
    return serviceCells.filter((c) => !c.isAccepted).length;
  }, [serviceCells]);

  // ==========================================
  // MODULE 2: USED BOAT INVENTORY STATE & LOGIC
  // ==========================================
  const [usedBoats, setUsedBoats] = useState<UsedBoat[]>(initialUsedBoats);
  const [boatSearch, setBoatSearch] = useState("");
  const [boatFilterMarkdown, setBoatFilterMarkdown] = useState(false);
  const [boatSortKey, setBoatSortKey] = useState<"daysOnLot" | "recommendedPrice" | "confidenceScore">("daysOnLot");
  const [boatSortOrder, setBoatSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedBoatId, setExpandedBoatId] = useState<string | null>(null);

  const filteredBoats = useMemo(() => {
    return usedBoats
      .filter((boat) => {
        const matchesSearch =
          boat.make.toLowerCase().includes(boatSearch.toLowerCase()) ||
          boat.model.toLowerCase().includes(boatSearch.toLowerCase());
        const matchesMarkdown = !boatFilterMarkdown || boat.markdownFlag;
        return matchesSearch && matchesMarkdown;
      })
      .sort((a, b) => {
        let valA = a[boatSortKey];
        let valB = b[boatSortKey];
        if (typeof valA === "boolean") return 0;
        if (valA < valB) return boatSortOrder === "asc" ? -1 : 1;
        if (valA > valB) return boatSortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [usedBoats, boatSearch, boatFilterMarkdown, boatSortKey, boatSortOrder]);

  const handleApplyBoatPrice = (boat: UsedBoat) => {
    setUsedBoats((prev) =>
      prev.map((b) => (b.id === boat.id ? { ...b, currentPrice: b.recommendedPrice } : b))
    );
    addToast(
      `Price adjusted to $${boat.recommendedPrice.toLocaleString()} for ${boat.year} ${boat.make} ${boat.model}.`,
      "success"
    );
  };

  const totalBookValue = useMemo(() => {
    return usedBoats.reduce((acc, b) => acc + b.currentPrice, 0);
  }, [usedBoats]);

  const markdownCount = useMemo(() => {
    return usedBoats.filter((b) => b.markdownFlag).length;
  }, [usedBoats]);

  // ==========================================
  // MODULE 3: STORAGE & DRY STACK STATE & LOGIC
  // ==========================================
  // Rates calendar selection
  const [selectedStorageClassId, setSelectedStorageClassId] = useState<string>("sc-1");
  const [selectedMonthName, setSelectedMonthName] = useState<string>("Oct");

  const selectedRateDetail = useMemo(() => {
    const sClass = StorageClasses.find((sc) => sc.id === selectedStorageClassId);
    if (!sClass) return null;
    const rateMonth = sClass.ratesByMonth.find((r) => r.month === selectedMonthName);
    return rateMonth ? { className: sClass.className, unit: sClass.unit, ...rateMonth } : null;
  }, [selectedStorageClassId, selectedMonthName]);

  // Launch Queue Optimizer
  const [launchQueue, setLaunchQueue] = useState<PendingLaunch[]>(initialPendingLaunches);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isQueueOptimized, setIsQueueOptimized] = useState(false);

  const handleMoveQueueItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === launchQueue.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...launchQueue];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Reset currentOrder sequential indices
    const finalized = updated.map((item, idx) => ({ ...item, currentOrder: idx + 1 }));
    setLaunchQueue(finalized);
    setIsQueueOptimized(false);
  };

  const handleOptimizeQueue = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Sort based on their designated pre-calculated optimized order
      const optimized = [...launchQueue].sort((a, b) => a.optimizedOrder - b.optimizedOrder);
      const finalized = optimized.map((item, idx) => ({
        ...item,
        currentOrder: idx + 1
      }));
      setLaunchQueue(finalized);
      setIsOptimizing(false);
      setIsQueueOptimized(true);
      addToast(
        "Launch schedule optimized successfully! Lift, tractor, and staging conflicts cleared.",
        "success"
      );
    }, 850);
  };

  const handleResetQueue = () => {
    const reset = [...initialPendingLaunches].sort((a, b) => a.currentOrder - b.currentOrder);
    setLaunchQueue(reset);
    setIsQueueOptimized(false);
    addToast("Launch queue reset to original scheduled sequence.", "info");
  };

  // ==========================================
  // MODULE 4: CONTRACT RENEWAL STATE & LOGIC
  // ==========================================
  const [renewalContracts, setRenewalContracts] = useState<RenewalContract[]>(initialRenewalContracts);
  const [renewalSearch, setRenewalSearch] = useState("");
  const [renewalRiskFilter, setRenewalRiskFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [acceptedContracts, setAcceptedContracts] = useState<Record<string, boolean>>({});

  const filteredContracts = useMemo(() => {
    // Already sorted by Churn Risk Descending in mockData (High, Medium, Low)
    return renewalContracts.filter((contract) => {
      const matchesSearch =
        contract.tenant.toLowerCase().includes(renewalSearch.toLowerCase()) ||
        contract.boatName.toLowerCase().includes(renewalSearch.toLowerCase());
      const matchesRisk = renewalRiskFilter === "All" || contract.churnRisk === renewalRiskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [renewalContracts, renewalSearch, renewalRiskFilter]);

  const handleSendRenewalOffer = (contract: RenewalContract) => {
    setAcceptedContracts((prev) => ({ ...prev, [contract.id]: true }));
    addToast(
      `Renewal offer for $${contract.recommendedRate.toLocaleString()} sent to ${contract.tenant}. Status: Pending Signature.`,
      "success"
    );
  };

  const handleAcceptAllRenewals = () => {
    const pending = filteredContracts.filter((c) => !acceptedContracts[c.id]);
    if (pending.length === 0) {
      addToast("No pending renewal offers left to send in current filtered list.", "info");
      return;
    }
    const newAccepted = { ...acceptedContracts };
    pending.forEach((c) => {
      newAccepted[c.id] = true;
    });
    setAcceptedContracts(newAccepted);
    addToast(`Successfully batch-sent ${pending.length} contract renewal proposals.`, "success");
  };

  const highRiskCount = useMemo(() => {
    return renewalContracts.filter((c) => c.churnRisk === "High").length;
  }, [renewalContracts]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative antialiased text-slate-800 selection:bg-sky-200">
      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex items-start gap-3 animate-slide-in"
          >
            {toast.type === "success" ? (
              <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : toast.type === "warning" ? (
              <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-1 rounded-lg bg-sky-50 text-sky-600">
                <Info className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden h-screen bg-[#F8FAFC]">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-[#002147] text-slate-300 flex flex-col shrink-0 border-r border-white/10">
          {/* Logo Brand Area */}
          <div className="flex h-16 items-center border-b border-white/10 px-6 gap-3 shrink-0">
            <div className="h-6 w-6 rounded bg-cyan-500 shrink-0 flex items-center justify-center text-white p-1">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white font-display">DockMaster RM</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 text-sm font-medium overflow-y-auto">
            {/* Service Bay Yield */}
            <button
              id="nav-module-service"
              onClick={() => setActiveModule("service")}
              className={`w-full flex items-center gap-3 rounded-md p-3 transition-all text-left group cursor-pointer ${
                activeModule === "service"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wrench className="w-4.5 h-4.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate leading-tight">Service Bay Yield</p>
              </div>
              {pendingServiceSyncsCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeModule === "service" ? "bg-cyan-500 text-white" : "bg-cyan-500/25 text-cyan-300"
                }`}>
                  {pendingServiceSyncsCount}
                </span>
              )}
            </button>

            {/* Used Boat Pricing */}
            <button
              id="nav-module-inventory"
              onClick={() => setActiveModule("inventory")}
              className={`w-full flex items-center gap-3 rounded-md p-3 transition-all text-left group cursor-pointer ${
                activeModule === "inventory"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Ship className="w-4.5 h-4.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate leading-tight">Used Boat Inventory</p>
              </div>
              {markdownCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeModule === "inventory" ? "bg-amber-500 text-slate-950" : "bg-amber-500/25 text-amber-300"
                }`}>
                  {markdownCount}
                </span>
              )}
            </button>

            {/* Storage and Dry Stack */}
            <button
              id="nav-module-storage"
              onClick={() => setActiveModule("storage")}
              className={`w-full flex items-center gap-3 rounded-md p-3 transition-all text-left group cursor-pointer ${
                activeModule === "storage"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4.5 h-4.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate leading-tight">Storage & Dry Stack</p>
              </div>
              <span className="text-[10px] font-bold bg-white/5 text-slate-300 px-2 py-0.5 rounded-full">
                12m
              </span>
            </button>

            {/* Renewal Pricing */}
            <button
              id="nav-module-renewal"
              onClick={() => setActiveModule("renewal")}
              className={`w-full flex items-center gap-3 rounded-md p-3 transition-all text-left group cursor-pointer ${
                activeModule === "renewal"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <RefreshCw className="w-4.5 h-4.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate leading-tight">Renewal Pricing</p>
              </div>
              {highRiskCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeModule === "renewal" ? "bg-rose-500 text-white" : "bg-rose-500/25 text-rose-300"
                }`}>
                  {highRiskCount}
                </span>
              )}
            </button>
          </nav>

          {/* Sidebar Operational Summary Stats */}
          <div className="p-4 border-t border-white/10 text-[11px] text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Operational Yard:</span>
              <span className="text-slate-200 font-medium">NE-1</span>
            </div>
            <div className="flex justify-between">
              <span>Average Occupancy:</span>
              <span className="text-cyan-400 font-mono font-semibold">86.2%</span>
            </div>
            <div className="flex justify-between">
              <span>Water Temp:</span>
              <span className="text-slate-200">68°F</span>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="border-t border-white/10 p-4 bg-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-500 text-white font-bold flex items-center justify-center font-display text-xs">
                HE
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Harbor Master Ed</p>
                <p className="text-[10px] opacity-60">Annapolis Marina</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN BODY WINDOW */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* HEADER TOP BAR */}
          {/* HEADER TOP BAR */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shrink-0 shadow-xs">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold font-display text-slate-800 tracking-tight">
                {activeModule === "service" && "Service Bay Yield"}
                {activeModule === "inventory" && "Used Boat Inventory"}
                {activeModule === "storage" && "Storage & Dry Stack"}
                {activeModule === "renewal" && "Renewal Pricing"}
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 font-sans">
                {activeModule === "service" && "Oct 12 — Oct 25"}
                {activeModule === "inventory" && "Current Season Comps"}
                {activeModule === "storage" && "Annual Dynamic Tariffs"}
                {activeModule === "renewal" && "30-Day Expiry Runway"}
              </span>
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-3">
              <div className="text-right flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Active Branch:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
                >
                  <option>Northeast Yard - Kennebunkport, ME</option>
                  <option>Mid-Atlantic Yard - Annapolis, MD</option>
                  <option>Southern Facility - Fort Lauderdale, FL</option>
                </select>
              </div>
            </div>
          </header>

          {/* CONTENT ACCORDING TO NAVIGATION */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#F8FAFC]">

            {/* ========================================== */}
            {/* MODULE 1: SERVICE BAY YIELD VIEW          */}
            {/* ========================================== */}
            {activeModule === "service" && (
              <div className="space-y-6">
                {/* Introduction & Highlights Banner */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5 max-w-2xl">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 font-display">Dynamic 14-Day Service Scheduling Board</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Optimize repair slot revenue based on diagnostic urgency, current bay occupancy limits, seasonal cruising demand spikes, and technician specialization matches.
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center min-w-28 shadow-2xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unaccepted Slots</p>
                      <p className="text-xl font-bold font-mono text-cyan-600 mt-1">{pendingServiceSyncsCount}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center min-w-28 shadow-2xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Rate</p>
                      <p className="text-xl font-bold font-mono text-cyan-600 mt-1">$194.20/hr</p>
                    </div>
                  </div>
                </div>

                {/* Grid Board Header */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 font-display">14-Day Yield Board Grid</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Select an active service block cell below to inspect demand rationales and sync dynamic recommendations.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3.5 text-[10px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500/10 border border-emerald-300 rounded-full"></span>
                        <span>Low / Med occupancy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500/10 border border-amber-300 rounded-full"></span>
                        <span>High occupancy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-rose-500/10 border border-rose-300 rounded-full"></span>
                        <span>Fully saturated</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Grid Board */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/20 text-slate-500 text-[10px] font-bold tracking-wider uppercase text-left">
                          <th className="p-3 sticky left-0 bg-white border-r border-slate-200/60 shadow-[2px_0_5px_rgba(0,0,0,0.01)] z-10 font-bold text-slate-700">
                            Service Bay Category
                          </th>
                          {MOCK_DATES.map((d) => {
                            const isWeekend = d.isWeekend;
                            const dateNum = d.date.split("-")[2];
                            const isCyanHeading = dateNum === "20";
                            const isAmberHeading = dateNum === "23";
                            let headingColorClass = "text-slate-500";
                            if (isCyanHeading) headingColorClass = "text-cyan-600 font-bold underline decoration-2 underline-offset-4";
                            else if (isAmberHeading) headingColorClass = "text-amber-600 font-semibold";

                            return (
                              <th
                                key={d.date}
                                className={`p-3 text-center min-w-28 border-l border-slate-100 text-[10px] font-bold uppercase tracking-wider ${headingColorClass} ${
                                  isWeekend ? "bg-slate-100/40" : ""
                                }`}
                              >
                                <p className="text-[10px] font-bold font-sans tracking-wide">{d.dayLabel}</p>
                                <p className="text-[11px] font-mono mt-0.5 opacity-80">{dateNum}</p>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {MOCK_BAY_TYPES.map((bay) => {
                          const cellsForBay = serviceCells.filter((c) => c.bayType === bay.key);
                          return (
                            <tr key={bay.key} className="hover:bg-slate-50/30 transition-colors">
                              {/* Left Sticky Header */}
                              <td className="p-3 sticky left-0 bg-slate-50 font-bold border-r border-slate-200/60 shadow-[2px_0_5px_rgba(0,0,0,0.01)] z-10 min-w-60 text-[11px] text-slate-700">
                                <p className="font-display uppercase tracking-wider">{bay.label}</p>
                                <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-400">
                                  <span>Base:</span>
                                  <span className="font-semibold text-slate-500">${bay.baseRate}/hr</span>
                                </div>
                              </td>

                              {/* Day Columns Cells */}
                              {MOCK_DATES.map((dateObj) => {
                                const cell = cellsForBay.find((c) => c.date === dateObj.date);
                                if (!cell) return <td key={dateObj.date} className="p-3 text-center text-slate-300 border-l border-slate-100">-</td>;

                                const isCellAccepted = cell.isAccepted;

                                // Occupancy Color and visual indicator settings matching theme
                                let cellBgClass = "hover:bg-slate-50";
                                let textClass = "text-slate-800";
                                let ringClass = "border-slate-100";
                                
                                const progressBg = cell.occupancy >= 95 ? "bg-rose-500" : cell.occupancy >= 75 ? "bg-amber-500" : "bg-green-500";
                                const progressTrack = cell.occupancy >= 95 ? "bg-rose-500/20" : cell.occupancy >= 75 ? "bg-amber-500/20" : "bg-green-500/20";

                                // Selected slot highlights
                                const isCustomSelected = selectedCellId === cell.id;

                                if (isCustomSelected) {
                                  cellBgClass = "bg-cyan-50/50";
                                  textClass = "text-cyan-700";
                                  ringClass = "ring-1 ring-inset ring-cyan-200 border-transparent";
                                } else if (cell.occupancy >= 95) {
                                  cellBgClass = "bg-rose-50/30";
                                  textClass = "text-rose-700";
                                  ringClass = "border-rose-100";
                                } else if (cell.occupancy >= 75) {
                                  cellBgClass = "bg-cyan-500/10";
                                  textClass = "text-cyan-700";
                                  ringClass = "border-cyan-100";
                                }

                                return (
                                  <td
                                    key={cell.id}
                                    onClick={() => handleCellClick(cell)}
                                    className={`p-2 text-center border-l border-slate-100 transition-all cursor-pointer relative ${cellBgClass} ${ringClass} ${
                                      isCellAccepted ? "opacity-60 bg-slate-50" : ""
                                    }`}
                                  >
                                    <div className="p-2 text-center select-none">
                                      <div className={`text-[12px] font-mono font-bold ${isCellAccepted ? "text-slate-400 line-through" : textClass}`}>
                                        ${cell.recommendedPrice}
                                      </div>
                                      {/* Dynamic progress bar under the price */}
                                      <div className={`h-1 w-full mt-1.5 rounded-full ${isCellAccepted ? "bg-slate-200" : progressTrack}`}>
                                        <div
                                          className={`h-full rounded-full ${isCellAccepted ? "bg-slate-300" : progressBg}`}
                                          style={{ width: `${Math.min(100, cell.occupancy)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Slot Detail Drawer / Sidebar Panel */}
                {isSlotDrawerOpen && selectedCell && (
                  <div className="bg-slate-900 text-white rounded-xl border-l-4 border-cyan-500 p-6 shadow-xl relative animate-fade-in">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                            Slot Detail: {selectedCell.dayName.split(",")[0]}
                          </span>
                          <span className="text-white/20">|</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: US-{selectedCell.id.substring(0, 5)}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold font-display mt-1 text-white">
                          {MOCK_BAY_TYPES.find((b) => b.key === selectedCell.bayType)?.label}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Target Date: {selectedCell.dayName}</p>
                      </div>
                      <button
                        onClick={() => setIsSlotDrawerOpen(false)}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Price Tweaker Section */}
                      <div className="lg:col-span-4 space-y-5">
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recommended Price</p>
                          <div className="flex items-baseline gap-1 mt-1.5">
                            <span className="text-3xl font-extrabold font-mono text-white">${selectedCell.recommendedPrice}.00</span>
                            <span className="text-slate-400 text-xs">/ hr</span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
                            <div className="flex justify-between">
                              <span>95% Confidence Band:</span>
                              <span className="font-mono font-medium text-slate-200">
                                ${selectedCell.minConfidence} - ${selectedCell.maxConfidence}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Slot Occupancy:</span>
                              <span className="font-mono font-medium text-slate-200">{selectedCell.occupancy}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Override Adjusted Rate ($/hr)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={selectedCell.minConfidence - 10}
                              max={selectedCell.maxConfidence + 10}
                              value={customPriceValue}
                              onChange={(e) => setCustomPriceValue(parseInt(e.target.value))}
                              className="flex-1 accent-cyan-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                            />
                            <span className="w-16 text-center font-mono font-bold text-sm bg-white/5 py-1.5 px-2 rounded border border-white/10 text-cyan-400">
                              ${customPriceValue}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Floor: ${selectedCell.minConfidence - 10}</span>
                            <span>Ceiling: ${selectedCell.maxConfidence + 10}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleAcceptPrice(selectedCell.id, customPriceValue)}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-lg uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-slate-950" />
                            Accept Pricing
                          </button>
                          <button
                            onClick={() => {
                              setCustomPriceValue(selectedCell.recommendedPrice);
                              addToast("Rate restored to AI recommended defaults.", "info");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-3 px-4 rounded-lg transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* AI Reasoning Section */}
                      <div className="lg:col-span-8 space-y-6 border-l border-white/5 pl-0 lg:pl-8">
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Why this price (Drivers)</h5>
                          <div className="space-y-4">
                            {selectedCell.drivers.map((driver, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-slate-200">{driver.label}</span>
                                  <span className="font-mono font-bold text-cyan-400">
                                    {driver.impact === "positive" ? "+" : "-"}{driver.value}%
                                  </span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${driver.value}%` }}
                                    className="h-full rounded-full transition-all bg-white"
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Strategy Insight</p>
                              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                {selectedCell.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Demand Forecast Chart Panel */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 font-display">30-Day Forward Labor Demand Forecast</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Predicts combined repair technician work hours required across the 5 core mechanic job codes, showing 95% total confidence bands.
                      </p>
                    </div>

                    {/* Job Code Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Plot Job Code:</span>
                      {Object.keys(activeJobCodes).map((code) => (
                        <button
                          key={code}
                          onClick={() =>
                            setActiveJobCodes((prev) => ({
                              ...prev,
                              [code as keyof typeof activeJobCodes]: !prev[code as keyof typeof activeJobCodes],
                            }))
                          }
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                            activeJobCodes[code as keyof typeof activeJobCodes]
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                            code === "ENG-MAINT" ? "bg-sky-500" :
                            code === "FIBER-REP" ? "bg-emerald-500" :
                            code === "RIG-REPAIR" ? "bg-indigo-500" :
                            code === "ELEC-DIAG" ? "bg-amber-500" : "bg-purple-500"
                          }`} />
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recharts Chart */}
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={MOCK_FORECAST_DATA}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          stroke="#94a3b8"
                          fontSize={11}
                          dy={10}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          stroke="#94a3b8"
                          fontSize={11}
                          dx={-10}
                          label={{ value: "Technician Hours", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#94a3b8", fontSize: 11, dy: -10 } }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                          labelStyle={{ fontWeight: "600", color: "#0f172a", fontSize: "12px" }}
                          itemStyle={{ fontSize: "11px", padding: "1px 0" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }} />

                        {/* Shaded Area for Aggregate Confidence Interval */}
                        <Area
                          name="95% Confidence Band"
                          dataKey="confidenceUpper"
                          stroke="none"
                          fill="url(#colorConfidence)"
                          fillOpacity={1}
                        />
                        <Area
                          name=""
                          dataKey="confidenceLower"
                          stroke="none"
                          fill="#f8fafc"
                          fillOpacity={1}
                        />

                        {/* Capacity Limit Line */}
                        <Line
                          name="Max Yard Capacity (160h)"
                          type="monotone"
                          dataKey="capacityLimit"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          dot={false}
                        />

                        {/* Aggregated Total Line */}
                        <Line
                          name="Aggregated Demand Forecast"
                          type="monotone"
                          dataKey="totalForecast"
                          stroke="#0284c7"
                          strokeWidth={3}
                          dot={false}
                        />

                        {/* Individual Job Code Lines conditionally mapped */}
                        {activeJobCodes["ENG-MAINT"] && (
                          <Line
                            name="ENG-MAINT (Mechanical)"
                            type="monotone"
                            dataKey="ENG-MAINT"
                            stroke="#38bdf8"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        )}
                        {activeJobCodes["FIBER-REP"] && (
                          <Line
                            name="FIBER-REP (Fiberglass)"
                            type="monotone"
                            dataKey="FIBER-REP"
                            stroke="#34d399"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        )}
                        {activeJobCodes["RIG-REPAIR"] && (
                          <Line
                            name="RIG-REPAIR (Rigging)"
                            type="monotone"
                            dataKey="RIG-REPAIR"
                            stroke="#818cf8"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        )}
                        {activeJobCodes["ELEC-DIAG"] && (
                          <Line
                            name="ELEC-DIAG (Electrical)"
                            type="monotone"
                            dataKey="ELEC-DIAG"
                            stroke="#fbbf24"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        )}
                        {activeJobCodes["GEN-SERVICE"] && (
                          <Line
                            name="GEN-SERVICE (General)"
                            type="monotone"
                            dataKey="GEN-SERVICE"
                            stroke="#c084fc"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-cyan-50/20 rounded-xl p-4 border border-cyan-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <p className="text-slate-600 max-w-2xl leading-relaxed">
                      💡 <strong>Plain Language Forecast Rationale:</strong> The demand spikes visible around mid-month are driven by historical holiday labor factors and scheduled outboard engine refit contracts. Active summer weather trends are boosting general recreational boat usage, increasing non-scheduled diagnostics workload.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* MODULE 2: USED BOAT INVENTORY PRICING     */}
            {/* ========================================== */}
            {activeModule === "inventory" && (
              <div className="space-y-6">
                {/* Introduction & Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-600">
                      <Ship className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Used Fleet</p>
                      <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">{usedBoats.length} Vessels</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Average lot cycle: 51 days</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Inventory Value</p>
                      <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">${totalBookValue.toLocaleString()}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Dealer capital cost: 8.5% apr</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-700">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recommended Markdowns</p>
                      <h3 className="text-2xl font-bold font-mono text-cyan-700 mt-1">{markdownCount} Boats</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Overdue lot tenure warning active</p>
                    </div>
                  </div>
                </div>

                {/* Filter and Table Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Search and Filters Bar */}
                  <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search used inventory (e.g. Grady-White, Whaler)..."
                        value={boatSearch}
                        onChange={(e) => setBoatSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* Markdown Filter Checkbox */}
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={boatFilterMarkdown}
                          onChange={(e) => setBoatFilterMarkdown(e.target.checked)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span>Show Markdowns Only</span>
                      </label>

                      {/* Divider */}
                      <span className="h-5 w-px bg-slate-200 hidden sm:inline"></span>

                      {/* Sort dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sort:</span>
                        <select
                          value={boatSortKey}
                          onChange={(e) => setBoatSortKey(e.target.value as any)}
                          className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="daysOnLot">Days on Lot</option>
                          <option value="recommendedPrice">Recommended Price</option>
                          <option value="confidenceScore">Confidence Score</option>
                        </select>
                        <button
                          onClick={() => setBoatSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                          className="p-1.5 border border-slate-200 bg-white rounded-md hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
                          title="Toggle sort direction"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Boats Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                          <th className="p-3 pl-6">Used Vessel Specs</th>
                          <th className="p-3 text-center">Days on Lot</th>
                          <th className="p-3 text-right">Current Price</th>
                          <th className="p-3 text-right">Dynamic Rec.</th>
                          <th className="p-3 text-center">Confidence Score</th>
                          <th className="p-3 text-center">Action Flag</th>
                          <th className="p-3 pr-6 text-center">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredBoats.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-slate-400">
                              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                              <p className="text-sm font-medium">No matching used boats found in inventory.</p>
                              <p className="text-xs text-slate-400 mt-1">Try resetting your search filter or markdown toggle.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredBoats.map((boat) => {
                            const isExpanded = expandedBoatId === boat.id;
                            const isAccepted = boat.currentPrice === boat.recommendedPrice;

                            // Days on Lot indicator coloring
                            let lotColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                            if (boat.daysOnLot >= 90) {
                              lotColor = "text-rose-700 bg-rose-50 border-rose-100";
                            } else if (boat.daysOnLot >= 60) {
                              lotColor = "text-amber-700 bg-amber-50 border-amber-100";
                            }

                            return (
                              <Fragment key={boat.id}>
                                <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? "bg-slate-50/30" : ""}`}>
                                  {/* Vessel Specs */}
                                  <td className="p-3 pl-6 font-medium text-slate-950">
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0">
                                        <Ship className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-900 font-display">
                                          {boat.make} {boat.model}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Year: {boat.year} | Inventory ID: US-{boat.id.split("-")[1]}</p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Days on Lot */}
                                  <td className="p-3 text-center">
                                    <span className={`inline-block font-mono font-bold px-2.5 py-1 rounded-full border text-[11px] ${lotColor}`}>
                                      {boat.daysOnLot} days
                                    </span>
                                  </td>

                                  {/* Current Price */}
                                  <td className="p-3 text-right font-mono font-medium text-slate-600 text-sm">
                                    ${boat.currentPrice.toLocaleString()}
                                  </td>

                                  {/* Recommended Dynamic Price */}
                                  <td className="p-3 text-right">
                                    <p className={`font-mono font-bold text-sm ${
                                      isAccepted ? "text-slate-400 line-through" :
                                      boat.markdownFlag ? "text-rose-600" : "text-cyan-700"
                                    }`}>
                                      ${boat.recommendedPrice.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                      Range: ${boat.confidenceMin.toLocaleString()} - ${boat.confidenceMax.toLocaleString()}
                                    </p>
                                  </td>

                                  {/* Confidence Score Bar */}
                                  <td className="p-3 text-center">
                                    <div className="inline-flex flex-col items-center gap-1">
                                      <span className="font-mono text-[11px] font-bold text-slate-800">
                                        {boat.confidenceScore}%
                                      </span>
                                      <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                                        <div
                                          style={{ width: `${boat.confidenceScore}%` }}
                                          className={`h-full rounded-full ${
                                            boat.confidenceScore >= 90 ? "bg-emerald-500" : "bg-cyan-500"
                                          }`}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Action Flag */}
                                  <td className="p-3 text-center">
                                    {isAccepted ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-1 rounded-md">
                                        <Check className="w-3 h-3" />
                                        Applied
                                      </span>
                                    ) : boat.markdownFlag ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-semibold px-2 py-1 rounded-md">
                                        Markdown Rec
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-100 font-semibold px-2 py-1 rounded-md">
                                        Hold / Markup
                                      </span>
                                    )}
                                  </td>

                                  {/* Review and Expand */}
                                  <td className="p-3 pr-6 text-center">
                                    <button
                                      onClick={() => setExpandedBoatId(isExpanded ? null : boat.id)}
                                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                      title="Review rationale comps"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5" />
                                      )}
                                    </button>
                                  </td>
                                </tr>

                                {/* Expanded Rationale Row */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/50 border-t border-slate-100">
                                    <td colSpan={7} className="p-6 pl-14">
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        {/* Market Comp Stats */}
                                        <div className="md:col-span-4 space-y-4">
                                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dealer Comp Baseline</h5>
                                          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3 shadow-2xs">
                                            <div className="flex justify-between items-center text-xs">
                                              <span className="text-slate-500 font-medium">Local Comps Avg:</span>
                                              <span className="font-mono font-bold text-slate-900">
                                                ${boat.compsAverage.toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="space-y-1.5">
                                              <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium">Local Market Demand:</span>
                                                <span className="font-mono font-bold text-slate-900">
                                                  {boat.localDemandIndex} / 10
                                                </span>
                                              </div>
                                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                  style={{ width: `${boat.localDemandIndex * 10}%` }}
                                                  className={`h-full rounded-full ${
                                                    boat.localDemandIndex >= 7 ? "bg-emerald-500" :
                                                    boat.localDemandIndex >= 4 ? "bg-amber-500" : "bg-rose-500"
                                                  }`}
                                                ></div>
                                              </div>
                                              <p className="text-[9px] text-slate-400 mt-1">
                                                {boat.localDemandIndex >= 7 ? "Fast moving summer listing class" :
                                                 boat.localDemandIndex >= 4 ? "Standard mid-season volume" : "Saturated regional boat inventory"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Plain Language Rationale Explanation */}
                                        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                                          <div>
                                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">AI Pricing Rationale</h5>
                                            <p className="text-xs text-slate-600 leading-relaxed bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
                                              {boat.rationale}
                                            </p>
                                          </div>

                                          <div className="flex items-center justify-end gap-3 pt-2">
                                            <button
                                              onClick={() => setExpandedBoatId(null)}
                                              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                              Close Rationale
                                            </button>
                                            {!isAccepted && (
                                              <button
                                                onClick={() => handleApplyBoatPrice(boat)}
                                                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs px-4 py-2 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                              >
                                                <Check className="w-4 h-4" />
                                                Apply Recommended Price
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* MODULE 3: STORAGE AND DRY STACK YIELD     */}
            {/* ========================================== */}
            {activeModule === "storage" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Rates Calendar - Left 12-Month Area */}
                <div className="xl:col-span-7 space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 font-display">12-Month Dynamic Storage Rates Calendar</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Select a specific month-class block inside the pricing matrix to inspect its detailed winterization or summer layover strategy.
                      </p>
                    </div>

                    {/* Rates matrix Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="p-3 text-left">Storage Class</th>
                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                              <th key={m} className="p-3 text-center min-w-14">{m}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {StorageClasses.map((sc) => (
                            <tr key={sc.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-semibold text-slate-950 min-w-44">
                                <p className="font-display font-bold">{sc.className}</p>
                                <span className="text-[9px] text-slate-400 font-mono font-medium lowercase">({sc.unit})</span>
                              </td>
                              {sc.ratesByMonth.map((rateMonth) => {
                                const isSelected = selectedStorageClassId === sc.id && selectedMonthName === rateMonth.month;
                                return (
                                  <td
                                    key={rateMonth.month}
                                    onClick={() => {
                                      setSelectedStorageClassId(sc.id);
                                      setSelectedMonthName(rateMonth.month);
                                    }}
                                    className={`p-2.5 text-center cursor-pointer font-mono font-bold transition-all relative ${
                                      isSelected
                                        ? "bg-cyan-600 text-white shadow-inner scale-102 z-10 rounded-md"
                                        : "hover:bg-slate-100 text-slate-800"
                                    }`}
                                  >
                                    ${rateMonth.rate}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Rationale Card for the selected Rate Block */}
                    {selectedRateDetail && (
                      <div className="bg-cyan-50/20 rounded-xl p-5 border border-cyan-100 space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-cyan-800 tracking-wider bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                              Selected Calendar Strategy
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 font-display mt-1">
                              {selectedRateDetail.className} | {selectedMonthName} Recommendation
                            </h4>
                          </div>

                          <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Rate Target</p>
                            <p className="text-sm font-mono font-bold text-cyan-700">
                              ${selectedRateDetail.rate} <span className="text-[10px] text-slate-400 lowercase font-normal">/{selectedRateDetail.unit}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Rate Rationale (Jargon Free):</strong> {selectedRateDetail.explanation}
                        </p>

                        <div className="pt-2 border-t border-cyan-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>Recommended Price Band (95% CI):</span>
                          <span className="font-bold text-slate-600">
                            ${selectedRateDetail.minConfidence} - ${selectedRateDetail.maxConfidence}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Launch Queue Optimizer - Right Column Area */}
                <div className="xl:col-span-5 space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 font-display">Launch Queue Staging Optimizer</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Minimize heavy forklift movements and tractor travel delays by sequencing daily vessel launches.
                      </p>
                    </div>

                    {/* Staging Metrics Panel */}
                    <div className="bg-cyan-50/20 rounded-xl p-4 border border-cyan-100 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Efficiency Level</p>
                        <p className={`text-sm font-bold ${isQueueOptimized ? "text-emerald-600" : "text-amber-600"}`}>
                          {isQueueOptimized ? "Optimal Sequence Configured" : "Non-Optimized Standard Sequence"}
                        </p>
                      </div>
                      <div className="text-right bg-white rounded-lg py-1.5 px-3 border border-slate-200">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Time Saved</p>
                        <p className="text-base font-mono font-extrabold text-slate-900">
                          {isQueueOptimized ? "42 minutes" : "0 minutes"}
                        </p>
                      </div>
                    </div>

                    {/* Launch Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleOptimizeQueue}
                        disabled={isOptimizing || isQueueOptimized}
                        className={`flex-1 text-white font-medium text-xs py-2.5 px-4 rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                          isQueueOptimized ? "bg-emerald-600 hover:bg-emerald-700" : "bg-cyan-600 hover:bg-cyan-700"
                        }`}
                      >
                        {isOptimizing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Analyzing Staging Positions...
                          </>
                        ) : isQueueOptimized ? (
                          <>
                            <Check className="w-4 h-4" />
                            Optimal Order Locked
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            Optimize Launch Sequence
                          </>
                        )}
                      </button>

                      {isQueueOptimized && (
                        <button
                          onClick={handleResetQueue}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-md transition-all cursor-pointer"
                        >
                          Reset List
                        </button>
                      )}
                    </div>

                    {/* Queue List */}
                    <div className="space-y-2 max-h-120 overflow-y-auto pr-1">
                      {launchQueue.map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs bg-white ${
                            isQueueOptimized ? "border-emerald-100 hover:bg-emerald-50/10" : "border-slate-200 hover:bg-slate-50/30"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Sequence number badge */}
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                              isQueueOptimized ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {item.currentOrder}
                            </span>

                            {/* Boat Specs */}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{item.boatName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                Owner: {item.owner} | {item.lengthFt}ft | Draft: {item.draftFt}ft
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                Location: <span className="font-semibold text-slate-600">{item.storageLocation}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Time Slot */}
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" />
                                {item.scheduledTime}
                              </span>
                            </div>

                            {/* Manual Reordering Controls */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => handleMoveQueueItem(index, "up")}
                                disabled={index === 0}
                                className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                title="Move launch up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveQueueItem(index, "down")}
                                disabled={index === launchQueue.length - 1}
                                className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                title="Move launch down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* MODULE 4: RENEWAL PRICING                  */}
            {/* ========================================== */}
            {activeModule === "renewal" && (
              <div className="space-y-6">
                {/* Introduction & Highlights Banner */}
                <div className="bg-[#002147] border border-white/10 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1 max-w-2xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 font-display">Dynamic Annual Contract Renewal Pricing</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Optimize seasonal slip contract renewal margins while applying personalized discounts to high-risk legacy boaters to reduce seasonal turnover.
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-center min-w-28 shadow-inner">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Risk Churn</p>
                      <p className="text-lg font-bold font-mono text-rose-400 mt-0.5">{highRiskCount}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-center min-w-28 shadow-inner">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Confidence</p>
                      <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">94%</p>
                    </div>
                  </div>
                </div>

                {/* Main Table Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Search and Filters */}
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by tenant or vessel name..."
                        value={renewalSearch}
                        onChange={(e) => setRenewalSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Churn Risk Level Filter Tag Selection */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline mr-1">Risk Rating:</span>
                        {["All", "High", "Medium", "Low"].map((risk) => (
                          <button
                            key={risk}
                            onClick={() => setRenewalRiskFilter(risk as any)}
                            className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all cursor-pointer ${
                              renewalRiskFilter === risk
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {risk}
                          </button>
                        ))}
                      </div>

                      {/* Divider */}
                      <span className="h-5 w-px bg-slate-200 hidden sm:inline"></span>

                      {/* Apply Batch recommendation button */}
                      <button
                        onClick={handleAcceptAllRenewals}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs px-4 py-2 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Batch Send Offers
                      </button>
                    </div>
                  </div>

                  {/* Renewals Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                          <th className="p-3 pl-6">Tenant & Vessel</th>
                          <th className="p-3 text-center">Tenure</th>
                          <th className="p-3 text-right">Current Rate</th>
                          <th className="p-3 text-right">Recommended Renewal</th>
                          <th className="p-3 text-center">Churn Risk</th>
                          <th className="p-3 pl-6">Top 2 Risk Drivers</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 pr-6 text-center">Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredContracts.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-12 text-center text-slate-400">
                              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                              <p className="text-sm font-medium">No annual contract renewals match your selected filter criteria.</p>
                              <p className="text-xs text-slate-400 mt-1">Try relaxing your risk filter or typing a different tenant name.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredContracts.map((contract) => {
                            const isExpanded = expandedContractId === contract.id;
                            const isOfferSent = acceptedContracts[contract.id];

                            // Churn risk badge color matching
                            let riskColor = "";
                            if (contract.churnRisk === "High") {
                              riskColor = "bg-rose-50 text-rose-700 border-rose-100";
                            } else if (contract.churnRisk === "Medium") {
                              riskColor = "bg-amber-50 text-amber-700 border-amber-100";
                            } else {
                              riskColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                            }

                            return (
                              <Fragment key={contract.id}>
                                <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? "bg-slate-50/30" : ""}`}>
                                  {/* Tenant Name */}
                                  <td className="p-3 pl-6 font-medium text-slate-950">
                                    <p className="font-bold text-slate-900 text-sm font-display">{contract.tenant}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Boat: {contract.boatName}</p>
                                  </td>

                                  {/* Tenure */}
                                  <td className="p-3 text-center font-mono">
                                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px]">
                                      {contract.tenureYears} yrs
                                    </span>
                                  </td>

                                  {/* Current Annual Rate */}
                                  <td className="p-3 text-right font-mono text-slate-600 text-sm font-medium">
                                    ${contract.currentRate.toLocaleString()}
                                  </td>

                                  {/* Recommended Renewal Rate */}
                                  <td className="p-3 text-right">
                                    <p className={`font-mono font-bold text-sm ${isOfferSent ? "text-slate-400" : "text-cyan-700"}`}>
                                      ${contract.recommendedRate.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                      {contract.confidenceScore}% Confidence Band
                                    </p>
                                  </td>

                                  {/* Churn Risk */}
                                  <td className="p-3 text-center">
                                    <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full border ${riskColor}`}>
                                      {contract.churnRisk}
                                    </span>
                                  </td>

                                  {/* Top 2 Risk Drivers */}
                                  <td className="p-3 pl-6">
                                    <div className="flex flex-wrap gap-1.5 max-w-48">
                                      {contract.riskDrivers.map((driver, idx) => (
                                        <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                                          {driver}
                                        </span>
                                      ))}
                                    </div>
                                  </td>

                                  {/* Offer Status */}
                                  <td className="p-3 text-center">
                                    {isOfferSent ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-1 rounded-md">
                                        <Check className="w-3 h-3" />
                                        Sent
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-100 font-semibold px-2 py-1 rounded-md">
                                        Draft
                                      </span>
                                    )}
                                  </td>

                                  {/* Details expand click */}
                                  <td className="p-3 pr-6 text-center">
                                    <button
                                      onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                      title="Review renewal rationale details"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5" />
                                      )}
                                    </button>
                                  </td>
                                </tr>

                                {/* Expanded Rationale details Row */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/50 border-t border-slate-100">
                                    <td colSpan={8} className="p-6 pl-14">
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        {/* Pricing Stats and Limits */}
                                        <div className="md:col-span-4 space-y-4">
                                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dynamic renewal ranges</h5>
                                          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                                            <div className="flex justify-between">
                                              <span className="text-slate-500">Suggested Floor:</span>
                                              <span className="font-bold text-slate-800">${contract.confidenceMin.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500">Suggested Ceiling:</span>
                                              <span className="font-bold text-slate-800">${contract.confidenceMax.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
                                              <span>Dynamic Yield:</span>
                                              <span className="text-cyan-700">+{Math.round(((contract.recommendedRate - contract.currentRate) / contract.currentRate) * 100)}%</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Plain Language Rationale and Actions */}
                                        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                                          <div>
                                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Churn Risk & Pricing Logic</h5>
                                            <p className="text-xs text-slate-600 leading-relaxed bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
                                              {contract.explanation}
                                            </p>
                                          </div>

                                          <div className="flex items-center justify-end gap-3 pt-2">
                                            <button
                                              onClick={() => setExpandedContractId(null)}
                                              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                              Close Review
                                            </button>
                                            {!isOfferSent && (
                                              <button
                                                onClick={() => handleSendRenewalOffer(contract)}
                                                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs px-4 py-2.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                              >
                                                Apply & Send Offer
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
