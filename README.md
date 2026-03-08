# Rio Malhas Tecidos – Lista de Compras

Aplicação web para a loja **Rio Malhas Tecidos**: tela inicial com logo e lista de compras (CRUD) com registro de compras em estatísticas no Supabase.

## Stack

- **React** (Vite)
- **Tailwind CSS**
- **Supabase** (banco de dados)
- **React Router**
- Deploy: **Railway** via **GitHub**

## Logo

A logo da loja é exibida na tela inicial e no cabeçalho da Lista de Compras. Salve o arquivo de logo como **`public/rio-malhas-tecidos-logo.png`** (formato PNG, fundo branco, tema azul Bic) para que a aplicação a carregue corretamente.

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) e no [Railway](https://railway.app)

---

## Rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [Supabase](https://supabase.com/dashboard).
2. No **SQL Editor**, execute o conteúdo do arquivo `supabase/schema.sql` para criar as tabelas `lista_compras` e `estatisticas_vendas`.
3. Em **Settings > API**, copie:
   - **Project URL**
   - **anon public** (chave pública)

### 3. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como base):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Subir o projeto

```bash
npm run dev
```

Acesse: **http://localhost:5173**

---

## Deploy no Railway via GitHub

### 1. Subir o código no GitHub

1. Crie um repositório no GitHub (ex.: `rio-malhas-compras`).
2. Na pasta do projeto, inicialize o Git (se ainda não existir) e envie o código:

```bash
git init
git add .
git commit -m "Initial commit - Rio Malhas Tecidos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/rio-malhas-compras.git
git push -u origin main
```

*(Substitua `SEU_USUARIO/rio-malhas-compras` pelo seu usuário e nome do repositório.)*

### 2. Conectar o repositório no Railway

1. Acesse [Railway](https://railway.app) e faça login (pode ser com GitHub).
2. Clique em **New Project**.
3. Escolha **Deploy from GitHub repo**.
4. Selecione o repositório do projeto e autorize o Railway se pedir.
5. Railway vai detectar o app e criar um serviço.

### 3. Configurar Build e Start no Railway

No serviço do projeto no Railway:

1. Abra **Settings** (ou **Variables**).
2. Em **Build Command** use:
   ```bash
   npm run build
   ```
3. Em **Start Command** use:
   ```bash
   npm run start
   ```
4. Em **Root Directory** deixe em branco (raiz do repositório).
5. Em **Output Directory** (se existir) deixe como `dist` (saída do Vite).

*(Se o Railway já preencher Build/Start automaticamente, confira se estão assim.)*

### 4. Variáveis de ambiente no Railway

1. No mesmo serviço, vá em **Variables** (ou **Settings > Environment**).
2. Adicione:
   - `VITE_SUPABASE_URL` = URL do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY` = chave anon do Supabase.

Como o Vite embute variáveis `VITE_*` no build, **é obrigatório** que essas duas variáveis estejam definidas no momento do **build** no Railway (não só no runtime). No Railway isso costuma ser garantido ao colocá-las em **Variables** do serviço.

### 5. Domínio e redeploy

1. Em **Settings**, em **Networking**, gere um **Public Domain** (ex.: `rio-malhas-compras.up.railway.app`).
2. Após salvar as variáveis e o domínio, o Railway faz um novo deploy. Quando terminar, acesse o link gerado.

---

## Resumo do fluxo da aplicação

- **Tela inicial:** Logo “Rio Malhas Tecidos” em azul (#002395); após 2 segundos, redireciona para `/lista-compras`.
- **Lista de compras:** Adicionar, editar e remover itens; cada item tem um checkbox.
- **Checkbox marcado (comprado):** O item é exibido riscado e é criado um registro em `estatisticas_vendas` no Supabase (nome do item, data/hora da compra).

---

## Estrutura do projeto

```
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── supabase/
│   └── schema.sql          # SQL para criar tabelas no Supabase
└── src/
    ├── main.jsx
    ├── App.jsx             # Rotas (Home, ListaCompras)
    ├── index.css           # Tailwind
    ├── lib/
    │   └── supabase.js     # Cliente Supabase (env)
    └── pages/
        ├── Home.jsx        # Logo + redirect 2s
        └── ListaCompras.jsx # CRUD + checkbox + estatísticas
```

---

## Scripts

| Comando       | Descrição                |
|---------------|--------------------------|
| `npm run dev` | Desenvolvimento (Vite)   |
| `npm run build` | Build de produção      |
| `npm run start` | Servir build (ex.: Railway) |
| `npm run preview` | Preview do build local |
