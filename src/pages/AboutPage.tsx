import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Rocket, Target, Users } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-teal-100 selection:text-teal-900">
      <PublicNavbar />
      
      <main className="pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
            About ClientPilot AI
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-16 leading-relaxed">
            We are on a mission to completely automate the client acquisition pipeline for software development agencies.
          </p>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">The Problem</h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Software agencies spend thousands of hours manually scraping Google Maps, analyzing websites, and drafting cold emails. 
              The process is tedious, error-prone, and doesn't scale. Most agencies rely on expensive data brokers that provide outdated, generalized leads that don't convert.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Our Solution</h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              ClientPilot AI combines the open-source power of OpenStreetMap with the reasoning capabilities of Large Language Models (like OpenAI's GPT-4). 
              Instead of just giving you a list of names, our system actively scores them based on their digital presence gap, category fit, and market density.
            </p>

            <div className="grid md:grid-cols-3 gap-8 my-12 not-prose">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <Target className="h-8 w-8 text-teal-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Precision Targeting</h3>
                <p className="text-sm text-zinc-500">Find exactly the businesses that need your services the most.</p>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <Rocket className="h-8 w-8 text-indigo-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Automated Outreach</h3>
                <p className="text-sm text-zinc-500">Draft personalized emails that highlight their specific technical gaps.</p>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <Users className="h-8 w-8 text-amber-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Agency Growth</h3>
                <p className="text-sm text-zinc-500">Focus on closing deals and building software, not hunting for leads.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
