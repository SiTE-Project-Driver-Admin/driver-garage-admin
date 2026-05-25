import { useEffect, useState } from "react"
import { type EducationContent } from "../../domain/entities/EducationContent"
import { EducationContentRepositoryImpl } from "../../infrastructure/repositories/EducationContentRepositoryImpl"
import { CreateContentUseCase } from "../../application/useCases/EducationContent/createContent"
import { UpdateContentUseCase } from "../../application/useCases/EducationContent/updateContent"
import { DeleteContentUseCase } from "../../application/useCases/EducationContent/deleteContent"
import { SearchContentUseCase } from "../../application/useCases/EducationContent/searchContent"
import Table from "../components/table/table"
import Button from "../components/button/button"
import Dialog from "../components/dialogBox/dialogBox"
import type { Column } from "../components/table/table.types"
import { ImageIcon, PencilIcon, TrashIcon } from "lucide-react"


export default function EducationalContentPage() {
  const [contents, setContents] = useState<EducationContent[]>([])
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "SAFETY" | "MAINTENANCE" | "REPAIRS" | "TIPS" | "MANUALS">("ALL")
  const [showDialog, setShowDialog] = useState(false)
  const [selectedContent, setSelectedContent] = useState<EducationContent | null>(null)

  const repository = new EducationContentRepositoryImpl()

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
        image: selectedContent.image ?? "",
        pdfContent: selectedContent.pdfContent ?? "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "ALL",
        image: "",
        pdfContent: "",
      })
    }
  }, [selectedContent])

  const handleCategoryChange = async (category: typeof selectedCategory) => {
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
    setSelectedContent(content ?? null)
    setShowDialog(true)
  }

  const handleSave = async (newContent: Omit<EducationContent, "id" | "created_at" | "updated_at">) => {
    if (selectedContent) {
      const useCase = new UpdateContentUseCase(repository)
      const updated = await useCase.execute(selectedContent.id, newContent)
      setContents(prev => prev.map(c => c.id === updated.id ? updated : c))
    } else {
      const useCase = new CreateContentUseCase(repository)
      const created = await useCase.execute(newContent)
      setContents(prev => [...prev, created])
    }
    setShowDialog(false)
    setSelectedContent(null)
    setFormData({ title: "", description: "", category: "ALL", image: "", pdfContent: "" })
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ALL" as EducationContent["category"],
    image: "",
    pdfContent: "",
  })

  const categoryLabels: Record<EducationContent["category"], string> = {
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
      render: (value) => <span>{categoryLabels[value as EducationContent["category"]]}</span>,
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

  return (
    <div className="p-6">


      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-4">Educational Content</h1>
          <p className="mb-4">Manage educational articles and guides</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenDialog()}>+ Add Content</Button>
      </div>

      <div className="flex gap-4 mb-4">
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
        onClose={() => setShowDialog(false)}
        title={selectedContent ? "Edit Content" : "Add New Content"}
        actions={
          <>
            <Button
              variant="primary"
              onClick={() =>
                handleSave({
                  title: formData.title,
                  description: formData.description,
                  category: formData.category,
                  image: formData.image,
                  pdfContent: formData.pdfContent,
                  createdAt: "",
                  updatedAt: "",
                })
              }
            >
              Save Content
            </Button>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
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
                  category: e.target.value as EducationContent["category"],
                })
              }
              className="w-full border rounded px-2 py-1"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
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
            <label className="block text-sm font-medium mb-1">Image (optional)</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-yellow-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: e.target.files?.[0]
                      ? URL.createObjectURL(e.target.files[0])
                      : "",
                  })
                }
                className="hidden"
                id="imageUpload"
              />
              {!formData.image ? (
                <label
                  htmlFor="imageUpload"
                  className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer"
                >
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  Click to upload images (PNG, JPG)
                </label>

              ) : (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded"
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PDF (optional)</label>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pdfContent: e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : "",
                })
              }
            />

            {formData.pdfContent && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {formData.pdfContent}
              </p>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  )
}