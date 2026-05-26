import type {
  EducationCategory,
  EducationContent,
  EducationContentPayload,
} from "../entities/EducationContent"

export interface EducationContentRepository {
  findAll(): Promise<EducationContent[]>
  findById(id: string): Promise<EducationContent | null>
  searchContent(category: EducationCategory): Promise<EducationContent[]>
  addContent(payload: EducationContentPayload): Promise<EducationContent>
  updateContent(
    id: string,
    payload: Partial<EducationContentPayload>
  ): Promise<EducationContent>
  deleteContent(id: string): Promise<EducationContent | null>
  getContentPdf(id: string): Promise<Blob>
  getContentImage(id: string): Promise<Blob>
}
