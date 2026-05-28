import { useEffect, useMemo, useState } from "react"
import { type Column } from "../components/table/table.types"
import { type User } from "../../domain/entities/UserManagement"
import { type Admin } from "../../domain/entities/Admin"
import { UserManagementRepositoryImpl } from "../../infrastructure/repositories/UserManagementRepositoryImpl"
import { AdminRepositoryImpl } from "../../infrastructure/repositories/AdminRepositoryImpl"
import Table from "../components/table/table"
import Input from "../components/input/input"
import Button from "../components/button/button"
import Dialog from "../components/dialogBox/dialogBox"
import { SearchUsersUseCase } from "../../application/useCases/UserManagement/searchUsers"
import { ListAdminsUseCase } from "../../application/useCases/Admin/listAdmins"
import { CreateAdminUseCase } from "../../application/useCases/Admin/createAdmin"
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"
import Card from "../components/card/card"
import { isSuperAdmin } from "../../application/useCases/loginAdmin"

type Tab = "USERS" | "ADMINS"

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("USERS")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="users-page-title">Users Management</h1>
        <p className="text-gray-500" data-testid="users-page-subtitle">
          Manage platform users and admin accounts
        </p>
      </div>

      <div className="flex gap-6 border-b">
        <TabButton
          label="Users"
          active={activeTab === "USERS"}
          onClick={() => setActiveTab("USERS")}
        />
        <TabButton
          label="Admins"
          active={activeTab === "ADMINS"}
          onClick={() => setActiveTab("ADMINS")}
        />
      </div>

      {activeTab === "USERS" ? <UsersTab /> : <AdminsTab />}
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 -mb-px px-1 font-medium transition border-b-2 ${active
        ? "border-yellow-400 text-black"
        : "border-transparent text-gray-500 hover:text-black"
        }`}
    >
      {label}
    </button>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWarnDialog, setShowWarnDialog] = useState(false)
  const handleWarnClick = (id: string) => {
    setSelectedUserId(id)
    setWarnReason("")
    setShowWarnDialog(true)
  }

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null)

  const [warnReason, setWarnReason] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    warned: 0,
    blocked: 0,
  })
  const fetchUsersAndStats = async () => {
    setLoading(true)

    try {
      const [usersData, statsData] = await Promise.all([
        repository.findAll(),
        repository.getStats(),
      ])

      setUsers(usersData)
      setStats(statsData)

    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load users"

      setError(message)

    } finally {
      setLoading(false)
    }
  }

  const repository = useMemo(() => new UserManagementRepositoryImpl(), [])

  useEffect(() => {
    fetchUsersAndStats()
  }, [])

  const handleSearch = async (term: string) => {
    setSearch(term)
    if (!term) {
      const data = await repository.findAll()
      setUsers(data)
      return
    }
    const useCase = new SearchUsersUseCase(repository)
    const results = await useCase.execute(term)
    setUsers(results)
  }

  const handleConfirmWarn = async () => {
    if (!selectedUserId || !warnReason.trim()) return

    try {
      await repository.warnUser(
        selectedUserId,
        warnReason
      )

      await fetchUsersAndStats()

      setShowWarnDialog(false)
      setWarnReason("")
      setSelectedUserId(null)

    } catch (err: any) {
      setError(err.message ?? "Failed to warn user")
    }
  }
  const handleBlock = async (id: string) => {
    await repository.blockUser(id)
    await fetchUsersAndStats()
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    BLOCKED: "bg-red-100 text-red-700",
    WARNED: "bg-yellow-100 text-yellow-700",
  }

  const columns: Column<User>[] = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded ${statusColors[value as string]}`}>
          {value as string}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Join Date",
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "id",
      title: "Actions",
      render: (_value, row) => (
        <div className="flex gap-2">
          <Button
            variant="link"
            onClick={() => handleWarnClick(row.id)}
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
          <Button variant="link" onClick={() => handleBlock(row.id)}>
            <Ban className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) return <p>Loading users...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card
          title="Total Users"
          value={stats.total}
          icon={<Users className="w-6 h-6" />}
          data-testid="stat-total-users"
        />
        <Card
          title="Active Users"
          value={stats.active}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          color="text-green-600"
          data-testid="stat-active-users"
        />
        <Card
          title="Warned Users"
          value={stats.warned}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
          color="text-yellow-600"
          data-testid="stat-warned-users"
        />
        <Card
          title="Blocked Users"
          value={stats.blocked}
          icon={<Ban className="w-6 h-6 text-red-500" />}
          color="text-red-600"
          data-testid="stat-blocked-users"
        />
      </div>

      <Input
        type="text"
        placeholder="Search users by name or email..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Dialog
        isOpen={showWarnDialog}
        onClose={() => setShowWarnDialog(false)}
        title="Warn User"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowWarnDialog(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirmWarn}
            >
              Send Warning
            </Button>
          </>
        }
      >
        <div className="space-y-4">

          <p className="text-sm text-gray-600">
            Please provide a reason for warning this user.
          </p>

          <textarea
            value={warnReason}
            onChange={(e) => setWarnReason(e.target.value)}
            placeholder="Enter warning reason..."
            className="w-full border rounded-lg p-3 outline-none min-h-[120px]"
          />

        </div>
      </Dialog>

      {users.length === 0 && search ? (
        <p className="text-gray-500">No users found for "{search}"</p>
      ) : (
        <Table columns={columns} data={users} data-testid="users-table" />
      )}
    </div>
  )
}

