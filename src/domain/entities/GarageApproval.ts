export interface Garage {
    id: string
    name: string
    email: string
    phone: string
    address: string
    services_offered: string[]
    other_services: string[]
    lattitude?: number
    longitude?: number
    created_at: string
    updated_at: string
    status: GarageStatus
    businessDocument?: string | null
}

export type GarageStatus = "PENDING" | "ACTIVE" | "REJECTED"