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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-gradient-to-r from-[#002395] to-[#001a6e] text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" aria-hidden />
        <div className="relative max-w-2xl mx-auto px-4 py-5 md:py-6 flex items-center gap-4">
          <Logo
            theme="light"
            variant="compact"
            className="h-14 md:h-20 w-auto object-contain object-center min-w-[180px] drop-shadow-sm"
          />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-tight">Rio Malhas Tecidos</h1>
            <p className="text-white/90 text-sm font-medium mt-0.5">
              Lista de Compras
              {!temSupabase() && (
                <span className="block text-white/70 text-xs font-normal mt-1">
                  Dados salvos no navegador. Configure o Supabase no Railway para sincronizar.
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-10">
        <section className="bg-white rounded-2xl shadow-md shadow-slate-200/80 border border-slate-100 p-5 md:p-6 mb-8">
          <h2 className="text-slate-800 font-semibold text-sm uppercase tracking-wider mb-4">Novo item</h2>
          <form onSubmit={adicionar} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Nome do tecido..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002395]/40 focus:border-[#002395]"
            />
            <input
              type="text"
              inputMode="decimal"
              value={novoMetragem}
              onChange={(e) => setNovoMetragem(e.target.value)}
              placeholder="Metragem (m)"
              className="w-full sm:w-28 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002395]/40 focus:border-[#002395]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#002395] text-white px-5 py-3 font-semibold hover:bg-[#001a6e] active:scale-[0.98] shadow-md shadow-[#002395]/25 hover:shadow-lg hover:shadow-[#002395]/30 transition-all whitespace-nowrap"
            >
              Adicionar
            </button>
          </form>
        </section>

        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm font-medium">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#002395]/50 animate-pulse" />
            <span className="text-sm font-medium">Carregando...</span>
          </div>
        ) : itens.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-10 text-center">
            <p className="text-slate-500 font-medium">Nenhum item na lista.</p>
            <p className="text-slate-400 text-sm mt-1">Adicione um tecido no formulário acima.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {itens.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md hover:border-slate-200 ${
                  item.comprado ? 'border-slate-100 opacity-90' : 'border-slate-100'
                }`}
              >
                <label className="flex items-center shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!item.comprado}
                    onChange={() => toggleComprado(item)}
                    className="w-5 h-5 rounded-md border-2 border-slate-300 text-[#002395] focus:ring-2 focus:ring-[#002395]/40 focus:ring-offset-0"
                  />
                </label>
                {editandoId === item.id ? (
                  <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                    <input
                      type="text"
                      value={editandoNome}
                      onChange={(e) => setEditandoNome(e.target.value)}
                      placeholder="Nome"
                      className="flex-1 min-w-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002395]/40 focus:border-[#002395]"
                      autoFocus
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editandoMetragem}
                      onChange={(e) => setEditandoMetragem(e.target.value)}
                      placeholder="m"
                      className="w-20 rounded-xl border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002395]/40 focus:border-[#002395]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={salvarEdicao}
                        className="rounded-lg bg-[#002395] text-white px-3 py-2 text-sm font-semibold hover:bg-[#001a6e] transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicao}
                        className="rounded-lg border border-slate-200 text-slate-600 px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-medium ${
                          item.comprado ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item.nome}
                      </span>
                      {item.metragem != null && item.metragem !== '' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#002395]/10 text-[#002395]">
                          {formatMetragem(item.metragem)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(item)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-[#002395] hover:bg-[#002395]/10 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => remover(item.id)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
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
