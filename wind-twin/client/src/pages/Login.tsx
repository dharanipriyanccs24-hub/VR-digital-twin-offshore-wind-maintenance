import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore(state => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuth({ id: 'user-1', email, name: 'Operator', role: 'OPERATOR' }, 'token-placeholder')
    navigate('/')
  }

  return (
    <div className="grid min-h-screen place-items-center bg-midnight px-4">
      <div className="w-full max-w-md rounded-3xl bg-[#03111f]/95 p-10 shadow-2xl border border-cyan-500/10">
        <h1 className="mb-6 text-3xl font-semibold text-white">OceanSentinel Login</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm text-cyan-200">Email</label>
          <input className="w-full rounded-2xl border border-cyan-500/20 bg-[#02101c] px-4 py-3 text-white" value={email} onChange={e => setEmail(e.target.value)} />
          <label className="block text-sm text-cyan-200">Password</label>
          <input type="password" className="w-full rounded-2xl border border-cyan-500/20 bg-[#02101c] px-4 py-3 text-white" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Sign in</button>
        </form>
      </div>
    </div>
  )
}
