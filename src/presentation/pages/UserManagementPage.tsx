import { useEffect, useState } from "react"
import { type Column } from "../components/table/table.types"
import { type User } from "../../domain/entities/UserManagement"
import { UserManagementRepositoryImpl } from "../../infrastructure/repositories/UserManagementRepositoryImpl"
import Table from "../components/table/table"
import Input from "../components/input/input"
import Button from "../components/button/button"
import { SearchUsersUseCase } from "../../application/useCases/UserManagement/searchUsers"
import { Ban, AlertTriangle, CheckCircle, Users } from "lucide-react"
import Card from "../components/card/card"

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repository = new UserManagementRepositoryImpl()
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    warned: 0,
    blocked: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [usersData, statsData] = await Promise.all([
          repository.findAll(),
          repository.getStats()
        ])

        setUsers(usersData)
        setStats(statsData)
      } catch (err: any) {
        setError(err.message ?? "Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  const handleWarn = async (id: string) => {
    const updated = await repository.warnUser(id)
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
  }

  const handleBlock = async (id: string) => {
    const updated = await repository.blockUser(id)
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
  }

  const handleActivate = async (id: string) => {
    const updated = await repository.activateUser(id)
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
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
          {value}
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
          <Button variant="link" onClick={() => handleWarn(row.id)}>
            <AlertTriangle className="w-4 h-4" />
          </Button>
          <Button variant="link" onClick={() => handleBlock(row.id)}>
            <Ban className="w-4 h-4" />
          </Button>
          <Button variant="link" onClick={() => handleActivate(row.id)}>
            <CheckCircle className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) return <p>Loading users...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-gray-500">Manage platform users and admin accounts</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
          <Card
            title="Total Users"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
          />

          <Card
            title="Active Users"
            value={stats.active}
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            color="text-green-600"
          />

          <Card
            title="Warned Users"
            value={stats.warned}
            icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
            color="text-yellow-600"
          />

          <Card
            title="Blocked Users"
            value={stats.blocked}
            icon={<Ban className="w-6 h-6 text-red-500" />}
            color="text-red-600"
          />
      </div>

      <Input
        type="text"
        placeholder="Search users by name or email..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      {users.length === 0 && search ? (
        <p className="text-gray-500">No users found for "{search}"</p>
      ) : (
        <Table columns={columns} data={users} />
      )}
    </div>
  )
}