import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  discovery: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20',
  qualified: 'text-[#52B788] bg-[#52B788]/10 border-[#52B788]/20',
  contacted: 'text-[#FFB347] bg-[#FFB347]/10 border-[#FFB347]/20',
  client: 'text-[#2EC4B6] bg-[#2EC4B6]/10 border-[#2EC4B6]/20',
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
    <div className="p-6 space-y-6 max-w-7xl relative overflow-hidden min-h-screen text-[#e2f0e2]" style={{
      background: 'linear-gradient(135deg, #0D2B1F 0%, #1A4A32 50%, #2D6A4F 100%)',
      fontFamily: "'Nunito', sans-serif"
    }}>
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[15%] left-[8%] w-24 h-24 opacity-5 pointer-events-none animate-[bounce_5s_ease-in-out_infinite]">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="20" y="20" width="60" height="60" rx="20" fill="#FF6B9D" />
        </svg>
      </div>

      <style>{`
        .clay-card-dark {
          background: rgba(240, 255, 244, 0.06);
          border: 3px solid #2D6A4F;
          border-radius: 28px;
          box-shadow: inset 4px 4px 10px rgba(255, 255, 255, 0.05),
                      inset -4px -4px 10px rgba(0, 0, 0, 0.4),
                      0 15px 30px rgba(13, 43, 31, 0.45);
          backdrop-filter: blur(12px);
        }
        .clay-input-dark {
          background: rgba(13, 43, 31, 0.6) !important;
          border: 2px solid #2D6A4F !important;
          border-radius: 12px !important;
          color: #ffffff !important;
          box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.2) !important;
        }
        .clay-input-dark::placeholder {
          color: #74C69D !important;
          opacity: 0.7;
        }
        .clay-btn {
          background: linear-gradient(180deg, #40916C 0%, #2D6A4F 100%);
          border: none;
          box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.2), 
                      0 4px 8px rgba(0, 0, 0, 0.2);
          font-weight: 800;
          color: white;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .clay-btn:hover {
          transform: translateY(-1px);
          box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.3), 
                      0 6px 12px rgba(13, 43, 31, 0.4);
        }
        .clay-table-row:hover {
          background: rgba(240, 255, 244, 0.04) !important;
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-[#52B788]" />
            Admin Control Center
          </h1>
          <p className="text-sm text-[#74C69D] mt-0.5 font-bold">
            System administration, workspaces mapping, and tenant analytics
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          isLoading={loading} 
          className="clay-btn px-4 py-2 text-xs flex items-center gap-1.5 h-10 w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} className="clay-card-dark p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider">Total Tenants</span>
            <div className="h-10 w-10 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center text-purple-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalUsers}</p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#52B788]" /> Active in Supabase Auth
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} whileHover={{ y: -3 }} className="clay-card-dark p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider">Active Workspaces</span>
            <div className="h-10 w-10 rounded-xl bg-[#2EC4B6]/20 border border-[#2EC4B6]/30 flex items-center justify-center text-[#4EECD6]">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalWorkspaces}</p>
          <p className="text-xs text-emerald-300/60 mt-2 font-semibold">Tenant sandboxed databases</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -3 }} className="clay-card-dark p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider">Total Scored Leads</span>
            <div className="h-10 w-10 rounded-xl bg-[#FFB347]/20 border border-[#FFB347]/30 flex items-center justify-center text-[#FFD166]">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalLeads}</p>
          <p className="text-xs text-[#74C69D] mt-2 flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3.5 w-3.5 text-[#52B788]" /> Scanned via OSM + OpenAI
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} whileHover={{ y: -3 }} className="clay-card-dark p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider">AI Outreach Approved</span>
            <div className="h-10 w-10 rounded-xl bg-[#52B788]/20 border border-[#52B788]/30 flex items-center justify-center text-[#74C69D]">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{stats.totalOutreach}</p>
          <p className="text-xs text-emerald-300/60 mt-2 font-semibold">Sent outreach campaigns</p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="clay-card-dark p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#2D6A4F]/30">
          <div>
            <h2 className="clay-card-title flex items-center gap-2">
              <Users className="h-5 w-5 text-[#52B788]" />
              System Tenants ({filteredUsers.length})
            </h2>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74C69D]" />
              <Input
                placeholder="Search user, email, workspace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="clay-input-dark pl-9 h-10 text-xs"
              />
            </div>

            {/* Filter by Role */}
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="clay-input-dark h-10 text-xs w-36 px-2 cursor-pointer outline-none"
            >
              <option value="all" className="bg-[#0D2B1F]">All Roles</option>
              <option value="admin" className="bg-[#0D2B1F]">Admin</option>
              <option value="user" className="bg-[#0D2B1F]">User</option>
            </Select>
          </div>
        </div>

        <div className="p-0 mt-4">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl bg-emerald-950/40" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border-2 border-[#2D6A4F]/30 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="border-b-2 border-[#2D6A4F]/50 bg-[#0d2b1f]/50 text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Workspace</th>
                    <th className="px-5 py-4">Workload</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D6A4F]/20 text-[#e2f0e2]">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-sm text-[#74C69D] italic">
                        No registered database tenants match your search filter.
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className="clay-table-row cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#52B788] to-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                            {user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-white text-sm flex items-center gap-1.5 leading-none">
                              {user.fullName}
                              {user.role === 'admin' && <ShieldAlert className="h-4 w-4 text-[#FFB347]" />}
                            </p>
                            <p className="text-xs text-[#74C69D] mt-1.5 truncate max-w-48 font-semibold">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant={user.role === 'admin' ? 'warning' : 'secondary'} className="uppercase font-mono text-[10px] px-2 py-0.5 border border-white/5 rounded-full">
                          {user.role}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        {user.workspace ? (
                          <div>
                            <p className="text-xs font-bold text-white max-w-[150px] truncate leading-none">
                              {user.workspace.name}
                            </p>
                            <p className="text-[10px] text-[#74C69D]/80 mt-1.5 font-mono leading-none truncate max-w-[150px]">
                              {user.workspace.id}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-[#74C69D] italic font-semibold">No workspace</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.workspace ? (
                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <div>
                              <span className="font-extrabold text-white">{user.workspace.totalLeads}</span>
                              <span className="text-[#74C69D] ml-1">leads</span>
                            </div>
                            <Separator orientation="vertical" className="h-3.5 bg-[#2D6A4F]/40" />
                            <div>
                              <span className="font-extrabold text-white">{user.workspace.totalOutreachSent}</span>
                              <span className="text-[#74C69D] ml-1">sent</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#74C69D]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-[#74C69D] font-mono font-bold">{formatDate(user.createdAt)}</span>
                      </td>

                      <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={roleChanging === user.id}
                            onClick={() => handleToggleRole(user)}
                            className="h-8 px-2.5 text-xs text-[#74C69D] hover:text-white dark:hover:text-white gap-1 bg-black/10 hover:bg-black/20 border border-[#2D6A4F]/30 rounded-lg"
                            title="Toggle role between Admin and User"
                          >
                            {user.role === 'admin' ? (
                              <ToggleRight className="h-5 w-5 text-[#52B788]" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-zinc-400" />
                            )}
                            <span className="text-[10px] font-bold">Role</span>
                          </Button>
                          <ChevronRight className="h-4 w-4 text-[#74C69D] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Workspace Details Panel Slideout */}
      <Sheet open={!!selectedUserId} onClose={() => setSelectedUserId(null)} width="w-[600px]">
        {!selectedUser ? (
          <div className="p-6 space-y-4 bg-[#0d2b1f] text-[#e2f0e2] h-full border-l border-[#2D6A4F]">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32 bg-emerald-950/40" />
              <Skeleton className="h-8 w-8 rounded bg-emerald-950/40" />
            </div>
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded bg-emerald-950/40" />)}
          </div>
        ) : (
          <div className="h-full flex flex-col bg-[#0D2B1F] text-[#e2f0e2] border-l border-[#2D6A4F] font-sans">
            {/* Slide Header */}
            <div className="sticky top-0 z-10 bg-[#0d2b1f] border-b border-[#2D6A4F]/40 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#52B788] to-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-white truncate">{selectedUser.fullName}</h2>
                  <p className="text-xs text-[#74C69D] mt-0.5 font-semibold">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black/20 text-[#74C69D] hover:text-white transition-colors shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Slide Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* User Overview Profile */}
              <div className="bg-[#1A4A32]/40 rounded-2xl p-4 border-2 border-[#2D6A4F]/40 space-y-3 shadow-md">
                <h3 className="text-xs font-bold text-[#52B788] uppercase tracking-wider leading-none">Metadata</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-[#74C69D] block mb-0.5 font-semibold">Database User ID</span>
                    <span className="font-mono text-white truncate block">{selectedUser.id}</span>
                  </div>
                  <div>
                    <span className="text-[#74C69D] block mb-0.5 font-semibold">Joined System</span>
                    <span className="text-white font-mono flex items-center gap-1 font-bold">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#74C69D] block mb-0.5 font-semibold">Authorization Role</span>
                    <span className="text-white">
                      <Badge variant={selectedUser.role === 'admin' ? 'warning' : 'secondary'} className="uppercase font-mono text-[9px] px-2 py-0.5 rounded-full mt-0.5">
                        {selectedUser.role}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-[#74C69D] block mb-0.5 font-semibold">Last Logged In</span>
                    <span className="text-white font-mono block font-bold">
                      {selectedUser.lastSignInAt ? formatDate(selectedUser.lastSignInAt) : 'Never logged in'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workspace / Project details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#74C69D] uppercase tracking-wider leading-none flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[#52B788]" />
                  Assigned Project Workspace
                </h3>
                {selectedUser.workspace ? (
                  <div className="border-2 border-[#2D6A4F]/40 rounded-2xl p-4 space-y-4 bg-[#1A4A32]/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-white">{selectedUser.workspace.name}</h4>
                        <p className="text-[10px] text-[#74C69D] mt-1 font-mono">Workspace ID: {selectedUser.workspace.id}</p>
                      </div>
                      <Badge variant="success" className="text-[9px] px-2 py-0.5 uppercase font-mono rounded-full">Operational</Badge>
                    </div>

                    {/* Leads by stage overview */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-[#8b5cf6]/10 rounded-xl p-2 border border-[#8b5cf6]/20">
                        <span className="text-[10px] text-[#74C69D] block font-semibold">Discovery</span>
                        <span className="text-base font-extrabold font-mono text-purple-300">{selectedUser.workspace.leadsByStage.discovery}</span>
                      </div>
                      <div className="bg-[#52B788]/10 rounded-xl p-2 border border-[#52B788]/20">
                        <span className="text-[10px] text-[#74C69D] block font-semibold">Qualified</span>
                        <span className="text-base font-extrabold font-mono text-[#52B788]">{selectedUser.workspace.leadsByStage.qualified}</span>
                      </div>
                      <div className="bg-[#FFB347]/10 rounded-xl p-2 border border-[#FFB347]/20">
                        <span className="text-[10px] text-[#74C69D] block font-semibold">Contacted</span>
                        <span className="text-base font-extrabold font-mono text-[#FFB347]">{selectedUser.workspace.leadsByStage.contacted}</span>
                      </div>
                      <div className="bg-[#2EC4B6]/10 rounded-xl p-2 border border-[#2EC4B6]/20">
                        <span className="text-[10px] text-[#74C69D] block font-semibold">Clients</span>
                        <span className="text-base font-extrabold font-mono text-[#2EC4B6]">{selectedUser.workspace.leadsByStage.client}</span>
                      </div>
                    </div>

                    {/* Leads detailed table */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Leads List</span>
                        <span className="text-[10px] text-[#74C69D] font-mono font-bold">{selectedUser.workspace.leads.length} total leads</span>
                      </div>

                      <div className="border-2 border-[#2D6A4F]/30 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-black/10">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#0D2B1F] border-b border-[#2D6A4F]/30 text-emerald-300 font-bold uppercase font-mono text-[9px] tracking-wider">
                            <tr>
                              <th className="px-3 py-2.5">Business</th>
                              <th className="px-3 py-2.5">Score</th>
                              <th className="px-3 py-2.5 text-right">Stage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2D6A4F]/20 text-[#e2f0e2]">
                            {selectedUser.workspace.leads.length === 0 && (
                              <tr>
                                <td colSpan={3} className="text-center py-6 text-[#74C69D] italic font-semibold">No leads scanned yet</td>
                              </tr>
                            )}
                            {selectedUser.workspace.leads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-white/5">
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base shrink-0">{CAT_EMOJI[lead.category] ?? '🏪'}</span>
                                    <div className="min-w-0">
                                      <p className="font-bold text-white truncate max-w-[160px]">{lead.name}</p>
                                      <p className="text-[9px] text-[#74C69D] leading-none truncate max-w-[160px] font-semibold">{lead.city}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className={cn(
                                    'font-extrabold font-mono px-1.5 py-0.5 rounded text-[10px]',
                                    getScoreColor(lead.score), getScoreBg(lead.score)
                                  )}>
                                    {lead.score}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <Badge variant="outline" className={cn(
                                    'text-[9px] uppercase font-bold border-none px-1.5 h-5 rounded-full',
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
                  <div className="border-2 border-dashed border-[#2D6A4F]/40 rounded-2xl p-8 text-center bg-black/5">
                    <p className="text-xs text-[#74C69D] italic font-semibold">This user does not have an active database workspace.</p>
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
