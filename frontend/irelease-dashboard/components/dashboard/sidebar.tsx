"use client"
import { LayoutGrid, Briefcase, Users, CheckSquare, Calendar, BarChart3, Settings, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: Briefcase, label: "Jobs" },
  { icon: Users, label: "Candidates" },
  { icon: CheckSquare, label: "Tasks" },
  { icon: Calendar, label: "Calendar" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={onToggle} />}

      <div
        className={cn(
          "fixed lg:static top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50",
          isOpen ? "w-64" : "w-0 lg:w-64 lg:border-r",
          "lg:translate-x-0",
          !isOpen && "lg:w-20",
        )}
      >
        {/* Content wrapper with overflow handling */}
        <div className={cn("p-6 flex flex-col h-full", !isOpen && "lg:p-4")}>
          {/* Logo - hidden when sidebar is collapsed on desktop */}
          <div className={cn("flex items-center gap-2 mb-8 lg:mb-6", !isOpen && "lg:justify-center")}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex-shrink-0"></div>
            {isOpen && <span className="text-xl font-bold text-gray-900">Hirezy</span>}
          </div>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  item.active ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100",
                  !isOpen && "lg:justify-center lg:px-2",
                )}
                title={!isOpen ? item.label : ""}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <button
              className={cn(
                "w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-shadow",
                !isOpen && "lg:aspect-square lg:p-0 lg:flex lg:items-center lg:justify-center",
              )}
            >
              {isOpen ? "Elevate Your Team" : <span className="hidden lg:block">↑</span>}
            </button>
          </div>
        </div>
      </div>

      <button onClick={onToggle} className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-gray-100 rounded-lg">
        {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>
    </>
  )
}
