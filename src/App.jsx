import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  CheckSquare,
  PackageCheck,
  RotateCcw,
  GitBranch,
  Workflow,
  DollarSign,
  Cloud,
  GitCompareArrows,
  ListTree,
  BookText,
  ScrollText,
  FileQuestion,
  HelpCircle,
  ArrowUpRight,
  Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AgeChip, statusFromHours } from "@/components/shared/AgeChip"
import Header from "./components/shared/Header"
// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const kpis = [
  {
    label: "Pending your action",
    value: 2,
    icon: CheckSquare,
    detail: "1 overdue",
    detailStatus: "overdue",
    footnote: "You're the assigned approver, no decision yet",
  },
  {
    label: "Approvals overdue system-wide",
    value: 2,
    icon: Workflow,
    detail: "Oldest: 3d 7h",
    detailStatus: "overdue",
    footnote: "Any approver, not just you",
  },
  {
    label: "Ready for next release",
    value: 3,
    icon: PackageCheck,
    detail: "v7 · 6d ago",
    detailStatus: "ready",
    footnote: "Approved + versioned, not yet released",
  },
  {
    label: "Your uploads pending >48h",
    value: 1,
    icon: Upload,
    detail: "3d 7h",
    detailStatus: "overdue",
    footnote: "scaler_migration_paths · awaiting approver",
  },
]

const approvals = [
  {
    file: "aws_rules.json",
    version: "v1.2",
    app: "CCA / AWS",
    submitter: "Contributor A",
    age: "2d 3h",
    hours: 51,
    action: "Review",
  },
  {
    file: "scaler_migration_paths.xlsx",
    version: "v3.1",
    app: "Scaler / All",
    submitter: "Contributor B",
    age: "1d 6h",
    hours: 30,
    action: "Open",
  },
]

const activity = [
  {
    text: "Release v7 created — 6 files tagged",
    by: "System",
    time: "20 Jun 09:00",
    tone: "ready",
  },
  {
    text: "Validation failed: gcp_rules.json v1.1 — 3 schema errors",
    by: "Contributor C",
    time: "19 Jun 16:42",
    tone: "overdue",
  },
  {
    text: "azure_rules.json v2.0 approved",
    by: "Approver 1",
    time: "19 Jun 11:15",
    tone: "ready",
  },
  {
    text: "recommendation_remarks_EIA.xlsx v4.1 submitted",
    by: "Contributor D",
    time: "18 Jun 14:03",
    tone: "info",
  },
  {
    text: "Rollback: scaler_migration_paths → v2.9",
    by: "Pre-release decision",
    time: "17 Jun 22:10",
    tone: "warning",
  },
]

const nav = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "File Catalog", icon: FolderOpen },
    ],
  },
  {
    heading: "Workflow",
    items: [
      { label: "Upload & Validate", icon: Upload },
      { label: "Approvals", icon: CheckSquare, badge: 6 },
      { label: "Release", icon: PackageCheck },
      { label: "Rollback", icon: RotateCcw },
      { label: "Traceability", icon: GitBranch },
      { label: "Lineage", icon: GitCompareArrows },
    ],
  },
  {
    heading: "Data",
    items: [
      { label: "Pricing Data", icon: DollarSign },
      { label: "Scaler Data", icon: Cloud },
      { label: "Flow Diagram", icon: ListTree },
      { label: "All Scenarios", icon: Workflow },
      { label: "Business Rules", icon: BookText },
    ],
  },
  {
    heading: "Reference",
    items: [
      { label: "Audit Log", icon: ScrollText },
      { label: "Docs", icon: FileQuestion },
      { label: "Glossary", icon: BookText },
      { label: "Help", icon: HelpCircle },
    ],
  },
]

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1">
          <SubHeader />
          <main className="mx-auto max-w-7xl px-6 py-8">
            <KpiRow />
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
              <ApprovalsTable />
              <ActivityFeed />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <Cpu className="h-5 w-5 text-sidebar-primary" strokeWidth={2.25} />
        <div>
          <p className="text-sm font-semibold leading-tight">EPYC Input File Tracking</p>
          <p className="text-xs text-sidebar-foreground/50">Governance Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {nav.map((section) => (
          <div key={section.heading}>
            <p className="px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    item.active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4" strokeWidth={2} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-status-overdue/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-status-overdue-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function SubHeader() {
  return (
    <header className="px-6 py-5">
      <h1 className="text-xs text-primary font-bold tracking-tight">Input File Governance</h1>
      <h1 className="text-2xl font-bold tracking-tight">File Governance Dashboard</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
       Live status of all governed input files across CCA, EIA, and Scaler applications.
      </p>
    </header>
  )
}

// ---------------------------------------------------------------------------
// KPI Row
// ---------------------------------------------------------------------------

function KpiRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-lg border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <kpi.icon className="h-4 w-4 text-muted-foreground/60" strokeWidth={2} />
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{kpi.value}</p>
          <div className="mt-3 flex items-center justify-between">
            <AgeChip age={kpi.detail} status={kpi.detailStatus} />
          </div>
          <p className="mt-2 text-xs leading-snug text-muted-foreground/80">{kpi.footnote}</p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Approvals table ("Pending your action")
// ---------------------------------------------------------------------------

function ApprovalsTable() {
  return (
    <section className="rounded-lg border border-border bg-card lg:col-span-3">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Pending your action</h2>
          <p className="text-xs text-muted-foreground">
            You are assigned approver and haven't acted yet.
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">View all</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">File</th>
            <th className="px-2 py-2.5 font-medium">App / Cloud</th>
            <th className="px-2 py-2.5 font-medium">Submitted by</th>
            <th className="px-2 py-2.5 font-medium">Age</th>
            <th className="px-5 py-2.5 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((row) => (
            <tr key={row.file} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <span className="font-mono text-xs text-foreground">{row.file}</span>{" "}
                <span className="font-mono text-xs text-muted-foreground">{row.version}</span>
              </td>
              <td className="px-2 py-3 text-muted-foreground">{row.app}</td>
              <td className="px-2 py-3 text-muted-foreground">{row.submitter}</td>
              <td className="px-2 py-3">
                <AgeChip age={row.age} status={statusFromHours(row.hours)} />
              </td>
              <td className="px-5 py-3 text-right">
                <button className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  {row.action}
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

function ActivityFeed() {
  return (
    <section className="rounded-lg border border-border bg-card lg:col-span-2">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Recent activity</h2>
      </div>
      <ol className="divide-y divide-border">
        {activity.map((item, i) => (
          <li key={i} className="flex gap-3 px-5 py-3">
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                item.tone === "ready" && "bg-status-ready",
                item.tone === "overdue" && "bg-status-overdue",
                item.tone === "warning" && "bg-status-warning",
                item.tone === "info" && "bg-status-info"
              )}
            />
            <div className="min-w-0">
              <p className="text-sm leading-snug text-foreground">{item.text}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {item.by} · {item.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}