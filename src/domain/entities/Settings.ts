export interface SettingsChangePassword {
    currentPassword: string
    newPassword: string
}

export interface AdminProfile {
    id: string
    name: string
    email: string
    role: "DRIVER" | "ADMIN" | "GARAGE"
    createdAt: string 
}
