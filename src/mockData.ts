/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types for DockMaster Yield

export interface ServiceBayCell {
  id: string;
  bayType: string;
  date: string;
  dayName: string;
  recommendedPrice: number; // hourly rate in USD
  minConfidence: number;
  maxConfidence: number;
  occupancy: number; // percentage 0-100
  drivers: {
    label: string;
    value: number; // percentage bar
    impact: "positive" | "negative";
  }[];
  explanation: string;
  isAccepted: boolean;
}

export interface ForecastDataPoint {
  date: string;
  "ENG-MAINT": number;   // Engine Maintenance hours
  "FIBER-REP": number;   // Fiberglass Repair hours
  "RIG-REPAIR": number;  // Rigging Repair hours
  "ELEC-DIAG": number;   // Electrical Diagnosis hours
  "GEN-SERVICE": number; // General Servicing hours
  capacityLimit: number;
  confidenceLower: number;
  confidenceUpper: number;
  totalForecast: number;
}

export interface UsedBoat {
  id: string;
  make: string;
  model: string;
  year: number;
  daysOnLot: number;
  currentPrice: number;
  recommendedPrice: number;
  confidenceMin: number;
  confidenceMax: number;
  confidenceScore: number; // percentage
  markdownFlag: boolean;
  compsAverage: number;
  localDemandIndex: number; // 1-10
  rationale: string;
}

export interface StorageClassRate {
  id: string;
  className: string;
  unit: string;
  ratesByMonth: {
    month: string;
    rate: number;
    minConfidence: number;
    maxConfidence: number;
    explanation: string;
  }[];
}

export interface PendingLaunch {
  id: string;
  boatName: string;
  owner: string;
  lengthFt: number;
  draftFt: number;
  storageLocation: "Dry Stack" | "Acre Storage" | "Heated Barn" | "Rack B4" | "Rack A1";
  scheduledTime: string;
  currentOrder: number;
  optimizedOrder: number;
  weightTons: number;
}

export interface RenewalContract {
  id: string;
  tenant: string;
  boatName: string;
  tenureYears: number;
  currentRate: number;
  recommendedRate: number;
  confidenceMin: number;
  confidenceMax: number;
  confidenceScore: number;
  churnRisk: "High" | "Medium" | "Low";
  riskDrivers: string[];
  explanation: string;
}

// 14 Days starting Friday July 3, 2026
export const MOCK_DATES = [
  { date: "2026-07-03", dayLabel: "Jul 3", isWeekend: false },
  { date: "2026-07-04", dayLabel: "Jul 4", isWeekend: true }, // Independence Day
  { date: "2026-07-05", dayLabel: "Jul 5", isWeekend: true },
  { date: "2026-07-06", dayLabel: "Jul 6", isWeekend: false },
  { date: "2026-07-07", dayLabel: "Jul 7", isWeekend: false },
  { date: "2026-07-08", dayLabel: "Jul 8", isWeekend: false },
  { date: "2026-07-09", dayLabel: "Jul 9", isWeekend: false },
  { date: "2026-07-10", dayLabel: "Jul 10", isWeekend: false },
  { date: "2026-07-11", dayLabel: "Jul 11", isWeekend: true },
  { date: "2026-07-12", dayLabel: "Jul 12", isWeekend: true },
  { date: "2026-07-13", dayLabel: "Jul 13", isWeekend: false },
  { date: "2026-07-14", dayLabel: "Jul 14", isWeekend: false },
  { date: "2026-07-15", dayLabel: "Jul 15", isWeekend: false },
  { date: "2026-07-16", dayLabel: "Jul 16", isWeekend: false },
];

export const MOCK_BAY_TYPES = [
  { key: "engine", label: "Engine Overhaul & Mechanical Bay", baseRate: 220 },
  { key: "fiberglass", label: "Fiberglass & Structural Painting Bay", baseRate: 185 },
  { key: "rigging", label: "Rigging, Canvas & Electrical Bay", baseRate: 160 },
];