function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const canManage = isSuperAdmin()
  const repository = useMemo(() => new AdminRepositoryImpl(), [])

  useEffect(() => {
    if (!canManage) return
    const fetchAdmins = async () => {
      setLoading(true)
      try {
        const useCase = new ListAdminsUseCase(repository)
        const data = await useCase.execute()
        setAdmins(data)
      } catch (err) {
        const message =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ??
          (err instanceof Error ? err.message : "Failed to load admins")
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchAdmins()
  }, [repository, canManage])

  const filteredAdmins = useMemo(() => {
    if (!search) return admins
    const term = search.toLowerCase()
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term)
    )
  }, [admins, search])

  const stats = useMemo(() => {
    const total = admins.length
    const superCount = admins.filter((a) => a.role === "SUPER_ADMIN").length
    return { total, active: total, superCount }
  }, [admins])

  const handleOpenDialog = () => {
    setForm({ name: "", email: "", password: "" })
    setFormError(null)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setFormError(null)
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Name, email and password are required")
      return
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }
    setSaving(true)
    try {
      const useCase = new CreateAdminUseCase(repository)
      const created = await useCase.execute({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setAdmins((prev) => [created, ...prev])
      setDialogOpen(false)
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        (err instanceof Error ? err.message : "Failed to create admin")
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-green-100 text-green-700",
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
  }
  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin",
  }

  const columns: Column<Admin>[] = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    {
      key: "role",
      title: "Role",
      render: (value) => (
        <span className={`px-2 py-1 rounded ${roleColors[value as string]}`}>
          {roleLabels[value as string] ?? (value as string)}
        </span>
      ),
    },
    {
      key: "id",
      title: "Status",
      render: () => (
        <span className="px-2 py-1 rounded bg-green-100 text-green-700">
          Active
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Join Date",
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ]

  if (!canManage) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        Only super admins can view and manage admin accounts.
      </div>
    )
  }

  if (loading) return <p>Loading admins...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card
          title="Total Admins"
          value={stats.total}
          icon={<Users className="w-6 h-6" />}
        />
        <Card
          title="Active Admins"
          value={stats.active}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          color="text-green-600"
        />
        <Card
          title="Super Admins"
          value={stats.superCount}
          icon={<ShieldCheck className="w-6 h-6 text-purple-500" />}
          color="text-purple-600"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search admins by name or email..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={handleOpenDialog}>
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Admin
          </span>
        </Button>
      </div>

      {filteredAdmins.length === 0 && search ? (
        <p className="text-gray-500">No admins found for "{search}"</p>
      ) : (
        <Table columns={columns} data={filteredAdmins} />
      )}

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add New Admin"
        actions={
          <>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Creating..." : "Create Admin"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter admin's name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter admin's email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
}
