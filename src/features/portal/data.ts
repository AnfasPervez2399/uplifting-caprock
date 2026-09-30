/* Central mock data for the Caprock client portal. */

export interface CashAccount {
  id: string;
  name: string;
  currency: string;
  number: string;
  balance: number;
  status: "active" | "dormant";
  updatedLabel: string;
}

export interface KpiCard {
  id: string;
  label: string;
  amount: number;
  currency: string;
  trendPct: number;
  spark: number[];
  accent: "blue" | "violet" | "emerald" | "amber" | "rose";
  locked?: boolean;
}

export type TxnStatus = "Approved" | "Pending" | "Rejected";
export type GatewayStatus = "Approved" | "Pending" | "Failed";

export interface PortalTransaction {
  id: string;
  datetime: string;
  account: string;
  convertRate: number;
  currency: string;
  debit: number;
  credit: number;
  runningBalance: number;
  status: TxnStatus;
  gateway: GatewayStatus;
  reference: string;
  channel: string;
}

export interface Holding {
  id: string;
  name: string;
  ticker: string;
  assetClass: "Equities" | "Fixed income" | "Alternatives" | "Cash";
  value: number;
  dayPct: number;
  spark: number[];
}

export interface Opportunity {
  id: string;
  name: string;
  region: string;
  strategy: string;
  targetReturn: string;
  minInvestment: string;
  risk: "Conservative" | "Balanced" | "Growth" | "Aggressive";
  status: "Open" | "Review" | "Closing soon";
}

export interface PortalDocument {
  id: string;
  name: string;
  category: "Statements" | "Tax" | "Identity" | "Contracts" | "Reports";
  size: string;
  updated: string;
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  formats: string[];
  accent: "blue" | "violet" | "emerald" | "amber" | "rose";
}

export interface TxnRequest {
  id: string;
  type: "Deposit" | "Withdrawal" | "Internal transfer";
  account: string;
  amount: number;
  currency: string;
  requested: string;
  status: "In review" | "Approved" | "Processing" | "Declined";
}

export interface Transfer {
  id: string;
  asset: string;
  quantity: string;
  from: string;
  to: string;
  lodged: string;
  status: "In transit" | "Settled" | "Action required";
}

export const PORTAL_USER = {
  name: "Alex Morgan",
  firstName: "Alex",
  type: "Individual",
  email: "alex.morgan@example.com",
  phone: "+61 412 345 678",
  address: "Level 12, 44 Martin Place, Sydney NSW 2000",
  memberSince: "March 2021",
  adviser: "Priya Nair",
  adviserRole: "Private Wealth Adviser",
  verified: true,
};

export const CURRENCIES = [
  "AUD",
  "USD",
  "EUR",
  "GBP",
  "SGD",
  "JPY",
  "INR",
  "NZD",
];

/** Convert one unit of currency into AUD (mock rates). */
export const TO_AUD: Record<string, number> = {
  AUD: 1,
  USD: 1.52,
  EUR: 1.65,
  GBP: 1.94,
  SGD: 1.13,
  JPY: 0.0098,
  INR: 0.018,
  NZD: 0.92,
  AFN: 0.021,
  XCD: 0.56,
};

const SYMBOLS: Record<string, string> = {
  AUD: "$",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
  JPY: "¥",
  INR: "₹",
  NZD: "$",
};