// Generate 14 days of yield grid cells for each of the 3 bay types
export const initialServiceBayCells: ServiceBayCell[] = [
  // --- ENGINE OVERHAUL BAY (Base: $220) ---
  {
    id: "eng-1",
    bayType: "engine",
    date: "2026-07-03",
    dayName: "Jul 3 (Fri)",
    recommendedPrice: 245,
    minConfidence: 235,
    maxConfidence: 255,
    occupancy: 95,
    drivers: [
      { label: "Holiday Weekend Demand", value: 98, impact: "positive" },
      { label: "Emergency Breakdown Backlog", value: 85, impact: "positive" },
      { label: "Technician Staffing Limit", value: 75, impact: "positive" }
    ],
    explanation: "Pricing is set at a premium due to high demand ahead of the Independence Day holiday. Immediate emergency support requests from incoming boaters are straining staff capacity.",
    isAccepted: false
  },
  {
    id: "eng-2",
    bayType: "engine",
    date: "2026-07-04",
    dayName: "Jul 4 (Sat)",
    recommendedPrice: 260,
    minConfidence: 250,
    maxConfidence: 270,
    occupancy: 100,
    drivers: [
      { label: "Holiday Weekend Demand", value: 100, impact: "positive" },
      { label: "Premium Holiday Labor Cost", value: 90, impact: "positive" },
      { label: "High Urgency Diagnostics", value: 80, impact: "positive" }
    ],
    explanation: "Maximum premium pricing on Independence Day. The bay is fully booked, and any additional walk-ins require overtime wages and urgent technician redeployment.",
    isAccepted: false
  },
  {
    id: "eng-3",
    bayType: "engine",
    date: "2026-07-05",
    dayName: "Jul 5 (Sun)",
    recommendedPrice: 230,
    minConfidence: 220,
    maxConfidence: 240,
    occupancy: 80,
    drivers: [
      { label: "Holiday Backlog Clearance", value: 75, impact: "positive" },
      { label: "Sunday Standby Capacity", value: 40, impact: "negative" },
      { label: "Cruising Season Spike", value: 70, impact: "positive" }
    ],
    explanation: "Rates ease slightly on Sunday as planned holiday maintenance concludes, though high seasonal cruising volume maintains a steady stream of active work orders.",
    isAccepted: false
  },
  {
    id: "eng-4",
    bayType: "engine",
    date: "2026-07-06",
    dayName: "Jul 6 (Mon)",
    recommendedPrice: 210,
    minConfidence: 200,
    maxConfidence: 220,
    occupancy: 60,
    drivers: [
      { label: "Post-Holiday Dropoff", value: 65, impact: "negative" },
      { label: "Scheduled Routine Service", value: 50, impact: "positive" },
      { label: "Optimal Tech Staffing", value: 30, impact: "negative" }
    ],
    explanation: "Price is slightly discounted below the base rate to encourage local boaters to schedule non-emergency, routine maintenance on typically slow post-holiday weekdays.",
    isAccepted: false
  },
  {
    id: "eng-5",
    bayType: "engine",
    date: "2026-07-07",
    dayName: "Jul 7 (Tue)",
    recommendedPrice: 215,
    minConfidence: 205,
    maxConfidence: 225,
    occupancy: 65,
    drivers: [
      { label: "Fleet Contract Work", value: 60, impact: "positive" },
      { label: "Midweek Pricing Adjustment", value: 40, impact: "negative" },
      { label: "Certified Diesel Expert Available", value: 55, impact: "positive" }
    ],
    explanation: "Pricing remains stable close to base levels. Steady commercial charter fleet maintenance scheduled for midweek provides a solid baseline occupancy level.",
    isAccepted: false
  },
  {
    id: "eng-6",
    bayType: "engine",
    date: "2026-07-08",
    dayName: "Jul 8 (Wed)",
    recommendedPrice: 220,
    minConfidence: 210,
    maxConfidence: 230,
    occupancy: 70,
    drivers: [
      { label: "Steady Outboard Service Intake", value: 68, impact: "positive" },
      { label: "Regular Season Baseline", value: 50, impact: "positive" },
      { label: "Average Queue Length", value: 45, impact: "positive" }
    ],
    explanation: "Standard pricing applies. Active queues and technician scheduling are perfectly balanced, requiring no special discounts or premium pricing modifiers.",
    isAccepted: false
  },
  {
    id: "eng-7",
    bayType: "engine",
    date: "2026-07-09",
    dayName: "Jul 9 (Thu)",
    recommendedPrice: 225,
    minConfidence: 215,
    maxConfidence: 235,
    occupancy: 75,
    drivers: [
      { label: "Weekend Prep Volume", value: 72, impact: "positive" },
      { label: "Parts Delivery Timeline", value: 50, impact: "positive" },
      { label: "Technician Specialization Match", value: 60, impact: "positive" }
    ],
    explanation: "Slight rate increase as boaters request priority service to get their vessels water-ready before the upcoming weekend. Capacity is filling up steadily.",
    isAccepted: false
  },
  {
    id: "eng-8",
    bayType: "engine",
    date: "2026-07-10",
    dayName: "Jul 10 (Fri)",
    recommendedPrice: 240,
    minConfidence: 230,
    maxConfidence: 250,
    occupancy: 90,
    drivers: [
      { label: "High Weekend Influx", value: 90, impact: "positive" },
      { label: "Emergency Repair Queue", value: 80, impact: "positive" },
      { label: "Hot Weather Water Demand", value: 70, impact: "positive" }
    ],
    explanation: "Rates are elevated for Friday. High weekend occupancy forecasts and a warm weather wave are driving boaters to seek same-day mechanical and outboard inspections.",
    isAccepted: false
  },
  {
    id: "eng-9",
    bayType: "engine",
    date: "2026-07-11",
    dayName: "Jul 11 (Sat)",
    recommendedPrice: 245,
    minConfidence: 235,
    maxConfidence: 255,
    occupancy: 92,
    drivers: [
      { label: "Weekend Transient Influx", value: 92, impact: "positive" },
      { label: "On-call Master Tech Shift", value: 85, impact: "positive" },
      { label: "Immediate Priority Service", value: 75, impact: "positive" }
    ],
    explanation: "Strong weekend premium. High transient boat traffic in the harbor means premium service requests are abundant, matching our highest tier master technician shifts.",
    isAccepted: false
  },
  {
    id: "eng-10",
    bayType: "engine",
    date: "2026-07-12",
    dayName: "Jul 12 (Sun)",
    recommendedPrice: 225,
    minConfidence: 215,
    maxConfidence: 235,
    occupancy: 75,
    drivers: [
      { label: "Late Sunday Return Service", value: 60, impact: "positive" },
      { label: "Intermittent Staffing Capacity", value: 45, impact: "negative" },
      { label: "General Diagnostics demand", value: 55, impact: "positive" }
    ],
    explanation: "Moderate pricing. Sunday evening arrivals requesting basic diagnostics for issues encountered over the weekend are filling standard standby slots.",
    isAccepted: false
  },
  {
    id: "eng-11",
    bayType: "engine",
    date: "2026-07-13",
    dayName: "Jul 13 (Mon)",
    recommendedPrice: 210,
    minConfidence: 200,
    maxConfidence: 220,
    occupancy: 55,
    drivers: [
      { label: "Monday Lull Projection", value: 70, impact: "negative" },
      { label: "Preventative Maintenance Push", value: 65, impact: "positive" },
      { label: "Excess Bay Capacity", value: 50, impact: "negative" }
    ],
    explanation: "Discounted pricing is recommended for Monday to absorb excess mechanical bay capacity and incentivize regional commercial charter boat routine inspections.",
    isAccepted: false
  },
  {
    id: "eng-12",
    bayType: "engine",
    date: "2026-07-14",
    dayName: "Jul 14 (Tue)",
    recommendedPrice: 215,
    minConfidence: 205,
    maxConfidence: 225,
    occupancy: 60,
    drivers: [
      { label: "Scheduled Repower Projects", value: 55, impact: "positive" },
      { label: "Midweek Routine Demand", value: 45, impact: "negative" },
      { label: "Available Junior Tech Hours", value: 50, impact: "negative" }
    ],
    explanation: "Pricing remains steady. Several long-term yacht repowering projects occupy a portion of the bay, leaving remaining slots open for standard routine maintenance.",
    isAccepted: false
  },
  {
    id: "eng-13",
    bayType: "engine",
    date: "2026-07-15",
    dayName: "Jul 15 (Wed)",
    recommendedPrice: 220,
    minConfidence: 210,
    maxConfidence: 230,
    occupancy: 68,
    drivers: [
      { label: "Outboard Service Intake", value: 60, impact: "positive" },
      { label: "Season Average Occupancy", value: 55, impact: "positive" },
      { label: "Optimal Tech Scheduling", value: 40, impact: "positive" }
    ],
    explanation: "Baseline pricing is optimal. The service pipeline matches average seasonal volumes, maintaining clean operational efficiency without necessitating promotional adjustments.",
    isAccepted: false
  },
  {
    id: "eng-14",
    bayType: "engine",
    date: "2026-07-16",
    dayName: "Jul 16 (Thu)",
    recommendedPrice: 225,
    minConfidence: 215,
    maxConfidence: 235,
    occupancy: 70,
    drivers: [
      { label: "Pre-Weekend Service Prep", value: 65, impact: "positive" },
      { label: "Upcoming Forecast Demand", value: 55, impact: "positive" },
      { label: "Sufficient Material Stock", value: 30, impact: "positive" }
    ],
    explanation: "Rates tick up slightly heading into the weekend. Commuters and local yacht owners are booking slots to address active engine warning lights prior to weekend voyages.",
    isAccepted: false
  },

  // --- FIBERGLASS, HULL REPAIR & PAINT BAY (Base: $185) ---
  {
    id: "fib-1",
    bayType: "fiberglass",
    date: "2026-07-03",
    dayName: "Jul 3 (Fri)",
    recommendedPrice: 195,
    minConfidence: 185,
    maxConfidence: 205,
    occupancy: 85,
    drivers: [
      { label: "Urgent Hull Collision Fixes", value: 90, impact: "positive" },
      { label: "High Ambient Temperature (Cure Time)", value: 80, impact: "positive" },
      { label: "Premium Holiday Weekend Shift", value: 70, impact: "positive" }
    ],
    explanation: "Elevated pricing due to several minor hull collisions from active harbor traffic. High summer temperatures are optimizing gelcoat and resin curing times, driving high workflow density.",
    isAccepted: false
  },
  {
    id: "fib-2",
    bayType: "fiberglass",
    date: "2026-07-04",
    dayName: "Jul 4 (Sat)",
    recommendedPrice: 200,
    minConfidence: 190,
    maxConfidence: 210,
    occupancy: 90,
    drivers: [
      { label: "Premium Holiday Labor", value: 95, impact: "positive" },
      { label: "Emergency Gelcoat Repairs", value: 85, impact: "positive" },
      { label: "Limited Holiday Weekend Staff", value: 75, impact: "positive" }
    ],
    explanation: "Holiday premium rate. Limited technician shifts coupled with emergency requests for fiberglass patch-ups from active weekend cruisers require overtime coverage.",
    isAccepted: false
  },
  {
    id: "fib-3",
    bayType: "fiberglass",
    date: "2026-07-05",
    dayName: "Jul 5 (Sun)",
    recommendedPrice: 185,
    minConfidence: 175,
    maxConfidence: 195,
    occupancy: 70,
    drivers: [
      { label: "Sunday Standby Shifts", value: 60, impact: "negative" },
      { label: "Active Project Progress", value: 65, impact: "positive" },
      { label: "Warm Weather Curing", value: 50, impact: "positive" }
    ],
    explanation: "Standard pricing applies. Active fiberglass restoration jobs are progressing on schedule, keeping the bay steady without creating urgent bottlenecks.",
    isAccepted: false
  },
  {
    id: "fib-4",
    bayType: "fiberglass",
    date: "2026-07-06",
    dayName: "Jul 6 (Mon)",
    recommendedPrice: 175,
    minConfidence: 165,
    maxConfidence: 185,
    occupancy: 50,
    drivers: [
      { label: "Monday Project Lull", value: 75, impact: "negative" },
      { label: "Incentive Pricing Promotion", value: 65, impact: "negative" },
      { label: "Long-term Refit Scheduling", value: 40, impact: "positive" }
    ],
    explanation: "Pricing is discounted to fill structural paint slots on Monday. This encourages owners with aesthetic hull scuffs to leave their boats for cosmetic service.",
    isAccepted: false
  },
  {
    id: "fib-5",
    bayType: "fiberglass",
    date: "2026-07-07",
    dayName: "Jul 7 (Tue)",
    recommendedPrice: 180,
    minConfidence: 170,
    maxConfidence: 190,
    occupancy: 60,
    drivers: [
      { label: "Long-term Hull Overhaul", value: 65, impact: "positive" },
      { label: "Midweek Slot Availability", value: 50, impact: "negative" },
      { label: "Optimal Humidity Levels", value: 45, impact: "positive" }
    ],
    explanation: "Stable baseline pricing. Consistent multiday hull restoration jobs provide a dependable baseline, with minor slots available for quick buffing and waxing.",
    isAccepted: false
  },
  {
    id: "fib-6",
    bayType: "fiberglass",
    date: "2026-07-08",
    dayName: "Jul 8 (Wed)",
    recommendedPrice: 185,
    minConfidence: 175,
    maxConfidence: 195,
    occupancy: 65,
    drivers: [
      { label: "Regular Yacht Paint Demand", value: 58, impact: "positive" },
      { label: "Standard Seasonal Baseline", value: 50, impact: "positive" },
      { label: "Moisture Levels Normal", value: 35, impact: "positive" }
    ],
    explanation: "Base rate is recommended. Perfect weather forecasts and stable humidity levels ensure painting projects cure exactly on target without scheduling delays.",
    isAccepted: false
  },
  {
    id: "fib-7",
    bayType: "fiberglass",
    date: "2026-07-09",
    dayName: "Jul 9 (Thu)",
    recommendedPrice: 190,
    minConfidence: 180,
    maxConfidence: 200,
    occupancy: 75,
    drivers: [
      { label: "Pre-Weekend Cosmetic Pickups", value: 70, impact: "positive" },
      { label: "Yacht Detailing Requests", value: 65, impact: "positive" },
      { label: "Incoming Wet Weather Risk", value: 40, impact: "negative" }
    ],
    explanation: "Slight rate increase due to demand for hull detailing and compound waxing from owners planning to host guests on their yachts over the weekend.",
    isAccepted: false
  },
  {
    id: "fib-8",
    bayType: "fiberglass",
    date: "2026-07-10",
    dayName: "Jul 10 (Fri)",
    recommendedPrice: 190,
    minConfidence: 180,
    maxConfidence: 200,
    occupancy: 80,
    drivers: [
      { label: "Friday Outboard Detailing", value: 75, impact: "positive" },
      { label: "Weekend Hull Prep Backlog", value: 70, impact: "positive" },
      { label: "High Summer UV Impact", value: 60, impact: "positive" }
    ],
    explanation: "Elevated pricing in anticipation of heavy weekend cosmetic upkeep projects. High summer UV exposure increases customer demand for protective ceramic coatings.",
    isAccepted: false
  },
  {
    id: "fib-9",
    bayType: "fiberglass",
    date: "2026-07-11",
    dayName: "Jul 11 (Sat)",
    recommendedPrice: 195,
    minConfidence: 185,
    maxConfidence: 205,
    occupancy: 82,
    drivers: [
      { label: "Weekend Walk-in Buffing", value: 80, impact: "positive" },
      { label: "Holiday Repair Carryover", value: 65, impact: "positive" },
      { label: "Weekend Shift Wage Overhead", value: 55, impact: "positive" }
    ],
    explanation: "Solid weekend rates. Active demand for immediate gelcoat chip repairs from docking accidents. The price accounts for weekend shift premium wages.",
    isAccepted: false
  },
  {
    id: "fib-10",
    bayType: "fiberglass",
    date: "2026-07-12",
    dayName: "Jul 12 (Sun)",
    recommendedPrice: 180,
    minConfidence: 170,
    maxConfidence: 190,
    occupancy: 65,
    drivers: [
      { label: "Sunday Finishing Shifts", value: 60, impact: "negative" },
      { label: "Scheduled Curing Window", value: 55, impact: "positive" },
      { label: "Lower Emergency Hull Volume", value: 40, impact: "negative" }
    ],
    explanation: "Pricing settles back to baseline. Ideal for non-urgent tasks like letting multi-stage gelcoat applications cure over the quiet Sunday night window.",
    isAccepted: false
  },
  {
    id: "fib-11",
    bayType: "fiberglass",
    date: "2026-07-13",
    dayName: "Jul 13 (Mon)",
    recommendedPrice: 175,
    minConfidence: 165,
    maxConfidence: 185,
    occupancy: 45,
    drivers: [
      { label: "Low Monday Booking Volume", value: 80, impact: "negative" },
      { label: "Promotional Marine Finish Discount", value: 70, impact: "negative" },
      { label: "Long-term Refit Filler", value: 50, impact: "positive" }
    ],
    explanation: "Discounted rates designed to incentivize yacht charter fleets to schedule bottom-painting and hull sandblasting during low-occupancy Monday time slots.",
    isAccepted: false
  },
  {
    id: "fib-12",
    bayType: "fiberglass",
    date: "2026-07-14",
    dayName: "Jul 14 (Tue)",
    recommendedPrice: 180,
    minConfidence: 170,
    maxConfidence: 190,
    occupancy: 55,
    drivers: [
      { label: "Scheduled Keel Repairs", value: 60, impact: "positive" },
      { label: "Midweek Slump Cushion", value: 45, impact: "negative" },
      { label: "Certified Marine Painter Availability", value: 50, impact: "positive" }
    ],
    explanation: "Standard pricing close to base. Steady keel repair projects occupy the secondary bay area, ensuring core capacity remains active without backlogs.",
    isAccepted: false
  },
  {
    id: "fib-13",
    bayType: "fiberglass",
    date: "2026-07-15",
    dayName: "Jul 15 (Wed)",
    recommendedPrice: 185,
    minConfidence: 175,
    maxConfidence: 195,
    occupancy: 62,
    drivers: [
      { label: "Stable Finish Requests", value: 55, impact: "positive" },
      { label: "Standard Operating Rhythms", value: 50, impact: "positive" },
      { label: "Moderate Humidity Baseline", value: 30, impact: "positive" }
    ],
    explanation: "Perfect standard base pricing is recommended. Steady local demand matches current certified technician capacity, presenting no major bottlenecks.",
    isAccepted: false
  },
  {
    id: "fib-14",
    bayType: "fiberglass",
    date: "2026-07-16",
    dayName: "Jul 16 (Thu)",
    recommendedPrice: 185,
    minConfidence: 175,
    maxConfidence: 195,
    occupancy: 68,
    drivers: [
      { label: "Weekend Prep Compound Wax", value: 62, impact: "positive" },
      { label: "Steady Hull Gelcoat Intake", value: 55, impact: "positive" },
      { label: "Optimal Dry Forecast", value: 40, impact: "positive" }
    ],
    explanation: "Pricing remains aligned with standard base rates. Solid detailing and compound wax backlog fills the queue as customers prepare for mid-July cruising.",
    isAccepted: false
  },

  // --- RIGGING, CANVAS & ELECTRICAL BAY (Base: $160) ---
  {
    id: "rig-1",
    bayType: "rigging",
    date: "2026-07-03",
    dayName: "Jul 3 (Fri)",
    recommendedPrice: 175,
    minConfidence: 165,
    maxConfidence: 185,
    occupancy: 90,
    drivers: [
      { label: "Holiday Cruise Electronics Prep", value: 95, impact: "positive" },
      { label: "Sailboat Rigging Inspections", value: 85, impact: "positive" },
      { label: "High Inshore Yacht Traffic", value: 75, impact: "positive" }
    ],
    explanation: "High price recommended due to critical pre-holiday electronics diagnostics. Cruisers want GPS, radar, and marine VHF radios verified before heading out to watch offshore fireworks.",
    isAccepted: false
  },
  {
    id: "rig-2",
    bayType: "rigging",
    date: "2026-07-04",
    dayName: "Jul 4 (Sat)",
    recommendedPrice: 180,
    minConfidence: 170,
    maxConfidence: 190,
    occupancy: 95,
    drivers: [
      { label: "Independence Day Emergency Electrical", value: 100, impact: "positive" },
      { label: "Holiday Overtime Staffing", value: 90, impact: "positive" },
      { label: "Immediate Shore Power Troubleshooting", value: 80, impact: "positive" }
    ],
    explanation: "Peak weekend pricing. Severe shore-power tripping issues and battery failures on transient yachts docked for the fireworks have created an urgent backlog.",
    isAccepted: false
  },
  {
    id: "rig-3",
    bayType: "rigging",
    date: "2026-07-05",
    dayName: "Jul 5 (Sun)",
    recommendedPrice: 165,
    minConfidence: 155,
    maxConfidence: 175,
    occupancy: 75,
    drivers: [
      { label: "Sailing Regatta Rig Prep", value: 70, impact: "positive" },
      { label: "Sunday Standby Rates", value: 50, impact: "negative" },
      { label: "Windlass Repair Backlog", value: 60, impact: "positive" }
    ],
    explanation: "Standard pricing. Steady work preparing rigging systems for local yacht club sailing series, balanced by minor Sunday afternoon standby slot availability.",
    isAccepted: false
  },
  {
    id: "rig-4",
    bayType: "rigging",
    date: "2026-07-06",
    dayName: "Jul 6 (Mon)",
    recommendedPrice: 150,
    minConfidence: 140,
    maxConfidence: 160,
    occupancy: 40,
    drivers: [
      { label: "Post-Holiday Electronics Dropoff", value: 80, impact: "negative" },
      { label: "Routine Alternator Upgrades", value: 60, impact: "positive" },
      { label: "Promotional Rigging Discount", value: 70, impact: "negative" }
    ],
    explanation: "Price is discounted. Encourages sailboat owners to bring their vessels in for mast tuning, standing rigging inspections, or canvas stitching during slow Monday mornings.",
    isAccepted: false
  },
  {
    id: "rig-5",
    bayType: "rigging",
    date: "2026-07-07",
    dayName: "Jul 7 (Tue)",
    recommendedPrice: 155,
    minConfidence: 145,
    maxConfidence: 165,
    occupancy: 55,
    drivers: [
      { label: "Lithium Battery Upgrades", value: 60, impact: "positive" },
      { label: "Midweek Sailing Lull", value: 55, impact: "negative" },
      { label: "Rigging Mast-up Queue", value: 45, impact: "positive" }
    ],
    explanation: "Pricing remains stable near base. Long-term marine electronics refits (such as modern lithium-ion marine battery bank upgrades) keep the electrical technicians steady.",
    isAccepted: false
  },
  {
    id: "rig-6",
    bayType: "rigging",
    date: "2026-07-08",
    dayName: "Jul 8 (Wed)",
    recommendedPrice: 160,
    minConfidence: 150,
    maxConfidence: 170,
    occupancy: 65,
    drivers: [
      { label: "Standard Marine Electronics Diagnostics", value: 62, impact: "positive" },
      { label: "Canvas Bimini Top Fittings", value: 55, impact: "positive" },
      { label: "Average Seasonal Backlog", value: 40, impact: "positive" }
    ],
    explanation: "Baseline standard pricing is recommended. Steady canvas repair requests and standard fishfinder/transducer installs are matching our regular weekday shift capacity.",
    isAccepted: false
  },
  {
    id: "rig-7",
    bayType: "rigging",
    date: "2026-07-09",
    dayName: "Jul 9 (Thu)",
    recommendedPrice: 165,
    minConfidence: 155,
    maxConfidence: 175,
    occupancy: 70,
    drivers: [
      { label: "Weekend Cruise Electrical Checks", value: 68, impact: "positive" },
      { label: "Canvas Bimini Pickups", value: 60, impact: "positive" },
      { label: "Certified Marine Electrician Staffed", value: 50, impact: "positive" }
    ],
    explanation: "Slight pricing increase due to active demand for marine electric generator servicing and air conditioning diagnostic checks ahead of hot weekend forecasts.",
    isAccepted: false
  },
  {
    id: "rig-8",
    bayType: "rigging",
    date: "2026-07-10",
    dayName: "Jul 10 (Fri)",
    recommendedPrice: 170,
    minConfidence: 160,
    maxConfidence: 180,
    occupancy: 85,
    drivers: [
      { label: "Weekend Rigging Tuning requests", value: 80, impact: "positive" },
      { label: "VHF Marine Radio Checks", value: 75, impact: "positive" },
      { label: "Summer Humidity Impact", value: 45, impact: "positive" }
    ],
    explanation: "Solid rate for Friday. Rigging staff are fully scheduled with mast adjustments and sailboat transducer replacements prior to Saturday morning harbor regattas.",
    isAccepted: false
  },
  {
    id: "rig-9",
    bayType: "rigging",
    date: "2026-07-11",
    dayName: "Jul 11 (Sat)",
    recommendedPrice: 175,
    minConfidence: 165,
    maxConfidence: 185,
    occupancy: 88,
    drivers: [
      { label: "Sailing Regatta Urgent Rigging", value: 85, impact: "positive" },
      { label: "Air Conditioning Failures", value: 80, impact: "positive" },
      { label: "Weekend Overtime Wage Costs", value: 60, impact: "positive" }
    ],
    explanation: "Premium weekend pricing. Urgent requests for backup bilge pump installations and sailboat furling system diagnostics are filling all available premium slots.",
    isAccepted: false
  },
  {
    id: "rig-10",
    bayType: "rigging",
    date: "2026-07-12",
    dayName: "Jul 12 (Sun)",
    recommendedPrice: 160,
    minConfidence: 150,
    maxConfidence: 170,
    occupancy: 70,
    drivers: [
      { label: "Late Sunday Return Diagnostics", value: 58, impact: "positive" },
      { label: "Standard Standby Hours", value: 45, impact: "negative" },
      { label: "Weekly Crew Rebalancing", value: 40, impact: "positive" }
    ],
    explanation: "Rates align perfectly with the standard baseline. The rigging and electrical bay has stable throughput with several multi-day sailboat mast wire projects.",
    isAccepted: false
  },
  {
    id: "rig-11",
    bayType: "rigging",
    date: "2026-07-13",
    dayName: "Jul 13 (Mon)",
    recommendedPrice: 150,
    minConfidence: 140,
    maxConfidence: 160,
    occupancy: 38,
    drivers: [
      { label: "Low Monday Backlog", value: 85, impact: "negative" },
      { label: "Promotional Windlass Checkup", value: 68, impact: "negative" },
      { label: "Available Apprentice Hours", value: 50, impact: "negative" }
    ],
    explanation: "Pricing is set at a discount. Standard Monday service slot is ideal for boaters wishing to drop off sails or bimini canvas for minor zipper and seam repairs.",
    isAccepted: false
  },
  {
    id: "rig-12",
    bayType: "rigging",
    date: "2026-07-14",
    dayName: "Jul 14 (Tue)",
    recommendedPrice: 155,
    minConfidence: 145,
    maxConfidence: 165,
    occupancy: 50,
    drivers: [
      { label: "Midweek Electronics Installs", value: 55, impact: "positive" },
      { label: "Calm Weather Projections", value: 45, impact: "negative" },
      { label: "Standard Marine Electrician Shift", value: 40, impact: "positive" }
    ],
    explanation: "Pricing is steady near base levels. The electrical team is scheduled for routine radar dome and satellite dome installations on pre-booked luxury powerboats.",
    isAccepted: false
  },
  {
    id: "rig-13",
    bayType: "rigging",
    date: "2026-07-15",
    dayName: "Jul 15 (Wed)",
    recommendedPrice: 160,
    minConfidence: 150,
    maxConfidence: 170,
    occupancy: 60,
    drivers: [
      { label: "Routine Battery Maintenance", value: 58, impact: "positive" },
      { label: "Bimini Fabric Refitting", value: 50, impact: "positive" },
      { label: "Optimal Humidifier Conditions", value: 30, impact: "positive" }
    ],
    explanation: "Perfect standard base pricing. Local boaters are utilizing regular midweek diagnostics to isolate minor electrical grounds and battery drain issues.",
    isAccepted: false
  },
  {
    id: "rig-14",
    bayType: "rigging",
    date: "2026-07-16",
    dayName: "Jul 16 (Thu)",
    recommendedPrice: 165,
    minConfidence: 155,
    maxConfidence: 175,
    occupancy: 65,
    drivers: [
      { label: "Pre-Weekend Rig Checkups", value: 65, impact: "positive" },
      { label: "Weekend Electronics Backlog", value: 55, impact: "positive" },
      { label: "Adequate Spare Wiring Inventories", value: 30, impact: "positive" }
    ],
    explanation: "Slight rate increase recommended. Pre-weekend rigging safety inspections and battery charger testing requests are starting to fill up the late afternoon slots.",
    isAccepted: false
  }
];

