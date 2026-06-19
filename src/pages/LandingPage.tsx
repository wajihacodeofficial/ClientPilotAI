import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { Radar, Sparkles, Send, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-teal-100 selection:text-teal-900">
      <PublicNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-white dark:from-teal-950/20 dark:via-zinc-950 dark:to-zinc-950 -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-300 text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>Now with GPT-4 powered lead scoring</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 max-w-4xl mx-auto"
            >
              Acquire High-Value Clients on <span className="text-teal-600">Autopilot</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              The ultimate client acquisition engine for modern software agencies. We scan local markets, analyze digital presence, and generate hyper-personalized outreach in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white h-14 px-8 text-base shadow-xl shadow-teal-600/20 w-full sm:w-auto">
                  Start Discovering Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto">
                  How it works
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Everything you need to close more deals</h2>
              <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">Stop scraping Google Maps manually. ClientPilot AI automates the entire pipeline from discovery to first contact.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6">
                  <Radar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Smart Discovery</h3>
                <p className="text-zinc-500 leading-relaxed">Instantly pull thousands of local businesses from OpenStreetMap based on category and radius. No API limits or expensive data brokers.</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles className="h-32 w-32" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">AI Qualification</h3>
                <p className="text-zinc-500 leading-relaxed">Our AI analyzes their web presence, reviews, and market gaps to give you a 0-100 conversion score. Focus only on high-intent leads.</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Automated Outreach</h3>
                <p className="text-zinc-500 leading-relaxed">Generate highly personalized cold emails that mention specific gaps in their digital strategy. Integrates with your existing pipeline.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-teal-600"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to scale your agency?</h2>
            <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
              Join top software agencies using ClientPilot AI to build a predictable, high-converting client pipeline.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-zinc-50 h-14 px-8 text-base shadow-xl">
                Create Free Account
              </Button>
            </Link>
            <p className="text-teal-200 text-sm mt-6 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 14-day free trial</span>
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
