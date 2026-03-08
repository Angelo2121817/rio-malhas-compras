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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Logo className="max-w-[280px] md:max-w-[360px] w-full h-auto object-contain" theme="dark" />
      <p className="text-[#002395] mt-6 text-sm font-medium">Redirecionando...</p>
    </div>
  )
}
