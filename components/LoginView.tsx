'use client'

import { useState } from 'react'
import { verifyPin } from '@/app/actions'

export function LoginView({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await verifyPin(pin)
    if (ok) {
      onAuth()
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-3xl font-bold tracking-tight">Operations Screen</h1>

      <form
        onSubmit={submit}
        className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col gap-4 w-80"
      >
        <h2 className="text-gray-300 text-lg font-semibold text-center">Enter PIN</h2>

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          autoFocus
          className="text-center text-3xl tracking-[0.5em] bg-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:tracking-widest placeholder:text-gray-600"
        />

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || pin.length === 0}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </main>
  )
}