// 30-Day Demand Forecast by job code for the Northeast Boatyard
export const MOCK_FORECAST_DATA: ForecastDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const dayIndex = i + 1;
  const baseEng = 45 + Math.sin(dayIndex / 2) * 15;
  const baseFiber = 30 + Math.sin(dayIndex / 3 + 1) * 10;
  const baseRig = 25 + Math.cos(dayIndex / 4) * 8;
  const baseElec = 20 + Math.sin(dayIndex / 5 + 2) * 7;
  const baseGen = 35 + Math.cos(dayIndex / 2 + 1) * 12;

  // Add seasonal holiday weekend spike around Day 1-3 (July 3 to July 5)
  const holidayModifier = dayIndex <= 3 ? 1.4 : (dayIndex >= 8 && dayIndex <= 10 ? 1.2 : 1.0);

  const eng = Math.round(baseEng * holidayModifier);
  const fiber = Math.round(baseFiber * (dayIndex % 7 === 1 ? 0.7 : 1.0)); // lower on Mondays
  const rig = Math.round(baseRig * holidayModifier);
  const elec = Math.round(baseElec * holidayModifier);
  const gen = Math.round(baseGen * holidayModifier);

  const total = eng + fiber + rig + elec + gen;
  const cap = 160; // 160 standard tech hours available per day across all shifts

  // Confidence shade variables
  const lower = Math.round(total * 0.88);
  const upper = Math.round(total * 1.12);

  const pad = (num: number) => num.toString().padStart(2, "0");
  const monthDay = dayIndex <= 28 ? `Jul ${pad(dayIndex + 2)}` : `Aug ${pad(dayIndex - 28)}`;

  return {
    date: monthDay,
    "ENG-MAINT": eng,
    "FIBER-REP": fiber,
    "RIG-REPAIR": rig,
    "ELEC-DIAG": elec,
    "GEN-SERVICE": gen,
    capacityLimit: cap,
    confidenceLower: lower,
    confidenceUpper: upper,
    totalForecast: total
  };
});

