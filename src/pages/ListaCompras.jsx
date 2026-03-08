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

  const totalItens = itens.length
  const totalComprados = itens.filter((i) => i.comprado).length

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
    <div className="min-h-screen bg-[#f0f4fa]">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-[#002395] via-[#001f8c] to-[#001a6e] text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23ffffff\' fill-opacity=\'0.04\'/%3E%3C/g%3E%3C/svg%3E')] opacity-80" aria-hidden />
        <div className="relative max-w-2xl mx-auto px-4 py-6 md:py-8 flex items-center gap-4">
          <Logo
            theme="light"
            variant="compact"
            className="h-14 md:h-20 w-auto object-contain min-w-[180px] drop-shadow-md"
          />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Rio Malhas Tecidos</h1>
            <p className="text-white/90 text-sm font-medium mt-0.5">
              Lista de Compras
              {!temSupabase() && (
                <span className="block text-white/60 text-xs mt-1">Dados salvos no navegador.</span>
              )}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-10">
        {/* Card: Novo item */}
        <section className="bg-white rounded-2xl shadow-lg shadow-slate-300/30 border border-white/80 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#002395] text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </span>
            <h2 className="text-slate-800 font-bold text-lg">Adicionar tecido</h2>
          </div>
          <form onSubmit={adicionar} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Malha fria, cetim..."
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20 transition-all"
            />
            <input
              type="text"
              inputMode="decimal"
              value={novoMetragem}
              onChange={(e) => setNovoMetragem(e.target.value)}
              placeholder="Metragem (m)"
              className="w-full sm:w-28 rounded-xl border-2 border-slate-200 px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20 transition-all"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#002395] text-white px-6 py-3.5 font-bold hover:bg-[#001a6e] active:scale-[0.98] shadow-lg shadow-[#002395]/30 hover:shadow-xl hover:shadow-[#002395]/40 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Adicionar
            </button>
          </form>
        </section>

        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-100 text-red-800 text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {erro}
          </div>
        )}

        {/* Estatísticas */}
        {!carregando && itens.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#002395]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#002395]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalItens}</p>
                <p className="text-sm text-slate-500 font-medium">Total na lista</p>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalComprados}</p>
                <p className="text-sm text-slate-500 font-medium">Comprados</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {carregando ? (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
            <span className="h-3 w-3 rounded-full bg-[#002395] animate-pulse" />
            <span className="h-3 w-3 rounded-full bg-[#002395] animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-3 w-3 rounded-full bg-[#002395] animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        ) : itens.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <p className="text-slate-700 font-semibold text-lg">Lista vazia</p>
            <p className="text-slate-500 text-sm mt-1">Adicione o primeiro tecido usando o formulário acima.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-slate-700 font-bold text-sm uppercase tracking-wider px-1">Sua lista</h3>
            <ul className="space-y-3">
              {itens.map((item) => (
                <li
                  key={item.id}
                  className={`bg-white rounded-2xl border-2 shadow-md transition-all overflow-hidden ${
                    item.comprado ? 'border-slate-100 opacity-85' : 'border-slate-100 hover:shadow-lg hover:border-[#002395]/20'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Checkbox: só o input, sem label, para evitar duplo disparo */}
                    <div className="flex items-center justify-center shrink-0 w-10 h-10">
                      <input
                        type="checkbox"
                        checked={!!item.comprado}
                        onChange={() => toggleComprado(item)}
                        className="w-6 h-6 rounded-lg border-2 border-slate-300 text-[#002395] focus:ring-2 focus:ring-[#002395]/40 focus:ring-offset-2 cursor-pointer"
                      />
                    </div>

                    {editandoId === item.id ? (
                      <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                        <input
                          type="text"
                          value={editandoNome}
                          onChange={(e) => setEditandoNome(e.target.value)}
                          placeholder="Nome do tecido"
                          className="flex-1 min-w-[140px] rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                          autoFocus
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editandoMetragem}
                          onChange={(e) => setEditandoMetragem(e.target.value)}
                          placeholder="m"
                          className="w-20 rounded-xl border-2 border-slate-200 px-2 py-2.5 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={salvarEdicao}
                            className="rounded-xl bg-[#002395] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#001a6e] transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={cancelarEdicao}
                            className="rounded-xl border-2 border-slate-200 text-slate-600 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-slate-800 ${item.comprado ? 'line-through text-slate-400' : ''}`}>
                            {item.nome}
                          </span>
                          {item.metragem != null && item.metragem !== '' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-[#002395]/15 text-[#002395] border border-[#002395]/20">
                              {formatMetragem(item.metragem)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(item)}
                            className="rounded-xl p-2.5 text-[#002395] hover:bg-[#002395]/10 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => remover(item.id)}
                            className="rounded-xl p-2.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="Remover"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
