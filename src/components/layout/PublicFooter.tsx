import { Link } from 'react-router-dom'
import { MapPin, Mail } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ClientPilot AI Logo" className="h-6 w-6 rounded object-cover grayscale" />
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              ClientPilot<span className="text-teal-600"> AI</span>
            </span>
          </div>
          <p className="text-sm text-zinc-500 max-w-sm">
            The next-generation client acquisition engine for modern software agencies. Find, score, and contact local businesses on autopilot.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="h-3.5 w-3.5" /> San Francisco, CA
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Mail className="h-3.5 w-3.5" /> hello@clientpilot.ai
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 text-sm">Product</h4>
          <ul className="space-y-2.5 text-sm text-zinc-500">
            <li><a href="#features" className="hover:text-teal-600 transition-colors">Features</a></li>
            <li><Link to="/about" className="hover:text-teal-600 transition-colors">How it works</Link></li>
            <li><a href="#" className="hover:text-teal-600 transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 text-sm">Company</h4>
          <ul className="space-y-2.5 text-sm text-zinc-500">
            <li><Link to="/about" className="hover:text-teal-600 transition-colors">About Us</Link></li>
            <li><a href="#" className="hover:text-teal-600 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <p className="text-xs text-zinc-400">© 2026 ClientPilot AI. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-zinc-400 hover:text-zinc-600">Twitter</a>
          <a href="#" className="text-zinc-400 hover:text-zinc-600">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
