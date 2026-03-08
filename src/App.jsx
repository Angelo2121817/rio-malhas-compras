import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListaCompras from './pages/ListaCompras'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lista-compras" element={<ListaCompras />} />
      </Routes>
    </BrowserRouter>
  )
}
