'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { login } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <Input 
                  id="email"
                  required 
                  name="email" 
                  type="email" 
                  autoComplete="email"
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" 
                  placeholder="admin@example.com" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <Input 
                  id="password"
                  required 
                  name="password" 
                  type="password" 
                  autoComplete="current-password"
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-auto py-4 bg-primary-dark text-primary-foreground-dark hover:bg-primary-dark rounded-full font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Login ke Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