// Used Boat Inventory Pricing (12 boats)
export const initialUsedBoats: UsedBoat[] = [
  {
    id: "boat-1",
    make: "Grady-White",
    model: "Canyon 306",
    year: 2021,
    daysOnLot: 85,
    currentPrice: 215000,
    recommendedPrice: 208000,
    confidenceMin: 204000,
    confidenceMax: 212000,
    confidenceScore: 94,
    markdownFlag: true,
    compsAverage: 210000,
    localDemandIndex: 4,
    rationale: "Days on lot have exceeded our standard 45-day regional benchmark. Local market comps show listing softening of 3.5% over the past month. Advise price correction to spark dealer traffic."
  },
  {
    id: "boat-2",
    make: "Boston Whaler",
    model: "270 Dauntless",
    year: 2022,
    daysOnLot: 14,
    currentPrice: 149000,
    recommendedPrice: 154000,
    confidenceMin: 151000,
    confidenceMax: 157000,
    confidenceScore: 88,
    markdownFlag: false,
    compsAverage: 156000,
    localDemandIndex: 9,
    rationale: "High demand segment in the Northeast for family day-boats. Comps show identical boats selling at $156,000 on average. Hold current inventory high and adjust upward to maximize margin."
  },
  {
    id: "boat-3",
    make: "Sea Ray",
    model: "Sundancer 320",
    year: 2019,
    daysOnLot: 110,
    currentPrice: 195000,
    recommendedPrice: 182000,
    confidenceMin: 178000,
    confidenceMax: 186000,
    confidenceScore: 95,
    markdownFlag: true,
    compsAverage: 189000,
    localDemandIndex: 3,
    rationale: "Vessel has sat on the lot through the peak spring buying surge. Carrying costs are accumulating, and active inquiries are minimal. A discount is critical to align with lower local demand."
  },
  {
    id: "boat-4",
    make: "Cobalt",
    model: "R8 Surf",
    year: 2023,
    daysOnLot: 28,
    currentPrice: 165000,
    recommendedPrice: 168000,
    confidenceMin: 164000,
    confidenceMax: 172000,
    confidenceScore: 82,
    markdownFlag: false,
    compsAverage: 170000,
    localDemandIndex: 8,
    rationale: "Surfing bowriders are highly sought-after. Lot time is well below the benchmark limit, and competitive listings in a 100-mile radius are scarce. Recommend a modest markup to capture premium summer demand."
  },
  {
    id: "boat-5",
    make: "Pursuit",
    model: "OS 355 Offshore",
    year: 2020,
    daysOnLot: 95,
    currentPrice: 345000,
    recommendedPrice: 335000,
    confidenceMin: 329000,
    confidenceMax: 339000,
    confidenceScore: 91,
    markdownFlag: true,
    compsAverage: 341000,
    localDemandIndex: 5,
    rationale: "High-value cruiser experiencing slower regional turnover as financing rates constrain luxury buyers. Realigning price downward makes our dealership listing the most competitive in the Tri-State area."
  },
  {
    id: "boat-6",
    make: "Regulator",
    model: "28FS Center Console",
    year: 2018,
    daysOnLot: 45,
    currentPrice: 169000,
    recommendedPrice: 169000,
    confidenceMin: 165000,
    confidenceMax: 173000,
    confidenceScore: 90,
    markdownFlag: false,
    compsAverage: 168500,
    localDemandIndex: 6,
    rationale: "Vessel pricing is perfectly aligned with regional averages. Outboard engine hours are highly competitive for its model year. Maintain current position as seasonal demand remains solid."
  },
  {
    id: "boat-7",
    make: "Chaparral",
    model: "237 SSX",
    year: 2021,
    daysOnLot: 12,
    currentPrice: 72000,
    recommendedPrice: 74500,
    confidenceMin: 72000,
    confidenceMax: 77000,
    confidenceScore: 85,
    markdownFlag: false,
    compsAverage: 75200,
    localDemandIndex: 7,
    rationale: "This bowrider entered inventory quickly and is generating strong walk-in traffic. Regional comps average $75,200. Recommending a $2,500 upward adjustment to capture immediate summer interest."
  },
  {
    id: "boat-8",
    make: "Yamaha",
    model: "242 Limited S",
    year: 2020,
    daysOnLot: 62,
    currentPrice: 58000,
    recommendedPrice: 55000,
    confidenceMin: 53500,
    confidenceMax: 56500,
    confidenceScore: 93,
    markdownFlag: true,
    compsAverage: 57500,
    localDemandIndex: 4,
    rationale: "Jet boat inventory is elevated across competing dealerships. Lot time is now over two months. Price adjustment is advised to clear inventory space for incoming new model arrivals."
  },
  {
    id: "boat-9",
    make: "Tiara Yachts",
    model: "39 Coupe",
    year: 2017,
    daysOnLot: 120,
    currentPrice: 425000,
    recommendedPrice: 398000,
    confidenceMin: 392000,
    confidenceMax: 404000,
    confidenceScore: 96,
    markdownFlag: true,
    compsAverage: 412000,
    localDemandIndex: 2,
    rationale: "Severe lot tenure of 120 days. High luxury financing friction is dampening interest in cruisers of this scale. A strong corrective reduction will appeal to cash buyers and free up significant yard capital."
  },
  {
    id: "boat-10",
    make: "Formula",
    model: "310 Bowrider",
    year: 2021,
    daysOnLot: 35,
    currentPrice: 210000,
    recommendedPrice: 212000,
    confidenceMin: 208000,
    confidenceMax: 216000,
    confidenceScore: 89,
    markdownFlag: false,
    compsAverage: 214000,
    localDemandIndex: 7,
    rationale: "Strong regional brand affinity for Formula hulls. Days on lot are well within healthy bounds. Minor markup optimizes margin while remaining below average regional listings."
  },
  {
    id: "boat-11",
    make: "Pathfinder",
    model: "2500 Hybrid",
    year: 2022,
    daysOnLot: 8,
    currentPrice: 98000,
    recommendedPrice: 101000,
    confidenceMin: 98000,
    confidenceMax: 104000,
    confidenceScore: 80,
    markdownFlag: false,
    compsAverage: 102500,
    localDemandIndex: 9,
    rationale: "Bay and coastal hybrid boats are the fastest-selling category this month. Extremely scarce listing locally. Recommend pricing up to test the market premium before interest flags."
  },
  {
    id: "boat-12",
    make: "Chris-Craft",
    model: "Launch 27",
    year: 2019,
    daysOnLot: 75,
    currentPrice: 125000,
    recommendedPrice: 119000,
    confidenceMin: 115000,
    confidenceMax: 122000,
    confidenceScore: 92,
    markdownFlag: true,
    compsAverage: 123000,
    localDemandIndex: 4,
    rationale: "Traditional runabouts are losing market share to versatile outboards. Tenure is approaching the danger threshold. Recommend adjusting price to clear before the late summer season slowdown."
  }
];

