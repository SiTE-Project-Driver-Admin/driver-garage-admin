import type { User } from "../entities/UserManagement"
export interface UserRepository {
    findAll(): Promise<User[]>
    findById(id: string): Promise<User | null>
    deleteUser(id: string): Promise<void>
    warnUser(
        id: string,
        reason: string
    ): Promise<User>
    blockUser(id: string, role: User["role"]): Promise<User>
    activateUser(id: string, role: User["role"]): Promise<User>
    searchUsers(term: string): Promise<User[]>
    getStats(): Promise<{
        total: number
        active: number
        warned: number
        blocked: number
    }>
}
