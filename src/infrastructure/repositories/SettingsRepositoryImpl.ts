import type { AdminProfile, SettingsChangePassword } from "../../domain/entities/Settings";
import type { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import { axiosClient } from "../api/axiosClient";

export class SettingsRepositoryImpl implements SettingsRepository {
    async getProfile(): Promise<AdminProfile> {
        const response = await axiosClient.get("/admin/auth/profile")
        return response.data
    }

    async changePassword(settingsChangePassword: SettingsChangePassword): Promise<void> {
        await axiosClient.put("/admin/auth/change-password", {
            currentPassword: settingsChangePassword.currentPassword,
            newPassword: settingsChangePassword.newPassword
        })
    }
}       