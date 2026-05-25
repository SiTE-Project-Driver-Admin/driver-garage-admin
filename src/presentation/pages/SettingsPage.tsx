import { useState } from "react"
import {
  User,
  Lock,
  ShieldCheck,
} from "lucide-react"

import Input from "../components/input/input"
import Button from "../components/button/button"

import { SettingsRepositoryImpl } from "../../infrastructure/repositories/SettingsRepositoryImpl"

export default function SettingsPage() {
  const repository = new SettingsRepositoryImpl()

  const [fullName, setFullName] = useState("Admin User")
  const [email, setEmail] = useState("admin@example.com")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleChangePassword = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await repository.changePassword({
        currentPassword,
        newPassword,
      })

      setSuccess("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setError(err.message ?? "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your profile and system settings
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="col-span-2 space-y-6">

          {/* Profile Card */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5" />
              <h2 className="text-xl font-semibold">My Profile</h2>
            </div>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Full Name
                </label>

                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Email Address
                </label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                />
              </div>

            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold">
                Change Password
              </h2>
            </div>

            <div className="space-y-4">

              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
              />

              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
              />

              {success && (
                <p className="text-green-600 text-sm">
                  {success}
                </p>
              )}

              {error && (
                <p className="text-red-500 text-sm">
                  {error}
                </p>
              )}

              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>

            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">
                Account Information
              </h2>
            </div>

            <div className="space-y-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-lg font-bold">
                  AD
                </div>

                <div>
                  <p className="font-semibold">
                    Admin User
                  </p>

                  <p className="text-sm text-gray-500">
                    admin@example.com
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Role
                  </span>

                  <span className="font-medium">
                    Super Admin
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Access Level
                  </span>

                  <span className="font-medium">
                    Full Access
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}