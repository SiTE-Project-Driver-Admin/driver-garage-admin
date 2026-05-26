import { useEffect, useState } from "react"
import {
  type EducationCategory,
  type EducationContent,
} from "../../domain/entities/EducationContent"
import { EducationContentRepositoryImpl } from "../../infrastructure/repositories/EducationContentRepositoryImpl"
import { CreateContentUseCase } from "../../application/useCases/EducationContent/createContent"
import { UpdateContentUseCase } from "../../application/useCases/EducationContent/updateContent"
import { DeleteContentUseCase } from "../../application/useCases/EducationContent/deleteContent"
import { SearchContentUseCase } from "../../application/useCases/EducationContent/searchContent"
import Table from "../components/table/table"
import Button from "../components/button/button"
import Dialog from "../components/dialogBox/dialogBox"
import type { Column } from "../components/table/table.types"
import { FileTextIcon, PencilIcon, TrashIcon, UploadIcon } from "lucide-react"


export default function EducationalContentPage() {
  const [contents, setContents] = useState<EducationContent[]>([])
  const [selectedCategory, setSelectedCategory] = useState<EducationCategory>("ALL")
  const [showDialog, setShowDialog] = useState(false)
  const [selectedContent, setSelectedContent] = useState<EducationContent | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repository = new EducationContentRepositoryImpl()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ALL" as EducationCategory,
    imageUrl: "" as string,
    imageFile: null as File | null,
    pdfFile: null as File | null,
  })

  useEffect(() => {
    const fetchAll = async () => {
      const data = await repository.findAll()
      setContents(data)
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (selectedContent) {
      setFormData({
        title: selectedContent.title,
        description: selectedContent.description,
        category: selectedContent.category,
        imageUrl: "",
        imageFile: null,
        pdfFile: null,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "ALL",
        imageUrl: "",
        imageFile: null,
        pdfFile: null,
      })
    }
  }, [selectedContent])

  useEffect(() => {
    let revoked: string | null = null

    const loadPdf = async () => {
      if (!selectedContent?.hasPdf || !selectedContent?.id) {
        setPdfPreviewUrl(null)
        return
      }
      setPdfPreviewLoading(true)
      try {
        const blob = await repository.getContentPdf(selectedContent.id)
        const url = URL.createObjectURL(blob)
        revoked = url
        setPdfPreviewUrl(url)
      } catch (err) {
        console.error("Failed to load PDF", err)
        setPdfPreviewUrl(null)
      } finally {
        setPdfPreviewLoading(false)
      }
    }

    loadPdf()

    return () => {
      if (revoked) URL.revokeObjectURL(revoked)
      setPdfPreviewUrl(null)
    }
  }, [selectedContent?.id, selectedContent?.hasPdf])

  useEffect(() => {
    let revoked: string | null = null

    const loadImage = async () => {
      if (!selectedContent?.hasImage || !selectedContent?.id) return
      try {
        const blob = await repository.getContentImage(selectedContent.id)
        const url = URL.createObjectURL(blob)
        revoked = url
        setFormData((prev) =>
          prev.imageFile || prev.pdfFile ? prev : { ...prev, imageUrl: url }
        )
      } catch (err) {
        console.error("Failed to load image", err)
      }
    }

    loadImage()

    return () => {
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [selectedContent?.id, selectedContent?.hasImage])

  const handleCategoryChange = async (category: EducationCategory) => {
    setSelectedCategory(category)

    if (category === "ALL") {
      const data = await repository.findAll()
      setContents(data)
      return
    }

    const useCase = new SearchContentUseCase(repository)
    const results = await useCase.execute(category)
    setContents(results)
  }

  const handleDelete = async (id: string) => {
    const useCase = new DeleteContentUseCase(repository)
    await useCase.execute(id)
    setContents(prev => prev.filter(c => c.id !== id))
  }

  const handleOpenDialog = (content?: EducationContent) => {
    setError(null)
    setSelectedContent(content ?? null)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setSelectedContent(null)
    setError(null)
  }

  const handleSave = async () => {
    setError(null)
    if (!formData.title || !formData.description) {
      setError("Title and description are required")
      return
    }
    if (formData.category === "MANUALS" && !selectedContent && !formData.pdfFile) {
      setError("MANUALS requires a PDF file")
      return
    }

    setSaving(true)
    try {
      if (selectedContent) {
        const useCase = new UpdateContentUseCase(repository)
        const updated = await useCase.execute(selectedContent.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          imageFile: formData.imageFile,
          pdfFile: formData.pdfFile,
        })
        setContents(prev => prev.map(c => (c.id === updated.id ? updated : c)))
      } else {
        const useCase = new CreateContentUseCase(repository)
        const created = await useCase.execute({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          imageFile: formData.imageFile,
          pdfFile: formData.pdfFile,
        })
        setContents(prev => [...prev, created])
      }
      handleCloseDialog()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Failed to save content")
          : "Failed to save content"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const categoryLabels: Record<EducationCategory, string> = {
    ALL: "All",
    SAFETY: "Safety",
    MAINTENANCE: "Maintenance",
    REPAIRS: "Repairs",
    TIPS: "Tips",
    MANUALS: "Manuals",
  }

  const columns: Column<EducationContent>[] = [
    { key: "title", title: "Title" },
    { key: "description", title: "Description" },
    {
      key: "category",
      title: "Category",
      render: (value) => <span>{categoryLabels[value as EducationCategory]}</span>,
    },
    {
      key: "createdAt",
      title: "Created Date",
      render: (value) => (
        <span>{(value as string).split("T")[0]}</span>
      ),
    },
    {
      key: "id",
      title: "Actions",
      render: (_value, row) => (
        <div className="flex">
          <Button variant="link" onClick={() => handleOpenDialog(row)}>
            <PencilIcon className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="delete" onClick={() => handleDelete(row.id)}>
            <TrashIcon className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      )
    }
  ]

  const isManuals = formData.category === "MANUALS"
  const showingNewPdf = !!formData.pdfFile
  const showingNewImage = !!formData.imageFile
  const showingExistingPdf =
    !!selectedContent?.hasPdf && !formData.pdfFile && !formData.imageFile
  const showingExistingImage =
    !!formData.imageUrl && !formData.imageFile && !formData.pdfFile && !showingExistingPdf

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-4">Educational Content</h1>
          <p className="mb-4">Manage educational articles and guides</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenDialog()}>+ Add Content</Button>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        {(["ALL", "MAINTENANCE", "SAFETY", "REPAIRS", "TIPS", "MANUALS"] as const).map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "primary" : "secondary"}
            onClick={() => handleCategoryChange(cat)}
          >
            {categoryLabels[cat]}
          </Button>
        ))}
      </div>

      {contents.length === 0 ? (
        <p className="text-gray-500">No content found</p>
      ) : (
        <Table columns={columns} data={contents} />
      )}

      <Dialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        title={selectedContent ? "Edit Content" : "Add New Content"}
        actions={
          <>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Content"}
            </Button>
            <Button variant="secondary" onClick={handleCloseDialog}>
              Cancel
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter content title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as EducationCategory,
                })
              }
              className="w-full border rounded px-2 py-1"
            >
              {(Object.entries(categoryLabels) as [EducationCategory, string][])
                .filter(([key]) => key !== "ALL")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              placeholder="Enter content description"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-2 py-1"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              File {isManuals && !selectedContent ? "(PDF required)" : "(PNG, JPG, or PDF)"}
            </label>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-yellow-400 transition">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  if (!file) {
                    setFormData({
                      ...formData,
                      imageFile: null,
                      pdfFile: null,
                    })
                    return
                  }
                  const isPdf =
                    file.type === "application/pdf" ||
                    file.name.toLowerCase().endsWith(".pdf")
                  if (isPdf) {
                    setFormData({
                      ...formData,
                      pdfFile: file,
                      imageFile: null,
                      imageUrl: "",
                    })
                  } else {
                    setFormData({
                      ...formData,
                      imageFile: file,
                      imageUrl: URL.createObjectURL(file),
                      pdfFile: null,
                    })
                  }
                }}
                className="hidden"
                id="fileUpload"
              />

              {showingNewImage && (
                <label htmlFor="fileUpload" className="cursor-pointer w-full">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-40 w-full object-cover rounded"
                  />
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Click to replace ({formData.imageFile?.name})
                  </p>
                </label>
              )}

              {showingNewPdf && (
                <label htmlFor="fileUpload" className="cursor-pointer w-full">
                  <div className="flex items-center justify-center gap-2 text-gray-700 text-sm py-6">
                    <FileTextIcon className="h-6 w-6 text-red-600" />
                    {formData.pdfFile?.name}
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Click to replace
                  </p>
                </label>
              )}

              {showingExistingImage && (
                <label htmlFor="fileUpload" className="cursor-pointer w-full">
                  <img
                    src={formData.imageUrl}
                    alt="Existing"
                    className="h-40 w-full object-cover rounded"
                  />
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Click to replace
                  </p>
                </label>
              )}

              {showingExistingPdf && (
                <div className="w-full space-y-2">
                  {pdfPreviewLoading ? (
                    <p className="text-gray-500 text-sm text-center">
                      Loading PDF preview...
                    </p>
                  ) : pdfPreviewUrl ? (
                    <>
                      <iframe
                        src={pdfPreviewUrl}
                        title="PDF preview"
                        className="w-full h-72 border rounded"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <a
                          href={pdfPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Open PDF in new tab
                        </a>
                        <label
                          htmlFor="fileUpload"
                          className="text-gray-600 cursor-pointer underline"
                        >
                          Click to replace
                        </label>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">
                      Could not load PDF preview.
                    </p>
                  )}
                </div>
              )}

              {!showingNewImage &&
                !showingNewPdf &&
                !showingExistingImage &&
                !showingExistingPdf && (
                  <label
                    htmlFor="fileUpload"
                    className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer py-6"
                  >
                    <UploadIcon className="h-5 w-5 text-gray-400" />
                    Click to upload (PNG, JPG, or PDF)
                  </label>
                )}
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
