import { Menu } from "lucide-react"
// import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="h-16 bg-red-600 border-b border-gray-200 flex items-center justify-center px-4 md:px-6 gap-4">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="absolute left-4 md:hidden" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
      </div>
    </header>
  )
}
