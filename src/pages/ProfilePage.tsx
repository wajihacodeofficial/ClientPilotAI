import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge } from '@/components/ui'
import { User, Shield, Bell, Key, Save } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function ProfilePage() {
  const userRole = useAppStore((s) => s.userRole)
  const userEmail = useAppStore((s) => s.userEmail) || 'user@example.com'
  const [name, setName] = useState(userRole === 'admin' ? 'Admin User' : 'Normal User')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-(--text-primary)">User Profile</h1>
        <p className="text-sm text-(--text-secondary) mt-0.5">
          Manage your personal account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="clay-floating border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-(--primary)" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full clay-inset flex items-center justify-center text-(--primary) text-xl font-bold">
                  {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <Button variant="outline" size="sm" className="clay-inset">Change Avatar</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="clay-inset border-none shadow-none bg-(--bg)" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={userEmail} disabled className="clay-inset border-none shadow-none bg-(--bg) opacity-70" />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button onClick={handleSave} isLoading={isSaving} className="clay-btn-primary h-9 px-4 text-sm gap-2">
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
                {saveSuccess && <span className="text-sm text-(--success) font-medium">Profile updated successfully!</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="clay-floating border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-(--danger)">
                <Key className="h-4 w-4" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 max-w-md">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" className="clay-inset border-none shadow-none bg-(--bg)" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" className="clay-inset border-none shadow-none bg-(--bg)" />
              </div>
              <Button variant="outline" size="sm" className="mt-2 text-(--danger) border-(--danger)/20 hover:bg-(--danger)/10">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="clay-floating border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-(--primary)" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--text-secondary)">Role</span>
                <Badge variant={userRole === 'admin' ? 'warning' : 'secondary'} className="uppercase text-[10px]">
                  {userRole || 'User'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--text-secondary)">2FA Security</span>
                <Badge variant="muted" className="text-[10px]">Disabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="clay-floating border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-(--primary)" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-(--text-primary)">Email Alerts</p>
                  <p className="text-[11px] text-(--text-secondary)">When new leads are found</p>
                </div>
                <div className="w-8 h-4 bg-(--primary) rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-(--text-primary)">Weekly Digest</p>
                  <p className="text-[11px] text-(--text-secondary)">Summary of outreach</p>
                </div>
                <div className="w-8 h-4 bg-(--primary) rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