// Storage and Dry Stack Rates Calendar (12 Months View)
export const StorageClasses: StorageClassRate[] = [
  {
    id: "sc-1",
    className: "Indoor Heated Storage",
    unit: "per ft",
    ratesByMonth: [
      { month: "Jan", rate: 140, minConfidence: 135, maxConfidence: 145, explanation: "Peak mid-winter storage occupancy. High energy costs for climate control support stable rates." },
      { month: "Feb", rate: 140, minConfidence: 135, maxConfidence: 145, explanation: "Stable winter holding phase. No space expansion possible, premium rates maintain optimal margins." },
      { month: "Mar", rate: 130, minConfidence: 125, maxConfidence: 135, explanation: "Transition month. Early launch incentives begin, rates taper slightly to encourage quick spring preparation." },
      { month: "Apr", rate: 110, minConfidence: 105, maxConfidence: 115, explanation: "Active launching window. Heated storage is emptied, discounted rate applies for late layovers or detailing." },
      { month: "May", rate: 85, minConfidence: 80, maxConfidence: 90, explanation: "Early summer vacancy phase. Yard floor is converted for summer storage; promotional rate for refit projects." },
      { month: "Jun", rate: 75, minConfidence: 70, maxConfidence: 80, explanation: "Summer maintenance rate. Deep off-season discount to attract major wood restoration or engine re-power projects." },
      { month: "Jul", rate: 75, minConfidence: 70, maxConfidence: 80, explanation: "Mid-summer off-season rate. Heated facilities are clear; bargain rate for emergency dry storm layup services." },
      { month: "Aug", rate: 95, minConfidence: 90, maxConfidence: 100, explanation: "Late summer reservation queue opens. Early-bird sign-ups for winter storage are rewarded with stable pricing." },
      { month: "Sep", rate: 125, minConfidence: 120, maxConfidence: 130, explanation: "Active haul-out requests begin. Inquiries surge. Rates adjusted upward as space reservations exceed 70% capacity." },
      { month: "Oct", rate: 145, minConfidence: 140, maxConfidence: 150, explanation: "Peak haul-out month. High premium rate recommended due to near-total facility capacity saturation." },
      { month: "Nov", rate: 150, minConfidence: 145, maxConfidence: 155, explanation: "Final winterization rush. Extremely high demand for remaining heated floor space justifies absolute peak premiums." },
      { month: "Dec", rate: 140, minConfidence: 135, maxConfidence: 145, explanation: "Facility is locked in for winter. Rates return to stable seasonal levels with full occupancy confirmed." }
    ]
  },
  {
    id: "sc-2",
    className: "Outdoor Shrinkwrap Storage",
    unit: "per ft",
    ratesByMonth: [
      { month: "Jan", rate: 60, minConfidence: 57, maxConfidence: 63, explanation: "Winter storage locked. Pricing stable for regional outdoor yard storage." },
      { month: "Feb", rate: 60, minConfidence: 57, maxConfidence: 63, explanation: "Outdoor yard remains fully occupied. Rates stable with low maintenance overhead." },
      { month: "Mar", rate: 55, minConfidence: 52, maxConfidence: 58, explanation: "Tapering off. Early spring launching requests allow for minor rate relief." },
      { month: "Apr", rate: 45, minConfidence: 42, maxConfidence: 48, explanation: "Active launching. Shrinkwrap is recycled. Low rates encourage quick departure from the yard." },
      { month: "May", rate: 30, minConfidence: 27, maxConfidence: 33, explanation: "Bargain rate for summer trailer storage. Clear space policy in effect for yard transit." },
      { month: "Jun", rate: 25, minConfidence: 22, maxConfidence: 28, explanation: "Off-season trailer parking discount. Attracts commercial storage for empty boat haulers." },
      { month: "Jul", rate: 25, minConfidence: 22, maxConfidence: 28, explanation: "Trailer storage rates remain low to support local slip-renter utility needs." },
      { month: "Aug", rate: 35, minConfidence: 32, maxConfidence: 38, explanation: "Fall reservation baseline. Pre-bookings start filling outer yard sectors." },
      { month: "Sep", rate: 50, minConfidence: 47, maxConfidence: 53, explanation: "Haul-out queue expands. Outdoor yard footprint is optimized, prompting rate increases." },
      { month: "Oct", rate: 65, minConfidence: 62, maxConfidence: 68, explanation: "Peak shrinkwrap month. Rapid volume requires material stock and labor pooling, driving up rates." },
      { month: "Nov", rate: 70, minConfidence: 67, maxConfidence: 73, explanation: "Final rush. High labor pressure for framing and wrapping justifies elevated rates." },
      { month: "Dec", rate: 60, minConfidence: 57, maxConfidence: 63, explanation: "Winter storage locked. All boats winterized and wrapped in final parking config." }
    ]
  },
  {
    id: "sc-3",
    className: "Dry Stack Valet Storage",
    unit: "annual",
    ratesByMonth: [
      { month: "Jan", rate: 3900, minConfidence: 3750, maxConfidence: 4050, explanation: "Standard off-season rate. Encourages annual contract pre-payment during quiet winter months." },
      { month: "Feb", rate: 3900, minConfidence: 3750, maxConfidence: 4050, explanation: "Steady rates. Marketing push for boaters seeking to secure high-priority rack positions." },
      { month: "Mar", rate: 4100, minConfidence: 3950, maxConfidence: 4250, explanation: "Spring demand lift. Rack valet slots are filling rapidly as seasonal preparation spikes." },
      { month: "Apr", rate: 4400, minConfidence: 4250, maxConfidence: 4550, explanation: "Peak booking month. High rate justified as dry stack rack occupancy nears 85% capacity." },
      { month: "May", rate: 4600, minConfidence: 4450, maxConfidence: 4750, explanation: "Maximum summer rate. Immediate valet service availability is highly restricted, command top value." },
      { month: "Jun", rate: 4600, minConfidence: 4450, maxConfidence: 4750, explanation: "Peak boating season. Full facility occupancy keeps valet rate at premium tier." },
      { month: "Jul", rate: 4500, minConfidence: 4350, maxConfidence: 4650, explanation: "Slight easing of rates for late-entry boaters as minor mid-season openings occur." },
      { month: "Aug", rate: 4300, minConfidence: 4150, maxConfidence: 4450, explanation: "Tapering late summer rate. Encourages late-season boat buyers to test rack convenience." },
      { month: "Sep", rate: 4000, minConfidence: 3850, maxConfidence: 4150, explanation: "Tapering rates as standard boating season winds down, transitioning to winter layup storage." },
      { month: "Oct", rate: 3900, minConfidence: 3750, maxConfidence: 4050, explanation: "Winter transition. Valet program closes; rack storage integrated into haul-out winter configs." },
      { month: "Nov", rate: 3900, minConfidence: 3750, maxConfidence: 4050, explanation: "Standard off-season. Focus shifts entirely to static winter dry storage." },
      { month: "Dec", rate: 3900, minConfidence: 3750, maxConfidence: 4050, explanation: "Stable off-season rates. Low transaction volume keeps pricing fixed." }
    ]
  },
  {
    id: "sc-4",
    className: "Deep Water Slips",
    unit: "seasonal",
    ratesByMonth: [
      { month: "Jan", rate: 5800, minConfidence: 5500, maxConfidence: 6100, explanation: "Early deposit pricing. Offers a discount for returning slip holders who pay in full by Jan 31." },
      { month: "Feb", rate: 6000, minConfidence: 5700, maxConfidence: 6300, explanation: "Standard deposit phase. High interest from offshore cruiser owners wishing to secure slips." },
      { month: "Mar", rate: 6400, minConfidence: 6100, maxConfidence: 6700, explanation: "Spring surge. Inquiries are up 30% year over year, justifying an upward rate adjust." },
      { month: "Apr", rate: 6800, minConfidence: 6500, maxConfidence: 7100, explanation: "Near-saturation rates. Only 15 slips remain unbooked. Command premium tier pricing." },
      { month: "May", rate: 7200, minConfidence: 6900, maxConfidence: 7500, explanation: "Absolute peak rate. Slips are entirely sold out; premium applies for emergency subleases." },
      { month: "Jun", rate: 7200, minConfidence: 6900, maxConfidence: 7500, explanation: "Full slip occupancy. Premium tier active for any late-season standby dock requests." },
      { month: "Jul", rate: 7000, minConfidence: 6700, maxConfidence: 7300, explanation: "Minor transient sublets available. Slip availability is highly scarce, pricing remains firm." },
      { month: "Aug", rate: 6500, minConfidence: 6200, maxConfidence: 6800, explanation: "Late seasonal discount. Attracts transient boaters visiting for late summer fishing tournaments." },
      { month: "Sep", rate: 5500, minConfidence: 5200, maxConfidence: 5800, explanation: "End of season easing. Active slips clear as boaters prepare for haul-outs." },
      { month: "Oct", rate: 5000, minConfidence: 4700, maxConfidence: 5300, explanation: "Off-season. Standard slips are cleared for floating dock maintenance and bubbler placement." },
      { month: "Nov", rate: 5000, minConfidence: 4700, maxConfidence: 5300, explanation: "Closed dock program. Floating slips remain clear to avoid heavy icing damage." },
      { month: "Dec", rate: 5000, minConfidence: 4700, maxConfidence: 5300, explanation: "Winter state. De-icing bubblers active; slip pricing inactive for recreational use." }
    ]
  }
];

