import { Outlet, useNavigate, useLocation } from "react-router-dom"
import Sidebar from "../sidebar/sidebar"
import Header from "../header/header"
import { headerTitles } from "../header/headerTitles"
import { logoutAdmin } from "../../../application/useCases/loginAdmin"

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logoutAdmin()
    navigate("/")
  }

  const currentTitle = headerTitles[location.pathname] || "Dashboard"

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header title={currentTitle} onLogout={handleLogout} />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}