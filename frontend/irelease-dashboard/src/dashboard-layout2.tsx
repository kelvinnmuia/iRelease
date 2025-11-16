import { useState, ReactNode } from "react"
import { Sidebar } from "./components/layout/sidebar"
import { Header } from "./components/layout/header"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page-specific content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

/*
const menuItems = [
  { icon: PanelsTopLeft, label: "Dashboard", active: true,  path: "/dashboard" },
  { icon: GitBranch, label: "Releases", active: false, path: "/releases" },
  { icon: Bug, label: "SIRs Per Release", active: false, path: "/sirs-per-release" },
  { icon: ChartPie, label: "Monthly Overview", active: false, path: "/monthly-overview" },
  { icon: Calendar, label: "Release Calendar", active: false, path: "/release-calendar" },
  { icon: BarChart3, label: "Reports", active: false, path: "/reports" },
  { icon: Settings, label: "Settings", active: false, path: "/settings" },
]
*/
