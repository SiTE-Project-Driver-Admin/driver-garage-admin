import { Bell, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { HeaderProps } from "./header.types"
import { getCurrentAdmin } from "../../../application/useCases/loginAdmin"
import { useNotifications } from "../../hooks/useNotifications"


const Header = ({ title = "Dashboard", onLogout }: HeaderProps) => {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const admin = getCurrentAdmin()
  const { unreadCount } = useNotifications()

  const displayName = admin?.name ?? "Admin"
  const roleLabel =
    admin?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : admin?.role === "ADMIN"
        ? "Admin"
        : ""
  const initials =
    displayName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD"

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm border-b relative">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/notifications")}
          className="relative hover:text-yellow-500 transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:text-yellow-500 transition"
          >
            <div className="w-9 h-9 rounded-full bg-yellow-400 text-black flex items-center justify-center font-semibold text-sm">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-800 font-medium leading-tight">
                {displayName}
              </p>
              {roleLabel && (
                <p className="text-xs text-gray-500 leading-tight">
                  {roleLabel}
                </p>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10">
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header
