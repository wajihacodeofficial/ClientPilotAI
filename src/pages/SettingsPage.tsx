import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { Users, Shield, ShieldAlert, Mail } from 'lucide-react'

// Mock workspace users
const WORKSPACE_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@demo.com', role: 'admin', lastActive: 'Just now' },
  { id: '2', name: 'Normal User', email: 'user@demo.com', role: 'user', lastActive: '2 hours ago' },
  { id: '3', name: 'Sarah Connor', email: 'sarah@demo.com', role: 'user', lastActive: '1 day ago' },
]

export function SettingsPage() {
  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Workspace Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Admin Panel — Manage your workspace, users, and billing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  User Management
                </CardTitle>
                <p className="text-xs text-zinc-500">Manage who has access to Acme Software Agency.</p>
              </div>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Invite User</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 mt-4">
                {WORKSPACE_USERS.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500 font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {user.name}
                          {user.role === 'admin' && <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={user.role === 'admin' ? 'warning' : 'secondary'} className="uppercase text-[10px]">
                          {user.role}
                        </Badge>
                        <p className="text-[10px] text-zinc-400 mt-1">Active: {user.lastActive}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Security & Access */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">Require 2FA</span>
                <Badge variant="muted">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">Session Timeout</span>
                <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100">24h</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