// Launch Queue Optimizer - 15 Pending Launches for July 3, 2026
export const initialPendingLaunches: PendingLaunch[] = [
  { id: "ln-1", boatName: "Seas the Day", owner: "Richard Benson", lengthFt: 32, draftFt: 3.5, storageLocation: "Dry Stack", scheduledTime: "08:00 AM", currentOrder: 1, optimizedOrder: 2, weightTons: 6.2 },
  { id: "ln-2", boatName: "Liquid Asset", owner: "Melissa Thorne", lengthFt: 24, draftFt: 2.0, storageLocation: "Heated Barn", scheduledTime: "08:15 AM", currentOrder: 2, optimizedOrder: 6, weightTons: 3.1 },
  { id: "ln-3", boatName: " Knot On Call ", owner: "Dr. Thomas Clark", lengthFt: 28, draftFt: 2.8, storageLocation: "Dry Stack", scheduledTime: "08:30 AM", currentOrder: 3, optimizedOrder: 3, weightTons: 4.8 },
  { id: "ln-4", boatName: "Gale Force", owner: "Nancy Miller", lengthFt: 40, draftFt: 5.5, storageLocation: "Acre Storage", scheduledTime: "08:45 AM", currentOrder: 4, optimizedOrder: 1, weightTons: 14.5 },
  { id: "ln-5", boatName: "Ocean Pearl", owner: "James Vance", lengthFt: 26, draftFt: 2.2, storageLocation: "Rack B4", scheduledTime: "09:00 AM", currentOrder: 5, optimizedOrder: 7, weightTons: 3.8 },
  { id: "ln-6", boatName: "Summer Wind", owner: "Karen Bradley", lengthFt: 35, draftFt: 4.2, storageLocation: "Acre Storage", scheduledTime: "09:15 AM", currentOrder: 6, optimizedOrder: 11, weightTons: 9.8 },
  { id: "ln-7", boatName: "Blue Horizon", owner: "Charles Dupont", lengthFt: 30, draftFt: 3.0, storageLocation: "Rack B4", scheduledTime: "09:30 AM", currentOrder: 7, optimizedOrder: 8, weightTons: 5.5 },
  { id: "ln-8", boatName: "Reel Therapy", owner: "Captain Jack Russo", lengthFt: 38, draftFt: 3.8, storageLocation: "Dry Stack", scheduledTime: "09:45 AM", currentOrder: 8, optimizedOrder: 4, weightTons: 11.2 },
  { id: "ln-9", boatName: "Bay Rambler", owner: "Sarah Jenkins", lengthFt: 22, draftFt: 1.8, storageLocation: "Rack A1", scheduledTime: "10:00 AM", currentOrder: 9, optimizedOrder: 13, weightTons: 2.4 },
  { id: "ln-10", boatName: "Pelican", owner: "George Larson", lengthFt: 20, draftFt: 1.5, storageLocation: "Rack A1", scheduledTime: "10:15 AM", currentOrder: 10, optimizedOrder: 14, weightTons: 2.0 },
  { id: "ln-11", boatName: "Stormy Petrel", owner: "Edward King", lengthFt: 45, draftFt: 6.0, storageLocation: "Heated Barn", scheduledTime: "10:30 AM", currentOrder: 11, optimizedOrder: 5, weightTons: 18.0 },
  { id: "ln-12", boatName: "Aquaholic", owner: "Bradley Moore", lengthFt: 27, draftFt: 2.5, storageLocation: "Rack B4", scheduledTime: "10:45 AM", currentOrder: 12, optimizedOrder: 9, weightTons: 4.2 },
  { id: "ln-13", boatName: "Escape Velocity", owner: "Linda Sterling", lengthFt: 34, draftFt: 3.2, storageLocation: "Dry Stack", scheduledTime: "11:00 AM", currentOrder: 13, optimizedOrder: 10, weightTons: 7.9 },
  { id: "ln-14", boatName: "Lazy Jacks", owner: "Robert Henderson", lengthFt: 31, draftFt: 4.5, storageLocation: "Acre Storage", scheduledTime: "11:15 AM", currentOrder: 14, optimizedOrder: 12, weightTons: 8.5 },
  { id: "ln-15", boatName: "Wanderlust", owner: "Patricia Fox", lengthFt: 25, draftFt: 2.1, storageLocation: "Rack A1", scheduledTime: "11:30 AM", currentOrder: 15, optimizedOrder: 15, weightTons: 3.0 }
];

