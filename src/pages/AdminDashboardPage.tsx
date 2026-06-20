import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Briefcase, BarChart2, Search, ShieldAlert,
  Calendar, Shield, User, RefreshCw, X,
  TrendingUp, CheckCircle2, ChevronRight,
  Zap, ToggleLeft, ToggleRight
} from 'lucide-react'
import {
  Card, CardContent, CardHeader, CardTitle, Button, Input,
  Badge, Skeleton, Separator, Sheet, Select
} from '@/components/ui'
import { getAdminUsers, updateUserRole } from '@/lib/mockApi'
import { cn, getScoreColor, getScoreBg, getPipelineLabel, formatDate } from '@/lib/utils'

interface AdminLeadMessage {
  id: string;
  subject: string | null;
  body: string;
  status: 'draft' | 'sent' | null;
  createdAt: string;
}

interface AdminLead {
  id: string;
  name: string;
  category: string;
  city: string;
  score: number;
  scoreBreakdown: {
    digitalPresenceGap: number;
    categoryFit: number;
    reviewActivity: number;
    marketDensity: number;
    competitorPresence: number;
  };
  aiAnalysis: string;
  pipelineStage: string;
  discoveredAt: string;
  outreachMessages: AdminLeadMessage[];
}

interface AdminUserWorkspace {
  id: string;
  name: string;
  totalLeads: number;
  leadsByStage: {
    discovery: number;
    qualified: number;
    contacted: number;
    client: number;
  };
  totalOutreachSent: number;
  leads: AdminLead[];
}

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastSignInAt?: string;
  workspace: AdminUserWorkspace | null;
}

const CAT_EMOJI: Record<string, string> = {
  restaurant: '🍽️', retail: '🛍️', salon: '💇', clinic: '🏥',
  auto_service: '🔧', bakery: '🥐', pharmacy: '💊', tailor: '🧵',
  cafe: '☕', gym: '💪', electronics: '🔌', jewellery: '💍',
  real_estate: '🏠', catering: '🍱',
}

const STAGE_COLORS: Record<string, string> = {
  discovery: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800',
  qualified: 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800',
  contacted: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800',
  client: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800',
}

