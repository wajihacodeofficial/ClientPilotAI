import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Mail, Clock, CheckCircle } from 'lucide-react'
import { Badge, Skeleton } from '@/components/ui'
import { useAppStore } from '@/store/useAppStore'
import { formatDate } from '@/lib/utils'

export function MessagesPage() {
  const leads = useAppStore((s) => s.leads)
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  
  // Wait for leads to be populated if they are empty
  const loading = leads.length === 0;

  // Derive all sent messages from leads
  const allMessages = useMemo(() => {
    const msgs: Array<{
      id: string;
      leadId: string;
      leadName: string;
      subject: string;
      body: string;
      status: string;
      createdAt: string;
    }> = [];

    leads.forEach((lead) => {
      if (lead.outreachMessages && lead.outreachMessages.length > 0) {
        lead.outreachMessages.forEach((msg) => {
          msgs.push({
            id: msg.id || Math.random().toString(),
            leadId: lead.id,
            leadName: lead.name,
            subject: msg.subject || 'No Subject',
            body: msg.body || '',
            status: msg.status || 'draft',
            createdAt: msg.createdAt || new Date().toISOString(),
          });
        });
      }
    });

    // Sort by created at descending
    return msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads]);

  return (
    <div className="p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" /> Message Records
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            A complete history of your outreach messages to leads.
          </p>
        </div>
        <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md">
          {allMessages.length} Messages
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2 mt-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {allMessages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-sm text-zinc-400 dark:text-zinc-500">
                      No message records found. Generate and send some outreach to see them here!
                    </td>
                  </tr>
                )}
                {allMessages.map((msg, i) => (
                  <motion.tr
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedLeadId(msg.leadId)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        {formatDate(msg.createdAt)}
                      </span>
                    </td>

                    {/* Business */}
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                        {msg.leadName}
                      </span>
                    </td>

                    {/* Subject & Snippet */}
                    <td className="px-4 py-4 w-full max-w-md">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-zinc-400" /> {msg.subject}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                          {msg.body}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      <Badge variant={msg.status === 'sent' ? 'success' : 'muted'} className="capitalize">
                        {msg.status === 'sent' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {msg.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