// Renewal Pricing Annual Contracts (20 contracts)
// Churn Risk sorted high, then medium, then low
export const initialRenewalContracts: RenewalContract[] = [
  {
    id: "ren-1",
    tenant: "Alexander Wright",
    boatName: "Wind Dancer",
    tenureYears: 2,
    currentRate: 5200,
    recommendedRate: 5400,
    confidenceMin: 5300,
    confidenceMax: 5550,
    confidenceScore: 92,
    churnRisk: "High",
    riskDrivers: ["Rate Increase Sensitivity", "Low Slip Utilization"],
    explanation: "This tenant only used their slip five times last summer and has voiced complaints about general seasonal fee adjustments. High risk of non-renewal if fees increase too aggressively."
  },
  {
    id: "ren-2",
    tenant: "Siren Yacht Club LLC",
    boatName: "Fleet Tender (S/V)",
    tenureYears: 1,
    currentRate: 7800,
    recommendedRate: 8100,
    confidenceMin: 7950,
    confidenceMax: 8300,
    confidenceScore: 89,
    churnRisk: "High",
    riskDrivers: ["Market Comps Divergence", "Maintenance Disputes"],
    explanation: "A new commercial tenant that has actively compared our pricing with nearby city municipal docks. They have an outstanding dispute over washroom facilities maintenance."
  },
  {
    id: "ren-3",
    tenant: "Gregory Vance",
    boatName: "Salty Dog",
    tenureYears: 3,
    currentRate: 4900,
    recommendedRate: 5100,
    confidenceMin: 5000,
    confidenceMax: 5250,
    confidenceScore: 91,
    churnRisk: "High",
    riskDrivers: ["Distance to Marina", "Rate Increase Sensitivity"],
    explanation: "Tenant relocated their primary residence 90 miles inland last autumn. The long commute combined with compounding fuel price increases makes them a severe flight risk."
  },
  {
    id: "ren-4",
    tenant: "Marjorie Jenkins",
    boatName: "Serenity Now",
    tenureYears: 2,
    currentRate: 6100,
    recommendedRate: 6300,
    confidenceMin: 6200,
    confidenceMax: 6450,
    confidenceScore: 87,
    churnRisk: "High",
    riskDrivers: ["Low Slip Utilization", "Market Comps Divergence"],
    explanation: "Their vessel was left in dry yard storage for the majority of last year. Churn risk is high as the owner is actively debating selling the vessel or transferring it closer to a mountain lake house."
  },
  {
    id: "ren-5",
    tenant: "William Sterling",
    boatName: "Nauti-Boy",
    tenureYears: 4,
    currentRate: 5600,
    recommendedRate: 5850,
    confidenceMin: 5750,
    confidenceMax: 6000,
    confidenceScore: 90,
    churnRisk: "Medium",
    riskDrivers: ["Rate Increase Sensitivity", "Maintenance Disputes"],
    explanation: "Tenant had minor service delays during the autumn haul-out cycle, which caused friction. Moderate price sensitivity; a personal follow-up call from the dockmaster is advised."
  },
  {
    id: "ren-6",
    tenant: "Patricia Kelly",
    boatName: "Irish Wake",
    tenureYears: 5,
    currentRate: 5900,
    recommendedRate: 6200,
    confidenceMin: 6050,
    confidenceMax: 6350,
    confidenceScore: 84,
    churnRisk: "Medium",
    riskDrivers: ["Market Comps Divergence", "Low Slip Utilization"],
    explanation: "Owner is satisfied with safety and clean docks, but recently retired and expressed a desire to seek cheaper mooring-buoy options down the bay."
  },
  {
    id: "ren-7",
    tenant: "David Chen",
    boatName: "Zenith",
    tenureYears: 2,
    currentRate: 6800,
    recommendedRate: 7200,
    confidenceMin: 7050,
    confidenceMax: 7350,
    confidenceScore: 86,
    churnRisk: "Medium",
    riskDrivers: ["Distance to Marina", "Rate Increase Sensitivity"],
    explanation: "Frequent commuter who values security and concierge valet service. However, they are sensitive to slip fee percentage increases that outpace consumer price indexes."
  },
  {
    id: "ren-8",
    tenant: "Bradley Cooper",
    boatName: "Starry Night",
    tenureYears: 3,
    currentRate: 5100,
    recommendedRate: 5400,
    confidenceMin: 5250,
    confidenceMax: 5500,
    confidenceScore: 88,
    churnRisk: "Medium",
    riskDrivers: ["Maintenance Disputes", "Rate Increase Sensitivity"],
    explanation: "Disputed a bilge pump replacement service charge in the spring. A slight concession or complimentary detailing credit could solidify this medium-risk renewal."
  },
  {
    id: "ren-9",
    tenant: "Helena Rostova",
    boatName: "Red October",
    tenureYears: 2,
    currentRate: 7400,
    recommendedRate: 7800,
    confidenceMin: 7650,
    confidenceMax: 7950,
    confidenceScore: 85,
    churnRisk: "Medium",
    riskDrivers: ["Market Comps Divergence", "Low Slip Utilization"],
    explanation: "A large yacht owner who travels extensively. They enjoy our premium club facilities but are actively pitched by a competing club offering first-year slip discount promotions."
  },
  {
    id: "ren-10",
    tenant: "Franklin Roosevelt Jr",
    boatName: "Amelia",
    tenureYears: 3,
    currentRate: 6300,
    recommendedRate: 6650,
    confidenceMin: 6500,
    confidenceMax: 6800,
    confidenceScore: 89,
    churnRisk: "Medium",
    riskDrivers: ["Rate Increase Sensitivity", "Distance to Marina"],
    explanation: "Tenant lives outside our primary zip-code zone. While they appreciate our deep-water access, a rate increase must be presented alongside a loyalty parking perk."
  },
  {
    id: "ren-11",
    tenant: "Arthur Pendelton",
    boatName: "King Fisher",
    tenureYears: 12,
    currentRate: 6500,
    recommendedRate: 7000,
    confidenceMin: 6900,
    confidenceMax: 7150,
    confidenceScore: 97,
    churnRisk: "Low",
    riskDrivers: ["Distance to Marina", "Rate Increase Sensitivity"],
    explanation: "Highly loyal tenant of 12 years. Always pays in full by winter. Churn risk is extremely low; renewal rate is set to match general marina cost inflation."
  },
  {
    id: "ren-12",
    tenant: "Thomas Hughes",
    boatName: "Sea Explorer",
    tenureYears: 8,
    currentRate: 5800,
    recommendedRate: 6150,
    confidenceMin: 6000,
    confidenceMax: 6300,
    confidenceScore: 94,
    churnRisk: "Low",
    riskDrivers: ["Market Comps Divergence", "Low Slip Utilization"],
    explanation: "Long-standing member of our marina community. They love their specific finger pier location and are highly unlikely to switch clubs over standard rate adjustments."
  },
  {
    id: "ren-13",
    tenant: "Elizabeth Barrett",
    boatName: "Sonnets of the Sea",
    tenureYears: 6,
    currentRate: 5300,
    recommendedRate: 5650,
    confidenceMin: 5500,
    confidenceMax: 5800,
    confidenceScore: 95,
    churnRisk: "Low",
    riskDrivers: ["Rate Increase Sensitivity", "Maintenance Disputes"],
    explanation: "Low churn risk. Tenant appreciates our clean docks and reliable floating dock infrastructure. Steady renewal recommended with standard security fee adjustment."
  },
  {
    id: "ren-14",
    tenant: "Lawrence of Arabia",
    boatName: "Desert Wind",
    tenureYears: 7,
    currentRate: 8500,
    recommendedRate: 9100,
    confidenceMin: 8950,
    confidenceMax: 9300,
    confidenceScore: 93,
    churnRisk: "Low",
    riskDrivers: ["Distance to Marina", "Rate Increase Sensitivity"],
    explanation: "Premium slip holder who values our deep water channel access above all else. Fully accepts seasonal rate updates in exchange for reserved parking spaces."
  },
  {
    id: "ren-15",
    tenant: "Jonathan Swift",
    boatName: "Gulliver",
    tenureYears: 10,
    currentRate: 4600,
    recommendedRate: 4900,
    confidenceMin: 4800,
    confidenceMax: 5050,
    confidenceScore: 96,
    churnRisk: "Low",
    riskDrivers: ["Rate Increase Sensitivity", "Low Slip Utilization"],
    explanation: "Extremely loyal local resident. Uses their boat almost daily during the summer. Rate adjustment matches standard inflation and local mooring tax."
  },
  {
    id: "ren-16",
    tenant: "Captain Ahab",
    boatName: "Pequod II",
    tenureYears: 15,
    currentRate: 9200,
    recommendedRate: 9800,
    confidenceMin: 9650,
    confidenceMax: 10000,
    confidenceScore: 98,
    churnRisk: "Low",
    riskDrivers: ["Maintenance Disputes", "Market Comps Divergence"],
    explanation: "Permanent commercial charter slip holder. Our marina represents the only suitable deep-keel harbor for their vessel within a 50-mile coastline stretch."
  },
  {
    id: "ren-17",
    tenant: "Grace Hopper",
    boatName: "Bug Finder",
    tenureYears: 5,
    currentRate: 6200,
    recommendedRate: 6550,
    confidenceMin: 6400,
    confidenceMax: 6700,
    confidenceScore: 92,
    churnRisk: "Low",
    riskDrivers: ["Low Slip Utilization", "Rate Increase Sensitivity"],
    explanation: "Steady local tenant who appreciates the reliable Wi-Fi and updated shore power pedestals. Low churn risk."
  },
  {
    id: "ren-18",
    tenant: "Richard Branson",
    boatName: "Necker Breeze",
    tenureYears: 4,
    currentRate: 11500,
    recommendedRate: 12400,
    confidenceMin: 12100,
    confidenceMax: 12700,
    confidenceScore: 91,
    churnRisk: "Low",
    riskDrivers: ["Market Comps Divergence", "Distance to Marina"],
    explanation: "Rents our largest T-head luxury slip. Extremely low rate sensitivity. Highly values the private security gated access and premium concierge support."
  },
  {
    id: "ren-19",
    tenant: "Diana Nyad",
    boatName: "Abyss Explorer",
    tenureYears: 3,
    currentRate: 5400,
    recommendedRate: 5700,
    confidenceMin: 5550,
    confidenceMax: 5850,
    confidenceScore: 93,
    churnRisk: "Low",
    riskDrivers: ["Low Slip Utilization", "Distance to Marina"],
    explanation: "Passionate boater who values direct access to the outer sound. Very stable tenant with a history of prompt seasonal payments."
  },
  {
    id: "ren-20",
    tenant: "Christopher Columbus",
    boatName: "Santa Maria III",
    tenureYears: 9,
    currentRate: 7000,
    recommendedRate: 7450,
    confidenceMin: 7300,
    confidenceMax: 7600,
    confidenceScore: 95,
    churnRisk: "Low",
    riskDrivers: ["Distance to Marina", "Rate Increase Sensitivity"],
    explanation: "Long-term client who prefers our storm protection breakwater layout. Churn probability is negligible."
  }
];
