export interface EducationContent{
    id: string;
    title: string;
    description: string;
    category: EducationCategory;
    image?: string;
    pdfContent?: string;
    hasPdf?: boolean;
    createdAt: string;
    updatedAt: string;
}

export type EducationCategory = "ALL" | "SAFETY" | "MAINTENANCE" | "REPAIRS" | "TIPS" | "MANUALS"