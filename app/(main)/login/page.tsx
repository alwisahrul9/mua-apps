'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { login } from './actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container-custom flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl mb-4">MUA Dashboard</h1>
          <p className="text-muted-foreground-dark">Silakan login untuk mengelola booking.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-dark border border-foreground-dark/10 rounded-3xl p-8 shadow-sm"
        >
          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <input 
                  required 
                  name="email" 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground-dark/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-dark/50 transition-all" 
                  placeholder="admin@example.com" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <input 
                  required 
                  name="password" 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-foreground-dark/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-dark/50 transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-4 bg-primary-dark text-primary-foreground-dark rounded-full font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Login ke Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
