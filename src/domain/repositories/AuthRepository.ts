export interface AdminInfo {
  id: string
  name: string
  email: string
  role: "ADMIN" | "SUPER_ADMIN"
  createdAt: string
  updatedAt: string
}

export interface AuthRepository {
  login(
    email: string,
    password: string
  ): Promise<{ token: string; admin: AdminInfo }>
}
