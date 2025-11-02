import { Search, Bell, User, Menu } from "lucide-react"
// import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Search bar */}
    {/*<div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search candidate, vacancy, etc." className="pl-10 text-sm" />
        </div>
      </div>*/}

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search on mobile */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">Andrew Sebastian</p>
            <p className="text-xs text-gray-500">Lead HR</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
