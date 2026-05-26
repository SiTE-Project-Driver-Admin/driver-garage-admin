import type {
  AdminInfo,
  AuthRepository,
} from "../../domain/repositories/AuthRepository"

const TOKEN_KEY = "adminToken"
const INFO_KEY = "adminInfo"

export const loginAdmin = async (
  repository: AuthRepository,
  email: string,
  password: string
) => {
  const result = await repository.login(email, password)

  localStorage.setItem(TOKEN_KEY, result.token)
  if (result.admin) {
    localStorage.setItem(INFO_KEY, JSON.stringify(result.admin))
  }

  return result
}

export const getCurrentAdmin = (): AdminInfo | null => {
  const raw = localStorage.getItem(INFO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminInfo
  } catch {
    return null
  }
}

export const logoutAdmin = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(INFO_KEY)
}

export const isSuperAdmin = (): boolean =>
  getCurrentAdmin()?.role === "SUPER_ADMIN"
