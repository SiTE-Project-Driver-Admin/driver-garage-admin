import { useEffect, useMemo, useState } from "react"
import { EyeIcon, Flag, XCircle } from "lucide-react"
import Table from "../components/table/table"
import Button from "../components/button/button"
import Card from "../components/card/card"
import { type Column } from "../components/table/table.types"
import { CommunityReportRepositoryImpl } from "../../infrastructure/repositories/CommunityReportRepositoryImpl"
import { type CommunityReport } from "../../domain/entities/CommunityReport"
import { GetCommunityReportUseCase } from "../../application/useCases/CommunityModeration/getCommunityReport"
import { DismissCommunityReportUseCase } from "../../application/useCases/CommunityModeration/dismissReport"
import { TakeDownPostUseCase } from "../../application/useCases/CommunityModeration/takeDownReport"
import Dialog from "../components/dialogBox/dialogBox"

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

  const stats = useMemo(() => {
    return {
      pending: reports.filter(r => r.status === "PENDING").length,
      dismissed: reports.filter(r => r.status === "DISMISSED").length,
    }
  }, [reports])

  const [selectedReport, setSelectedReport] =
    useState<CommunityReport | null>(null)

  const [showModal, setShowModal] = useState(false)

  const handleReview = async (id: string) => {
    try {
      const useCase = new GetCommunityReportUseCase(repository)

      const report = await useCase.execute(id)

      if (report) {
        setSelectedReport(report)
        setShowModal(true)
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch report")
    }
  }

  const handleDismiss = async () => {
    if (!selectedReport) return

    try {
      const useCase = new DismissCommunityReportUseCase(repository)

      const updated = await useCase.execute(selectedReport.id)

      setReports(prev =>
        prev.map(r => (r.id === updated.id ? updated : r))
      )

      setShowModal(false)
    } catch (err: any) {
      setError(err.message ?? "Failed to dismiss report")
    }
  }

  const handleTakeDown = async () => {
    if (!selectedReport) return

    try {
      const useCase = new TakeDownPostUseCase(repository)

      const updated = await useCase.execute(selectedReport.id)

      setReports(prev =>
        prev.map(r => (r.id === updated.id ? updated : r))
      )

      setShowModal(false)
    } catch (err: any) {
      setError(err.message ?? "Failed to take down post")
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    REMOVED: "bg-red-100 text-red-700",
    DISMISSED: "bg-gray-200 text-gray-700",
  }

  const columns: Column<CommunityReport>[] = [
    { key: "reason", title: "Reason" },
    {
      key: "reporter",
      title: "Reported By",
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.reporter.firstName} {row.reporter.lastName}
          </span>
        </div>
      ),
    },
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
        <Button
          variant="link"
          onClick={() => handleReview(row.id)}
        >
          <span className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            Review
          </span>
        </Button>
      ),
    },
  ]

  if (loading) return <p>Loading reports...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Community Reports</h1>
        <p className="text-gray-500">
          Manage user reports, content moderation, and post actions
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card
          title="Pending Reports"
          value={stats.pending}
          icon={<Flag className="w-6 h-6 text-yellow-500" />}
          color="text-yellow-600"
        />

        <Card
          title="Reports Dismissed"
          value={stats.dismissed}
          icon={<XCircle className="w-6 h-6 text-gray-500" />}
          color="text-gray-600"
        />
      </div>

      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Community Report Review"
        actions={
          <>
            <Button variant="reject" onClick={handleTakeDown}>
              Take Down Post
            </Button>

            <Button variant="secondary" onClick={handleDismiss}>
              Dismiss Report
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-3">

            <div>
              <p className="font-semibold">Reason</p>
              <p>{selectedReport.reason}</p>
            </div>

            <div>
              <p className="font-semibold">Details</p>
              <p>{selectedReport.details ?? "No details provided"}</p>
            </div>

            <div>
              <p className="font-semibold">Reported By</p>
              <p>
                {selectedReport.reporter.firstName}{" "}
                {selectedReport.reporter.lastName}
              </p>
              <p>{selectedReport.reporter.email}</p>
            </div>

            <div>
              <p className="font-semibold">Post</p>
              <p>{selectedReport.post.title}</p>
              <p>{selectedReport.post.content}</p>
            </div>

            {selectedReport.post.imageUrl && (
              <img
                src={selectedReport.post.imageUrl}
                alt="Reported post"
                className="w-full max-h-64 object-cover rounded-lg border"
              />
            )}

          </div>
        )}
      </Dialog>

      <Table columns={columns} data={reports} />
    </div>
  )
}