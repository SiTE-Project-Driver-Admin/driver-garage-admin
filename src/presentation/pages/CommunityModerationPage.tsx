import { useEffect, useMemo, useState } from "react"
import { Flag, Trash2, XCircle } from "lucide-react"
import Table from "../components/table/table"
import Button from "../components/button/button"
import Card from "../components/card/card"
import { type Column } from "../components/table/table.types"
import { CommunityReportRepositoryImpl } from "../../infrastructure/repositories/CommunityReportRepositoryImpl"
import { type CommunityReport } from "../../domain/entities/CommunityReport"

export default function CommunityReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repository = new CommunityReportRepositoryImpl()

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const data = await repository.listAll()
        setReports(data)
      } catch (err: any) {
        setError(err.message ?? "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // 📊 derived stats
  const stats = useMemo(() => {
    return {
      pending: reports.filter(r => r.status === "PENDING").length,
      removed: reports.filter(r => r.status === "REMOVED").length,
      dismissed: reports.filter(r => r.status === "DISMISSED").length,
    }
  }, [reports])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = await repository.updateStatus(id, status)
      setReports(prev =>
        prev.map(r => (r.id === updated.id ? updated : r))
      )
    } catch (err: any) {
      setError(err.message ?? "Failed to update report")
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    REMOVED: "bg-red-100 text-red-700",
    DISMISSED: "bg-gray-200 text-gray-700",
  }

  const columns: Column<CommunityReport>[] = [
    { key: "id", title: "ID" },
    { key: "reason", title: "Reason" },

    {
      key: "status",
      title: "Status",
      render: (value) => {
        if (typeof value !== "string") return null

        return (
          <span className={`px-2 py-1 rounded ${statusColors[value]}`}>
            {value}
          </span>
        )
      },
    },

    {
      key: "createdAt",
      title: "Date",
      render: (value) =>
        new Date(value as string).toLocaleDateString(),
    },

    {
      key: "id",
      title: "Actions",
      render: (_value, row) => (
        <div className="flex gap-2">
          <Button
            variant="link"
            onClick={() => handleUpdateStatus(row.id, "REMOVED")}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>

          <Button
            variant="link"
            onClick={() => handleUpdateStatus(row.id, "DISMISSED")}
          >
            <XCircle className="w-4 h-4 text-gray-600" />
          </Button>

          <Button
            variant="link"
            onClick={() => handleUpdateStatus(row.id, "PENDING")}
          >
            <Flag className="w-4 h-4 text-yellow-600" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) return <p>Loading reports...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Community Reports</h1>
        <p className="text-gray-500">
          Manage user reports, content moderation, and post actions
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          title="Pending Reports"
          value={stats.pending}
          icon={<Flag className="w-6 h-6 text-yellow-500" />}
          color="text-yellow-600"
        />

        <Card
          title="Posts Removed"
          value={stats.removed}
          icon={<Trash2 className="w-6 h-6 text-red-500" />}
          color="text-red-600"
        />

        <Card
          title="Reports Dismissed"
          value={stats.dismissed}
          icon={<XCircle className="w-6 h-6 text-gray-500" />}
          color="text-gray-600"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={reports} />
    </div>
  )
}