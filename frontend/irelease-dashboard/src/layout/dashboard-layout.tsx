import { useState, ReactNode } from "react"
import { Sidebar } from "../components/dashboard/sidebar"
import { Header } from "../components/dashboard/header"

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
