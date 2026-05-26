export interface EducationContent{
    id: string;
    title: string;
    description: string;
    category: EducationCategory;
    image?: string | null;
    hasImage?: boolean;
    pdf?: string | null;
    hasPdf?: boolean;
    createdAt: string;
    updatedAt: string;
}

export type EducationCategory = "ALL" | "SAFETY" | "MAINTENANCE" | "REPAIRS" | "TIPS" | "MANUALS"

export interface EducationContentPayload {
    title: string;
    description: string;
    category: EducationCategory;
    imageFile?: File | null;
    pdfFile?: File | null;
    removeImage?: boolean;
    removePdf?: boolean;
}