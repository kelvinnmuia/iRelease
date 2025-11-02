import { X, LayoutDashboard, Briefcase, Users, CheckSquare, Calendar, BarChart3, Settings } from "lucide-react"
import logo from "../../assets/iRelease-mlogo.png"
// import favicon from "../../assets/iRelease-fav.png"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Briefcase, label: "Releases", active: false },
  { icon: Users, label: "SIRs Per Release", active: false },
  { icon: CheckSquare, label: "Monthly Overview", active: false },
  { icon: Calendar, label: "Release Calendar", active: false },
  { icon: BarChart3, label: "Reports", active: false },
  { icon: Settings, label: "Settings", active: false },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:relative md:translate-x-0 top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto",
          "w-64 md:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between border-b border-gray-200 px-4 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            {/*<div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-green-400 rounded flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="font-bold text-lg">iRelease</span>*/}
            <img src={logo} alt="iRelease logo" className="flex items-center justify-center h-50 w-50" />
            {/*<span><img src={logo} alt="iRelease Logo" className="h-35 w-35" /></span>*/}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggle}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                  item.active ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={onToggle} />}
    </>
  )
}
