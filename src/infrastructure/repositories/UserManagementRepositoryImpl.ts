import type { User } from "../../domain/entities/UserManagement"
import type { UserRepository } from "../../domain/repositories/UserManagementRepository"
import { axiosClient } from "../api/axiosClient"

export class UserManagementRepositoryImpl implements UserRepository {

    async findAll(): Promise<User[]> {
        const response = await axiosClient.get(`/admin/users`)
        return response.data
    }

    async findById(id: string): Promise<User | null> {
        const response = await axiosClient.get(`/admin/users/${id}`)
        return response.data ?? null
    }

    async deleteUser(id: string): Promise<void> {
        await axiosClient.delete(`/admin/users/${id}`)
    }

    async blockUser(id: string): Promise<User> {
        const response = await axiosClient.patch(`/admin/users/${id}/block`)
        return response.data
    }

    async warnUser(
        id: string,
        reason: string
    ): Promise<User> {

        const response = await axiosClient.patch(
            `/admin/users/${id}/warn`,
            { reason }
        )

        return response.data
    }

    async activateUser(id: string): Promise<User> {
        const response = await axiosClient.patch(`/admin/users/${id}/activate`)
        return response.data
    }

    async searchUsers(term: string): Promise<User[]> {
        const users = await this.findAll()
        return users.filter(user =>
            user.name.toLowerCase().includes(term.toLowerCase()) ||
            user.email.toLowerCase().includes(term.toLowerCase())
        )
    }

    async getStats(): Promise<{
        total: number
        active: number
        warned: number
        blocked: number
    }> {
        const response = await axiosClient.get("/admin/users/stats")
        return response.data
    }
}