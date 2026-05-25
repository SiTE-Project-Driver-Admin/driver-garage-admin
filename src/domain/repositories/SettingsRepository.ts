import type { SettingsChangePassword } from "../entities/Settings";

export interface SettingsRepository {

  changePassword(settingsChangePassword: SettingsChangePassword): Promise<void>

}