export function fmtMoney(
  amount: number,
  currency = "AUD",
  decimals = 2,
): string {
  const symbol = SYMBOLS[currency];
  const grouped = amount.toLocaleString("en-AU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return symbol ? `${symbol}${grouped}` : `${currency} ${grouped}`;
}

export function fmtCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000)
    return `$${(amount / 1_000_000).toFixed(1)}m`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(1)}k`;
  return `$${amount.toFixed(0)}`;
}

export const CASH_ACCOUNTS: CashAccount[] = [
  {
    id: "344",
    name: "Cash Account 1 new ok",
    currency: "AUD",
    number: "AMZN12345",
    balance: 91053891.56,
    status: "active",
    updatedLabel: "Updated 2h ago",
  },
  {
    id: "957",
    name: "Cash Account 4 updated",
    currency: "AFN",
    number: "AFN-00957",
    balance: 40.0,
    status: "active",
    updatedLabel: "Updated 5h ago",
  },
  {
    id: "892",
    name: "cash account 2 updated",
    currency: "INR",
    number: "AMZN12346",
    balance: 99529794.85,
    status: "active",
    updatedLabel: "Updated yesterday",
  },
  {
    id: "955",
    name: "X Account",
    currency: "XCD",
    number: "XCD-00955",
    balance: 24.84,
    status: "dormant",
    updatedLabel: "Dormant since Jun",
  },
  {
    id: "956",
    name: "Cash Account 3",
    currency: "EUR",
    number: "EUR-00956",
    balance: 6887.7,
    status: "active",
    updatedLabel: "Updated 3d ago",
  },
  {
    id: "958",
    name: "727726",
    currency: "GBP",
    number: "GBP-00958",
    balance: 137.14,
    status: "active",
    updatedLabel: "Updated 3d ago",
  },
  {
    id: "959",
    name: "Operating Reserve",
    currency: "USD",
    number: "USD-00959",
    balance: 1240500.0,
    status: "active",
    updatedLabel: "Updated 1w ago",
  },
  {
    id: "960",
    name: "Term Deposit Sweep",
    currency: "AUD",
    number: "AUD-00960",
    balance: 5000000.0,
    status: "active",
    updatedLabel: "Updated 1w ago",
  },
];

export const KPI_CARDS: KpiCard[] = [
  {
    id: "cash",
    label: "Cash Account",
    amount: 93041765.87,
    currency: "AUD",
    trendPct: 4.2,
    spark: [12, 18, 15, 22, 26, 24, 31, 38],
    accent: "blue",
  },
  {
    id: "wealth",
    label: "Private Wealth Account",
    amount: 711566.38,
    currency: "AUD",
    trendPct: 1.8,
    spark: [20, 22, 21, 25, 24, 28, 30, 33],
    accent: "violet",
  },
  {
    id: "invest",
    label: "My Investments",
    amount: 284592.4,
    currency: "AUD",
    trendPct: 2.4,
    spark: [30, 27, 29, 26, 30, 34, 33, 38],
    accent: "emerald",
  },
  {
    id: "commod",
    label: "Private Wealth (Commodities)",
    amount: 148220.0,
    currency: "AUD",
    trendPct: 6.1,
    spark: [10, 14, 22, 18, 26, 24, 32, 40],
    accent: "amber",
    locked: true,
  },
  {
    id: "secur",
    label: "My Investment (Securities)",
    amount: 96120.75,
    currency: "AUD",
    trendPct: -0.6,
    spark: [34, 32, 35, 30, 31, 28, 29, 26],
    accent: "rose",
  },
];

/** Private wealth mandates — balances reconcile to the wealth KPI ($711,566.38). */
export const WEALTH_ACCOUNTS: CashAccount[] = [
  {
    id: "PW-11024",
    name: "Balanced Growth Mandate",
    currency: "AUD",
    number: "PW-11024",
    balance: 486566.38,
    status: "active",
    updatedLabel: "Valued today",
  },
  {
    id: "PW-11025",
    name: "Conservative Income Mandate",
    currency: "AUD",
    number: "PW-11025",
    balance: 225000.0,
    status: "active",
    updatedLabel: "Valued today",
  },
];

/** Securities positions — values reconcile to the securities KPI ($96,120.75). */
export const SECURITIES: Holding[] = [
  {
    id: "s1",
    name: "BHP Group Ltd",
    ticker: "BHP",
    assetClass: "Equities",
    value: 58320.75,
    dayPct: 0.8,
    spark: [40, 42, 41, 45, 44, 48, 47, 51],
  },
  {
    id: "s2",
    name: "Vanguard ASX 300",
    ticker: "VAS",
    assetClass: "Equities",
    value: 37800.0,
    dayPct: 0.3,
    spark: [30, 31, 30, 32, 31, 33, 32, 34],
  },
];

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Monthly portfolio balance in AUD millions (mock 12-month series). */
export const BALANCE_SERIES = [
  88.4, 88.9, 89.5, 89.1, 90.2, 90.8, 91.3, 91.0, 91.9, 92.4, 92.1, 93.0,
];
export const DEPOSIT_SERIES = [
  4.2, 2.8, 5.6, 1.4, 3.9, 6.2, 2.2, 4.8, 3.1, 5.2, 2.6, 4.4,
];
export const WITHDRAWAL_SERIES = [
  1.1, 2.4, 0.8, 2.9, 1.6, 0.9, 2.2, 1.4, 2.7, 1.0, 1.9, 1.2,
];

export const TRANSACTIONS: PortalTransaction[] = [
  {
    id: "CBBF1F3E08A240",
    datetime: "03/11/2025 | 14:43:33",
    account: "Cash Account 1 new ok",
    convertRate: 1.0,
    currency: "AUD",
    debit: 0,
    credit: 0,
    runningBalance: 0,
    status: "Approved",
    gateway: "Pending",
    reference: "WEB-88412",
    channel: "Approved Web",
  },
  {
    id: "E47B30214D9F48",
    datetime: "07/10/2025 | 19:19:53",
    account: "Cash Account 1 new ok",
    convertRate: 0.68,
    currency: "AUD",
    debit: 120,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Rejected",
    gateway: "Pending",
    reference: "WEB-87901",
    channel: "Client portal",
  },
  {
    id: "60F9D3160C9844",
    datetime: "03/10/2025 | 20:21:43",
    account: "Cash Account 1 new ok",
    convertRate: 0.68,
    currency: "AUD",
    debit: 1,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Pending",
    gateway: "Pending",
    reference: "WEB-87744",
    channel: "Client portal",
  },
  {
    id: "1DC109AC417F49",
    datetime: "03/10/2025 | 20:04:55",
    account: "Cash Account 1 new ok",
    convertRate: 0.68,
    currency: "AUD",
    debit: 1,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Rejected",
    gateway: "Pending",
    reference: "WEB-87739",
    channel: "Client portal",
  },
  {
    id: "8D362675EB2443",
    datetime: "02/10/2025 | 10:45:19",
    account: "Cash Account 1 new ok",
    convertRate: 0.68,
    currency: "AUD",
    debit: 90,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Pending",
    gateway: "Pending",
    reference: "WEB-87602",
    channel: "Mobile app",
  },
  {
    id: "1CD226701A2546",
    datetime: "02/10/2025 | 10:44:48",
    account: "Cash Account 1 new ok",
    convertRate: 0.68,
    currency: "AUD",
    debit: 70,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Pending",
    gateway: "Pending",
    reference: "WEB-87601",
    channel: "Mobile app",
  },
  {
    id: "33B3AD07486848",
    datetime: "01/10/2025 | 22:00:41",
    account: "Cash Account 1 new ok",
    convertRate: 1.47,
    currency: "EUR",
    debit: 0,
    credit: 880,
    runningBalance: 91053891.56,
    status: "Pending",
    gateway: "Pending",
    reference: "FX-55210",
    channel: "FX desk",
  },
  {
    id: "170C129B4D3C44",
    datetime: "01/10/2025 | 14:21:08",
    account: "Cash Account 1 new ok",
    convertRate: 1.0,
    currency: "AUD",
    debit: 60,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Pending",
    gateway: "Pending",
    reference: "WEB-87518",
    channel: "Client portal",
  },
  {
    id: "F10A5E5C92EB42",
    datetime: "01/10/2025 | 11:02:51",
    account: "Cash Account 1 new ok",
    convertRate: 1.0,
    currency: "AUD",
    debit: 59.93,
    credit: 0,
    runningBalance: 91053891.56,
    status: "Approved",
    gateway: "Approved",
    reference: "WEB-87502",
    channel: "Client portal",
  },
  {
    id: "9A41BC77D201AA",
    datetime: "29/09/2025 | 16:40:12",
    account: "Operating Reserve",
    convertRate: 1.52,
    currency: "USD",
    debit: 0,
    credit: 250000,
    runningBalance: 1240500.0,
    status: "Approved",
    gateway: "Approved",
    reference: "WIR-33198",
    channel: "Wire transfer",
  },
  {
    id: "77D2E90B11C4F0",
    datetime: "28/09/2025 | 09:15:44",
    account: "Cash Account 3",
    convertRate: 1.65,
    currency: "EUR",
    debit: 1250,
    credit: 0,
    runningBalance: 6887.7,
    status: "Approved",
    gateway: "Approved",
    reference: "SEPA-8812",
    channel: "SEPA",
  },
  {
    id: "51BC4A09E883D2",
    datetime: "25/09/2025 | 13:58:02",
    account: "Term Deposit Sweep",
    convertRate: 1.0,
    currency: "AUD",
    debit: 0,
    credit: 50000,
    runningBalance: 5000000.0,
    status: "Approved",
    gateway: "Approved",
    reference: "INT-12045",
    channel: "Internal sweep",
  },
  {
    id: "30F8C1D77A55B9",
    datetime: "22/09/2025 | 10:11:37",
    account: "727726",
    convertRate: 1.94,
    currency: "GBP",
    debit: 320.5,
    credit: 0,
    runningBalance: 137.14,
    status: "Rejected",
    gateway: "Failed",
    reference: "WEB-86990",
    channel: "Client portal",
  },
  {
    id: "B4E6A2C19D03F7",
    datetime: "19/09/2025 | 15:27:29",
    account: "cash account 2 updated",
    convertRate: 0.018,
    currency: "INR",
    debit: 0,
    credit: 1200000,
    runningBalance: 99529794.85,
    status: "Approved",
    gateway: "Approved",
    reference: "UPI-77341",
    channel: "UPI rail",
  },
];

export const HOLDINGS: Holding[] = [
  {
    id: "h1",
    name: "Caprock Global Equity Fund",
    ticker: "CGEF",
    assetClass: "Equities",
    value: 128066.58,
    dayPct: 1.2,
    spark: [22, 25, 24, 28, 31, 30, 34, 38],
  },
  {
    id: "h2",
    name: "Australian Fixed Interest",
    ticker: "AUFI",
    assetClass: "Fixed income",
    value: 71148.1,
    dayPct: 0.1,
    spark: [30, 30, 31, 31, 32, 32, 33, 33],
  },
  {
    id: "h3",
    name: "Asia Pacific Growth Mandate",
    ticker: "APGM",
    assetClass: "Equities",
    value: 42688.86,
    dayPct: -0.4,
    spark: [36, 34, 35, 32, 33, 31, 30, 29],
  },
  {
    id: "h4",
    name: "Private Credit Opportunities",
    ticker: "PCO",
    assetClass: "Alternatives",
    value: 28459.24,
    dayPct: 0.6,
    spark: [18, 20, 19, 23, 22, 26, 25, 28],
  },
  {
    id: "h5",
    name: "AUD Cash & Term Deposits",
    ticker: "CASH",
    assetClass: "Cash",
    value: 14229.62,
    dayPct: 0.0,
    spark: [25, 25, 25, 25, 25, 25, 25, 25],
  },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1",
    name: "Cross-border Mandate Network",
    region: "Americas",
    strategy: "Private markets",
    targetReturn: "9–12% p.a.",
    minInvestment: "$250,000",
    risk: "Growth",
    status: "Open",
  },
  {
    id: "o2",
    name: "MEA Real Assets Income",
    region: "MEA",
    strategy: "Real assets",
    targetReturn: "7–9% p.a.",
    minInvestment: "$100,000",
    risk: "Balanced",
    status: "Open",
  },
  {
    id: "o3",
    name: "APAC Growth Equity",
    region: "APAC",
    strategy: "Growth equity",
    targetReturn: "10–14% p.a.",
    minInvestment: "$500,000",
    risk: "Aggressive",
    status: "Closing soon",
  },
  {
    id: "o4",
    name: "European Green Infrastructure",
    region: "Europe",
    strategy: "Infrastructure",
    targetReturn: "6–8% p.a.",
    minInvestment: "$150,000",
    risk: "Conservative",
    status: "Review",
  },
  {
    id: "o5",
    name: "Global Private Credit II",
    region: "Global",
    strategy: "Private credit",
    targetReturn: "8–11% p.a.",
    minInvestment: "$250,000",
    risk: "Balanced",
    status: "Open",
  },
  {
    id: "o6",
    name: "Systematic Commodities Alpha",
    region: "Global",
    strategy: "Commodities",
    targetReturn: "11–15% p.a.",
    minInvestment: "$1,000,000",
    risk: "Aggressive",
    status: "Review",
  },
];

export const DOCUMENTS: PortalDocument[] = [
  {
    id: "d1",
    name: "Consolidated Valuation — Aug 2026.pdf",
    category: "Statements",
    size: "1.2 MB",
    updated: "02 Sep 2026",
  },
  {
    id: "d2",
    name: "Cash Account 344 Statement — Aug 2026.pdf",
    category: "Statements",
    size: "640 KB",
    updated: "01 Sep 2026",
  },
  {
    id: "d3",
    name: "Annual Tax Summary FY25.pdf",
    category: "Tax",
    size: "890 KB",
    updated: "18 Aug 2026",
  },
  {
    id: "d4",
    name: "Identity Verification Record.pdf",
    category: "Identity",
    size: "310 KB",
    updated: "04 Mar 2021",
  },
  {
    id: "d5",
    name: "Advisory Services Agreement.pdf",
    category: "Contracts",
    size: "1.8 MB",
    updated: "04 Mar 2021",
  },
  {
    id: "d6",
    name: "Private Wealth Mandate Update Q2.pdf",
    category: "Reports",
    size: "2.4 MB",
    updated: "21 Jul 2026",
  },
  {
    id: "d7",
    name: "Cost Basis Report FY25.csv",
    category: "Tax",
    size: "220 KB",
    updated: "18 Aug 2026",
  },
  {
    id: "d8",
    name: "Term Deposit Confirmation 960.pdf",
    category: "Contracts",
    size: "410 KB",
    updated: "09 Aug 2026",
  },
];

export const REPORT_TYPES: ReportType[] = [
  {
    id: "r1",
    name: "Portfolio Valuation",
    description:
      "Holdings, cash balances and total wealth across every account.",
    formats: ["PDF", "Excel"],
    accent: "blue",
  },
  {
    id: "r2",
    name: "Transaction Activity",
    description: "Every debit, credit and FX conversion for any date range.",
    formats: ["PDF", "CSV"],
    accent: "emerald",
  },
  {
    id: "r3",
    name: "Tax & Cost Basis",
    description: "Realised gains, income and end-of-year tax summaries.",
    formats: ["PDF", "Excel"],
    accent: "violet",
  },
  {
    id: "r4",
    name: "Performance Attribution",
    description: "Returns broken down by asset class, mandate and adviser.",
    formats: ["PDF"],
    accent: "amber",
  },
];

export const TXN_REQUESTS: TxnRequest[] = [
  {
    id: "REQ-2041",
    type: "Deposit",
    account: "Cash Account 1 new ok",
    amount: 250000,
    currency: "AUD",
    requested: "27 Sep 2026",
    status: "In review",
  },
  {
    id: "REQ-2038",
    type: "Withdrawal",
    account: "Operating Reserve",
    amount: 40000,
    currency: "USD",
    requested: "24 Sep 2026",
    status: "Processing",
  },
  {
    id: "REQ-2031",
    type: "Internal transfer",
    account: "Term Deposit Sweep → Cash Account 1",
    amount: 500000,
    currency: "AUD",
    requested: "19 Sep 2026",
    status: "Approved",
  },
  {
    id: "REQ-2027",
    type: "Withdrawal",
    account: "727726",
    amount: 5000,
    currency: "GBP",
    requested: "15 Sep 2026",
    status: "Declined",
  },
];

export const TRANSFERS: Transfer[] = [
  {
    id: "IT-8812",
    asset: "BHP Group Ltd (BHP) × 4,200",
    quantity: "4,200 units",
    from: "External broker — AUS",
    to: "My Investment (Securities)",
    lodged: "26 Sep 2026",
    status: "In transit",
  },
  {
    id: "IT-8795",
    asset: "Vanguard ASX 300 (VAS) × 12,000",
    quantity: "12,000 units",
    from: "External broker — AUS",
    to: "My Investment (Securities)",
    lodged: "18 Sep 2026",
    status: "Settled",
  },
  {
    id: "IT-8771",
    asset: "Gold bullion (XAU) 12.5kg",
    quantity: "12.5 kg",
    from: "Vault — Singapore",
    to: "Private Wealth (Commodities)",
    lodged: "09 Sep 2026",
    status: "Action required",
  },
];

export const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Deposit request approved",
    detail: "REQ-2031 · $500,000 internal transfer completed.",
    time: "12 min ago",
    tone: "emerald" as const,
  },
  {
    id: "n2",
    title: "New tax document ready",
    detail: "Cost Basis Report FY25 is available in My Documents.",
    time: "3 h ago",
    tone: "blue" as const,
  },
  {
    id: "n3",
    title: "Action required: bullion transfer",
    detail: "IT-8771 needs vault release confirmation.",
    time: "Yesterday",
    tone: "amber" as const,
  },
  {
    id: "n4",
    title: "APAC Growth Equity closing soon",
    detail: "Mandate capacity is 94% subscribed.",
    time: "2 days ago",
    tone: "violet" as const,
  },
];

export const TIMELINE = [
  {
    id: "t1",
    label: "Internal transfer completed",
    detail: "$500,000 → Cash Account 1 new ok",
    time: "Today, 09:42",
    tone: "emerald" as const,
  },
  {
    id: "t2",
    label: "Withdrawal request lodged",
    detail: "REQ-2038 · US$40,000 · in processing",
    time: "Yesterday, 16:05",
    tone: "blue" as const,
  },
  {
    id: "t3",
    label: "Dividend received",
    detail: "CGEF distribution · $1,842.10",
    time: "24 Sep, 11:20",
    tone: "violet" as const,
  },
  {
    id: "t4",
    label: "New document issued",
    detail: "August consolidated valuation",
    time: "02 Sep, 08:00",
    tone: "amber" as const,
  },
];

export const RANGE_POINTS: Record<string, number> = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  All: 12,
};
