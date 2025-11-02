import { Search, Bell, MessageCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar"

export function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate, vacancy, etc."
              className="w-60 pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">Andrew Sebastian</p>
              <p className="text-xs text-gray-500">Lead HR</p>
            </div>
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  )
}
