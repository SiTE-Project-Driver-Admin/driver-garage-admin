import type {
  EducationCategory,
  EducationContent,
  EducationContentPayload,
} from "../../domain/entities/EducationContent"
import type { EducationContentRepository } from "../../domain/repositories/EducationContentRepository"
import { axiosClient } from "../api/axiosClient"

function buildFormData(payload: Partial<EducationContentPayload>): FormData {
  const fd = new FormData()
  if (payload.title !== undefined) fd.append("title", payload.title)
  if (payload.description !== undefined) fd.append("description", payload.description)
  if (payload.category !== undefined) fd.append("category", payload.category)
  if (payload.imageFile) fd.append("image", payload.imageFile)
  if (payload.pdfFile) fd.append("pdf", payload.pdfFile)
  if (payload.removeImage) fd.append("removeImage", "true")
  if (payload.removePdf) fd.append("removePdf", "true")
  return fd
}

export class EducationContentRepositoryImpl implements EducationContentRepository {
  async findAll(): Promise<EducationContent[]> {
    const response = await axiosClient.get(`/admin/educational-content`)
    return response.data
  }

  async findById(id: string): Promise<EducationContent | null> {
    const response = await axiosClient.get(`/admin/educational-content/${id}`)
    return response.data ?? null
  }

  async searchContent(category: EducationCategory): Promise<EducationContent[]> {
    const response = await axiosClient.get(`/admin/educational-content/search`, {
      params: { q: category },
    })
    return response.data
  }

  async addContent(payload: EducationContentPayload): Promise<EducationContent> {
    const response = await axiosClient.post(
      `/admin/educational-content`,
      buildFormData(payload)
    )
    return response.data
  }

  async updateContent(
    id: string,
    payload: Partial<EducationContentPayload>
  ): Promise<EducationContent> {
    const response = await axiosClient.put(
      `/admin/educational-content/${id}`,
      buildFormData(payload)
    )
    return response.data
  }

  async deleteContent(id: string): Promise<EducationContent | null> {
    const response = await axiosClient.delete(`/admin/educational-content/${id}`)
    return response.data
  }

  async getContentPdf(id: string): Promise<Blob> {
    const response = await axiosClient.get(
      `/admin/educational-content/${id}/pdf`,
      { responseType: "blob" }
    )
    return response.data as Blob
  }

  async getContentImage(id: string): Promise<Blob> {
    const response = await axiosClient.get(
      `/admin/educational-content/${id}/image`,
      { responseType: "blob" }
    )
    return response.data as Blob
  }
}
