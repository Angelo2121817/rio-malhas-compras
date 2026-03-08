import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/lista-compras', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-[#002395]/5">
      <div className="absolute inset-0 bg-[radial-gradient(#00239508_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden />
      <div className="relative z-10 flex flex-col items-center">
        <Logo className="max-w-[380px] md:max-w-[500px] w-full h-auto object-contain drop-shadow-sm" theme="dark" />
        <p className="text-[#002395] mt-8 text-sm font-semibold tracking-wide uppercase opacity-80 animate-pulse">
          Redirecionando...
        </p>
        <div className="mt-4 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#002395]/60 animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-[#002395]/80 animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-[#002395] animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
