import { Link, useLocation } from "react-router-dom"
import type { SidebarItem } from "./sidebar.types"
import { BookOpen, Car, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react"

const menuItems: SidebarItem[] = [
    { label: "Dashboard Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Garage Approvals", path: "/garage-approvals", icon: Car },
    { label: "Users Management", path: "/users", icon: Users },
    { label: "Educational Content", path: "/educational-content", icon: BookOpen },
    { label: "Community Moderation", path: "/community-moderation", icon: ShieldCheck },
    { label: "Settings", path: "/settings", icon: Settings },
]


const Sidebar = () => {
    const location = useLocation()

    return (
        <div className="w-64 min-w-[16rem] flex-shrink-0 bg-white shadow-md p-4">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

            <ul className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    const Icon = item.icon

                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-2 p-2 rounded transition ${isActive
                                        ? "bg-yellow-100 text-black font-medium"
                                        : "hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />  
                                {item.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Sidebar