import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return formatDate(iso)
}

export function getScoreBand(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-zinc-400'
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
  if (score >= 50) return 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
  return 'bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    restaurant: 'Restaurant',
    retail: 'Retail Shop',
    salon: 'Salon & Beauty',
    clinic: 'Clinic / Medical',
    auto_service: 'Auto Services',
    bakery: 'Bakery',
    pharmacy: 'Pharmacy',
    tailor: 'Tailor Shop',
    cafe: 'Café',
    gym: 'Gym & Fitness',
    electronics: 'Electronics',
    jewellery: 'Jewellery',
    real_estate: 'Real Estate',
    catering: 'Catering',
  }
  return map[cat] ?? cat
}

export function getPipelineLabel(stage: string): string {
  const map: Record<string, string> = {
    discovery: 'Discovery',
    qualified: 'Qualified',
    contacted: 'Contacted',
    client: 'Client',
  }
  return map[stage] ?? stage
}
