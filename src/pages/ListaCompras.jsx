import { useState, useEffect } from 'react'
import { supabase, temSupabase } from '../lib/supabase'
import Logo from '../components/Logo'

const STORAGE_KEY = 'rio-malhas-lista'

function carregarDoStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function salvarNoStorage(itens) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
  } catch (_) {}
}

function parseMetragem(val) {
  if (val === '' || val == null) return null
  const n = Number(String(val).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

function formatMetragem(m) {
  if (m == null || m === '') return ''
  const n = Number(m)
  return Number.isFinite(n) ? `${n} m` : ''
}

export default function ListaCompras() {
  const [itens, setItens] = useState([])
  const [novoNome, setNovoNome] = useState('')
  const [novoMetragem, setNovoMetragem] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editandoNome, setEditandoNome] = useState('')
  const [editandoMetragem, setEditandoMetragem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  async function carregarItens() {
    setCarregando(true)
    setErro(null)
    if (temSupabase()) {
      const { data, error } = await supabase
        .from('lista_compras')
        .select('*')
        .order('criado_em', { ascending: false })
      if (error) {
        setErro(error.message)
        setItens([])
      } else {
        setItens(data || [])
      }
    } else {
      const local = carregarDoStorage()
      setItens(local)
    }
    setCarregando(false)
  }

  useEffect(() => {
    carregarItens()
  }, [])

  async function adicionar(e) {
    e.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return
    const metragem = parseMetragem(novoMetragem)
    setErro(null)
    if (temSupabase()) {
      const { error } = await supabase
        .from('lista_compras')
        .insert({ nome, metragem, comprado: false })
      if (error) {
        setErro(error.message)
        return
      }
      setNovoNome('')
      setNovoMetragem('')
      carregarItens()
    } else {
      const novo = {
        id: crypto.randomUUID?.() ?? `local-${Date.now()}`,
        nome,
        metragem,
        comprado: false,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }
      const lista = [novo, ...carregarDoStorage()]
      salvarNoStorage(lista)
      setItens(lista)
      setNovoNome('')
      setNovoMetragem('')
    }
  }

  async function toggleComprado(item) {
    const novoComprado = !item.comprado
    setErro(null)
    if (temSupabase()) {
      const { error: updateError } = await supabase
        .from('lista_compras')
        .update({ comprado: novoComprado, atualizado_em: new Date().toISOString() })
        .eq('id', item.id)
      if (updateError) {
        setErro(updateError.message)
        return
      }
      if (novoComprado) {
        await supabase.from('estatisticas_vendas').insert({
          nome_item: item.nome,
          metragem_comprada: item.metragem ?? null,
          data_hora_compra: new Date().toISOString(),
          lista_compras_id: item.id,
        })
      }
      carregarItens()
    } else {
      const lista = carregarDoStorage().map((i) =>
        i.id === item.id
          ? { ...i, comprado: novoComprado, atualizado_em: new Date().toISOString() }
          : i
      )
      salvarNoStorage(lista)
      setItens(lista)
    }
  }

  async function salvarEdicao() {
    if (editandoId == null) return
    const nome = editandoNome.trim()
    if (!nome) return
    const metragem = parseMetragem(editandoMetragem)
    setErro(null)
    if (temSupabase()) {
      const { error } = await supabase
        .from('lista_compras')
        .update({ nome, metragem, atualizado_em: new Date().toISOString() })
        .eq('id', editandoId)
      if (error) {
        setErro(error.message)
        return
      }
      setEditandoId(null)
      setEditandoNome('')
      setEditandoMetragem('')
      carregarItens()
    } else {
      const lista = carregarDoStorage().map((i) =>
        i.id === editandoId
          ? { ...i, nome, metragem, atualizado_em: new Date().toISOString() }
          : i
      )
      salvarNoStorage(lista)
      setItens(lista)
      setEditandoId(null)
      setEditandoNome('')
      setEditandoMetragem('')
    }
  }

  function iniciarEdicao(item) {
    setEditandoId(item.id)
    setEditandoNome(item.nome)
    setEditandoMetragem(item.metragem != null ? String(item.metragem) : '')
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setEditandoNome('')
    setEditandoMetragem('')
  }

  async function remover(id) {
    setErro(null)
    if (temSupabase()) {
      const { error } = await supabase.from('lista_compras').delete().eq('id', id)
      if (error) {
        setErro(error.message)
        return
      }
      carregarItens()
    } else {
      const lista = carregarDoStorage().filter((i) => i.id !== id)
      salvarNoStorage(lista)
      setItens(lista)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#002395] text-white py-4 shadow">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3">
          <Logo
            theme="light"
            variant="compact"
            className="h-10 md:h-12 w-auto object-contain object-center min-w-[140px]"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">Rio Malhas Tecidos</h1>
            <p className="text-white/80 text-sm">
              Lista de Compras
              {!temSupabase() && (
                <span className="block text-white/60 text-xs mt-0.5">
                  Dados salvos no navegador. Configure o Supabase no Railway para sincronizar.
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={adicionar} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome do tecido..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002395] focus:border-transparent"
          />
          <input
            type="text"
            inputMode="decimal"
            value={novoMetragem}
            onChange={(e) => setNovoMetragem(e.target.value)}
            placeholder="Metragem (m)"
            className="w-full sm:w-28 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002395] focus:border-transparent"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#002395] text-white px-4 py-2 font-medium hover:bg-[#001a6e] transition whitespace-nowrap"
          >
            Adicionar
          </button>
        </form>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 text-sm">
            {erro}
          </div>
        )}

        {carregando ? (
          <p className="text-slate-500">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-slate-500">Nenhum item na lista. Adicione um tecido acima.</p>
        ) : (
          <ul className="space-y-2">
            {itens.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={!!item.comprado}
                  onChange={() => toggleComprado(item)}
                  className="w-5 h-5 rounded border-slate-300 text-[#002395] focus:ring-[#002395]"
                />
                {editandoId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editandoNome}
                      onChange={(e) => setEditandoNome(e.target.value)}
                      placeholder="Nome"
                      className="flex-1 min-w-0 rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002395]"
                      autoFocus
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editandoMetragem}
                      onChange={(e) => setEditandoMetragem(e.target.value)}
                      placeholder="m"
                      className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002395]"
                    />
                    <button
                      type="button"
                      onClick={salvarEdicao}
                      className="text-sm text-[#002395] font-medium hover:underline"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      className="text-sm text-slate-500 hover:underline"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex-1 min-w-0 ${
                        item.comprado ? 'line-through text-slate-500' : 'text-slate-800'
                      }`}
                    >
                      {item.nome}
                      {item.metragem != null && item.metragem !== '' && (
                        <span className="text-slate-500 font-medium ml-1.5">
                          {formatMetragem(item.metragem)}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(item)}
                      className="text-sm text-[#002395] hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(item.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
