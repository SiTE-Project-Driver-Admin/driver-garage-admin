export type AdminRole = "ADMIN" | "SUPER_ADMIN"

export interface Admin {
  id: string
  name: string
  email: string
  role: AdminRole
  createdAt: string
  updatedAt: string
}

export interface CreateAdminPayload {
  name: string
  email: string
  password: string
}
