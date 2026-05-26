import { useEffect, useState } from "react"
import { type Column } from "../components/table/table.types"
import { type Garage } from "../../domain/entities/GarageApproval"
import { GarageRepositoryImpl } from "../../infrastructure/repositories/GarageRepositoryImpl"
import { ApproveGarageUseCase } from "../../application/useCases/GarageApproval/approveGarage"
import { RejectGarageUseCase } from "../../application/useCases/GarageApproval/rejectGarage"
import { EyeIcon } from "lucide-react"
import Table from "../components/table/table"
import Button from "../components/button/button"
import { SearchGaragesUseCase } from "../../application/useCases/GarageApproval/searchGarage"
import Input from "../components/input/input"
import Dialog from "../components/dialogBox/dialogBox"

export default function GarageApprovalsPage() {
    const [garages, setGarages] = useState<Garage[]>([])
    const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState("")

    const repository = new GarageRepositoryImpl()

    useEffect(() => {
        const fetchGarages = async () => {
            setLoading(true)
            try {
                const data = await repository.findAll()
                setGarages(data)
            } catch (err: any) {
                setError(err.message ?? "Failed to load garages")
            } finally {
                setLoading(false)
            }
        }
        fetchGarages()
    }, [])

    const handleSearch = async (term: string) => {
        setSearch(term)
        if (!term) {
            const data = await repository.findAll()
            setGarages(data)
            return
        }

        const useCase = new SearchGaragesUseCase(repository)
        const results = await useCase.execute(term)
        setGarages(results)
    }


    const handleReview = async (id: string) => {
        try {
            const garage = await repository.findById(id)
            if (garage) {
                setSelectedGarage(garage)
                setShowModal(true)
            }
        } catch (err: any) {
            setError(err.message ?? "Failed to fetch garage details")
        }
    }

    const handleApprove = async () => {
        if (!selectedGarage) return
        try {
            const useCase = new ApproveGarageUseCase(repository)
            const updated = await useCase.execute(selectedGarage.id)
            setGarages(prev => prev.map(g => (g.id === updated.id ? updated : g)))
            setShowModal(false)
        } catch (err: any) {
            setError(err.message ?? "Failed to approve garage")
        }
    }

    const handleReject = async () => {
        if (!selectedGarage) return
        try {
            const useCase = new RejectGarageUseCase(repository)
            const updated = await useCase.execute(selectedGarage.id)
            setGarages(prev => prev.map(g => (g.id === updated.id ? updated : g)))
            setShowModal(false)
        } catch (err: any) {
            setError(err.message ?? "Failed to reject garage")
        }
    }

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-black-500",
        ACTIVE: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
    }

    const resolvePdfUrl = (url?: string | null): string | null => {
        if (!url) return null
        if (/^https?:\/\//i.test(url)) return url
        const base =
            (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
            "http://localhost:4000"
        return `${base.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`
    }

    const columns: Column<Garage>[] = [
        { key: "name", title: "Name" },
        { key: "email", title: "Email" },
        { key: "phone", title: "Phone" },
        { key: "location", title: "Location" },
        {
            key: "status",
            title: "Status",
            render: (value) => (
                <span
                    className={`px-3 py-1 rounded font-medium ${statusColors[value as string]}`}
                >
                    {value === "PENDING" ? "Pending" : value === "ACTIVE" ? "Active" : "Rejected"}
                </span>
            ),
        },
        {
            key: "id",
            title: "Actions",
            render: (_value, row) => (
                <Button variant="link" onClick={() => handleReview(row.id)}>
                    <span className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        Review
                    </span>
                </Button>
            ),
        },
    ]

    if (loading) return <p>Loading garages...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Garage Approvals</h1>
            <div className="mb-4">
                <p>Review and approve garage registration requests</p>
            </div>
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search by name"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            {garages.length === 0 && search ? (
                <p className="text-gray-500">No garages found for "{search}"</p>
            ) : (
                <Table columns={columns} data={garages} />
            )}

            <Dialog
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Garage Registration Review"
                actions={
                    <>
                        <Button variant="approve" onClick={handleApprove}>
                            Approve Garage
                        </Button>
                        <Button variant="reject" onClick={handleReject}>
                            Reject Application
                        </Button>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                    </>
                }
            >
                {selectedGarage && (
                    <>
                        <p>Garage Name: {selectedGarage.name}</p>
                        <p>Email: {selectedGarage.email}</p>
                        <p>Phone Number: {selectedGarage.phone}</p>
                        <p>Location: {selectedGarage.location}</p>
                        <p>Status: {selectedGarage.status}</p>

                        <div className="mt-4">
                            <p className="font-medium mb-2">Business Document</p>
                            {(() => {
                                const pdfUrl = resolvePdfUrl(selectedGarage.businessDocumentUrl)
                                if (!pdfUrl) {
                                    return (
                                        <p className="text-gray-500">No document uploaded.</p>
                                    )
                                }
                                return (
                                    <div className="space-y-2">
                                        <iframe
                                            src={pdfUrl}
                                            title="Business Document"
                                            className="w-full h-96 border rounded"
                                        />
                                        <a
                                            href={pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-blue-600 underline"
                                        >
                                            Open document in new tab
                                        </a>
                                    </div>
                                )
                            })()}
                        </div>
                    </>
                )}
            </Dialog>
        </div>
    )
}