export function AdminDashboardPage() {
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [roleChanging, setRoleChanging] = useState<string | null>(null)

  // Fetch admin users data
  useEffect(() => {
    getAdminUsers()
      .then((data) => {
        setUsersList(data as AdminUser[])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load admin users data:', err)
        setLoading(false)
      })
  }, [refreshKey])

  const selectedUser = useMemo(() => {
    return usersList.find((u) => u.id === selectedUserId) ?? null
  }, [usersList, selectedUserId])

  // Filter users
  const filteredUsers = useMemo(() => {
    let result = [...usersList]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.workspace?.name && u.workspace.name.toLowerCase().includes(q))
      )
    }
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }
    return result
  }, [usersList, search, roleFilter])

  // System-wide statistics
  const stats = useMemo(() => {
    const totalUsers = usersList.length
    const totalWorkspaces = usersList.filter((u) => u.workspace).length
    const totalLeads = usersList.reduce((acc, u) => acc + (u.workspace?.totalLeads ?? 0), 0)
    const totalOutreach = usersList.reduce((acc, u) => acc + (u.workspace?.totalOutreachSent ?? 0), 0)

    return { totalUsers, totalWorkspaces, totalLeads, totalOutreach }
  }, [usersList])

  // Toggle role handler
  const handleToggleRole = async (user: AdminUser) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin'
    setRoleChanging(user.id)
    try {
      await updateUserRole(user.id, nextRole)
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
      )
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setRoleChanging(null)
    }
  }

  // Reload action
  const handleRefresh = () => {
    setLoading(true)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Admin Control Center
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            System administration, workspaces mapping, and tenant analytics
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} isLoading={loading} className="w-full sm:w-auto text-xs gap-1.5 h-8">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Tenants</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{stats.totalUsers}</p>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Active in Supabase Auth
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.2 }}>
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Active Workspaces</span>
              <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{stats.totalWorkspaces}</p>
            <p className="text-xs text-zinc-400 mt-1">Tenant sandboxed databases</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }}>
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Scored Leads</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Zap className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{stats.totalLeads}</p>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Scanned via OSM + OpenAI
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.2 }}>
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">AI Outreach Approved</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <BarChart2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{stats.totalOutreach}</p>
            <p className="text-xs text-zinc-400 mt-1">Sent outreach campaigns</p>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              System Tenants ({filteredUsers.length})
            </CardTitle>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search user, email, workspace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Filter by Role */}
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="h-8 text-xs w-32"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                  <tr className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left">User</th>
                    <th className="px-5 py-3.5 text-left">Role</th>
                    <th className="px-5 py-3.5 text-left">Workspace</th>
                    <th className="px-5 py-3.5 text-left">Workload</th>
                    <th className="px-5 py-3.5 text-left">Joined</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-sm text-zinc-400 dark:text-zinc-500">
                        No registered database tenants match your search filter.
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                            {user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm flex items-center gap-1.5 leading-none">
                              {user.fullName}
                              {user.role === 'admin' && <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1 truncate max-w-50">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant={user.role === 'admin' ? 'warning' : 'secondary'} className="uppercase font-mono text-[9px] px-1.5 py-0">
                          {user.role}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        {user.workspace ? (
                          <div>
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-37.5 truncate leading-none">
                              {user.workspace.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1 font-mono leading-none truncate max-w-37.5">
                              {user.workspace.id}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">No workspace</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.workspace ? (
                          <div className="flex items-center gap-3 text-xs">
                            <div>
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">{user.workspace.totalLeads}</span>
                              <span className="text-zinc-400 ml-1">leads</span>
                            </div>
                            <Separator orientation="vertical" className="h-3 bg-zinc-200 dark:bg-zinc-700" />
                            <div>
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">{user.workspace.totalOutreachSent}</span>
                              <span className="text-zinc-400 ml-1">sent</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-zinc-400 font-mono">{formatDate(user.createdAt)}</span>
                      </td>

                      <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={roleChanging === user.id}
                            onClick={() => handleToggleRole(user)}
                            className="h-8 px-2.5 text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 gap-1"
                            title="Toggle role between Admin and User"
                          >
                            {user.role === 'admin' ? (
                              <ToggleRight className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-zinc-400" />
                            )}
                            <span className="text-[11px]">Role</span>
                          </Button>
                          <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Workspace Details Panel Slideout */}
      <Sheet open={!!selectedUserId} onClose={() => setSelectedUserId(null)} width="w-[600px]">
        {!selectedUser ? (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded" />)}
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
            {/* Slide Header */}
            <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">{selectedUser.fullName}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Slide Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* User Overview Profile */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/80 space-y-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider leading-none">Metadata</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Database User ID</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate block">{selectedUser.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Joined System</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Authorization Role</span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      <Badge variant={selectedUser.role === 'admin' ? 'warning' : 'secondary'} className="uppercase font-mono text-[9px] px-1 py-0 mt-0.5">
                        {selectedUser.role}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Last Logged In</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono block">
                      {selectedUser.lastSignInAt ? formatDate(selectedUser.lastSignInAt) : 'Never logged in'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workspace / Project details */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider leading-none flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                  Assigned Project Workspace
                </h3>
                {selectedUser.workspace ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{selectedUser.workspace.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">Workspace ID: {selectedUser.workspace.id}</p>
                      </div>
                      <Badge variant="success" className="text-[9px] px-1.5 uppercase font-mono">Operational</Badge>
                    </div>

                    {/* Leads by stage overview */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg p-2 border border-indigo-100/50 dark:border-indigo-900/10">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Discovery</span>
                        <span className="text-base font-bold font-mono text-indigo-600">{selectedUser.workspace.leadsByStage.discovery}</span>
                      </div>
                      <div className="bg-teal-50/50 dark:bg-teal-950/20 rounded-lg p-2 border border-teal-100/50 dark:border-teal-900/10">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Qualified</span>
                        <span className="text-base font-bold font-mono text-teal-600">{selectedUser.workspace.leadsByStage.qualified}</span>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-2 border border-amber-100/50 dark:border-amber-900/10">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Contacted</span>
                        <span className="text-base font-bold font-mono text-amber-600">{selectedUser.workspace.leadsByStage.contacted}</span>
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-2 border border-emerald-100/50 dark:border-emerald-900/10">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Clients</span>
                        <span className="text-base font-bold font-mono text-emerald-600">{selectedUser.workspace.leadsByStage.client}</span>
                      </div>
                    </div>

                    {/* Leads detailed table */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Leads List</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{selectedUser.workspace.leads.length} total leads</span>
                      </div>

                      <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-semibold uppercase font-mono">
                            <tr>
                              <th className="px-3 py-2">Business</th>
                              <th className="px-3 py-2">Score</th>
                              <th className="px-3 py-2 text-right">Stage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {selectedUser.workspace.leads.length === 0 && (
                              <tr>
                                <td colSpan={3} className="text-center py-6 text-zinc-400 italic">No leads scanned yet</td>
                              </tr>
                            )}
                            {selectedUser.workspace.leads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm shrink-0">{CAT_EMOJI[lead.category] ?? '🏪'}</span>
                                    <div className="min-w-0">
                                      <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-45">{lead.name}</p>
                                      <p className="text-[10px] text-zinc-400 leading-none truncate max-w-45">{lead.city}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className={cn(
                                    'font-bold font-mono px-1 rounded',
                                    getScoreColor(lead.score), getScoreBg(lead.score)
                                  )}>
                                    {lead.score}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <Badge variant="outline" className={cn(
                                    'text-[9px] uppercase font-semibold border-none px-1 h-5',
                                    STAGE_COLORS[lead.pipelineStage]
                                  )}>
                                    {getPipelineLabel(lead.pipelineStage)}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center">
                    <p className="text-xs text-zinc-400 italic">This user does not have an active database workspace.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
