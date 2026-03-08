-- Rio Malhas Tecidos - Schema do Banco de Dados (Supabase)
-- Execute este script no SQL Editor do seu projeto Supabase

-- Tabela: lista_compras (itens de tecido da lista)
CREATE TABLE IF NOT EXISTS lista_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  metragem NUMERIC(10, 2),  -- metros a comprar (opcional)
  comprado BOOLEAN NOT NULL DEFAULT FALSE,
  comprado_em TIMESTAMPTZ,  -- data/hora em que foi marcado como comprado (para estatísticas)
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: estatisticas_vendas (registro quando um item é marcado como comprado)
CREATE TABLE IF NOT EXISTS estatisticas_vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_item TEXT NOT NULL,
  metragem_comprada NUMERIC(10, 2),
  data_hora_compra TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lista_compras_id UUID REFERENCES lista_compras(id) ON DELETE SET NULL
);

-- Índices para consultas mais rápidas
CREATE INDEX IF NOT EXISTS idx_lista_compras_comprado ON lista_compras(comprado);
CREATE INDEX IF NOT EXISTS idx_estatisticas_vendas_data ON estatisticas_vendas(data_hora_compra);

-- RLS: políticas para permitir uso com a chave anon (cliente web)
ALTER TABLE lista_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas_vendas ENABLE ROW LEVEL SECURITY;

-- Políticas para lista_compras (remova se já existir e for reexecutar o script)
DROP POLICY IF EXISTS "Permitir tudo em lista_compras para anon" ON lista_compras;
CREATE POLICY "Permitir tudo em lista_compras para anon"
  ON lista_compras FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para estatisticas_vendas
DROP POLICY IF EXISTS "Permitir tudo em estatisticas_vendas para anon" ON estatisticas_vendas;
CREATE POLICY "Permitir tudo em estatisticas_vendas para anon"
  ON estatisticas_vendas FOR ALL
  USING (true)
  WITH CHECK (true);

-- Se as tabelas já existiam, rode no SQL Editor para adicionar colunas novas:
-- ALTER TABLE lista_compras ADD COLUMN IF NOT EXISTS metragem NUMERIC(10, 2);
-- ALTER TABLE lista_compras ADD COLUMN IF NOT EXISTS comprado_em TIMESTAMPTZ;
-- ALTER TABLE estatisticas_vendas ADD COLUMN IF NOT EXISTS metragem_comprada NUMERIC(10, 2);
