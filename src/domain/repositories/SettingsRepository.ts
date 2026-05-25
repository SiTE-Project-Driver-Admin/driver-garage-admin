import type { AdminProfile, SettingsChangePassword } from "../entities/Settings";

export interface SettingsRepository {
    getProfile(): Promise<AdminProfile>
    changePassword(settingsChangePassword: SettingsChangePassword): Promise<void>

}